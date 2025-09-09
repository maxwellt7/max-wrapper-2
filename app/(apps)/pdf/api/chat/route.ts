import { NextRequest, NextResponse } from "next/server";
import { UIMessage as VercelChatMessage, streamText } from "ai";
import { createClient } from "@/lib/utils/supabase/server";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { Document } from "@langchain/core/documents";
import { RunnableSequence } from "@langchain/core/runnables";
import {
  BytesOutputParser,
  StringOutputParser,
} from "@langchain/core/output_parsers";
import { toolConfig } from "@/app/(apps)/pdf/toolConfig";
import { revalidateTag } from "next/cache";

export const runtime = "edge";

/**
 * Combines multiple document chunks into a single context string
 */
const combineDocumentsFn = (docs: Document[]) => {
  const serializedDocs = docs.map((doc) => doc.pageContent);
  return serializedDocs.join("\n\n");
};

/**
 * Formats chat history into a standardized string format
 */
const formatVercelMessages = (chatHistory: VercelChatMessage[]) => {
  const formattedDialogueTurns = chatHistory.map((message) => {
    // Extract text from parts for v5 compatibility
    const textContent = message.parts
      ?.filter((part) => part.type === "text")
      .map((part) => (part as any).text)
      .join("")
      || "";
      
    if (message.role === "user") {
      return `Human: ${textContent}`;
    } else if (message.role === "assistant") {
      return `Assistant: ${textContent}`;
    } else {
      return `${message.role}: ${textContent}`;
    }
  });
  return formattedDialogueTurns.join("\n");
};

/**
 * Template for condensing follow-up questions into standalone queries
 */
const CONDENSE_QUESTION_TEMPLATE = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question, in its original language.

<chat_history>
  {chat_history}
</chat_history>

Follow Up Input: {question}
Standalone question:`;
const condenseQuestionPrompt = PromptTemplate.fromTemplate(
  CONDENSE_QUESTION_TEMPLATE
);

/**
 * Template for generating answers based on context and chat history
 */
const ANSWER_TEMPLATE = `You are a smart AI assistant.

Answer the question based only on the following context and chat history:
<context>
  {context}
</context>

<chat_history>
  {chat_history}
</chat_history>

Question: {question}
`;
const answerPrompt = PromptTemplate.fromTemplate(ANSWER_TEMPLATE);

export async function POST(req: NextRequest) {
  try {
    // Extract request data and prepare message context
    const body = await req.json();
    const { messages, documentId } = body;
    const previousMessages = messages.slice(
      -toolConfig.messagesToInclude! - 1,
      -1
    );
    const currentMessage = messages[messages.length - 1];
    // Extract text from parts for v5 compatibility
    const currentMessageContent = currentMessage.parts
      ?.filter((part: any) => part.type === "text")
      .map((part: any) => part.text)
      .join("")
      || currentMessage.content || "";

    // Initialize Supabase client and verify user
    const client = await createClient();
    const {
      data: { user },
    } = await client.auth.getUser();

    const userId = user?.id;
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Check if the document has an existing conversation
    const { data: document, error: documentError } = await client
      .from("pdf_documents")
      .select("conversation_id")
      .eq("id", documentId)
      .single();

    if (documentError) throw documentError;

    let chatId = document.conversation_id;

    // Create a new conversation if one does not exist
    if (!chatId) {
      const { data: newConversation, error: conversationError } = await client
        .from("conversations")
        .insert({
          conversation: [],
          model_used: toolConfig.aiModel,
          user_id: userId,
          type: "pdf",
        })
        .select()
        .single();

      if (conversationError) throw conversationError;
      chatId = newConversation.id;
      await client
        .from("pdf_documents")
        .update({ conversation_id: chatId })
        .eq("id", documentId);
    }

    // Create the LangChain Chat model instance (streaming enabled)
    const model = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
      modelName: toolConfig.aiModel,
      temperature: 0,
      streaming: true,
      verbose: true,
    });

    // Set up vector retrieval (limit to top 4 results)
    const vectorstore = new SupabaseVectorStore(new OpenAIEmbeddings(), {
      client,
      tableName: "embeddings",
      queryName: "match_documents",
    });

    // Prepare a promise that will resolve with the relevant documents
    let resolveWithDocuments: (value: Document[]) => void;
    const documentPromise = new Promise<Document[]>((resolve) => {
      resolveWithDocuments = resolve;
    });

    const retriever = vectorstore.asRetriever({
      callbacks: [
        {
          handleRetrieverEnd(documents) {
            resolveWithDocuments(documents);
          },
        },
      ],
      filter: { document_id: documentId },
      k: 4, // return top 4 relevant document chunks
    });

    // Pipe retrieval results to a function that combines document chunks
    const retrievalChain = retriever.pipe(combineDocumentsFn);

    // Build the chain to first generate a standalone question then answer it.
    const standaloneQuestionChain = RunnableSequence.from([
      condenseQuestionPrompt,
      model,
      new StringOutputParser(),
    ]);
    const answerChain = RunnableSequence.from([
      {
        context: RunnableSequence.from([
          (input) => input.question,
          retrievalChain,
        ]),
        chat_history: (input) => input.chat_history,
        question: (input) => input.question,
      },
      answerPrompt,
      model,
    ]);
    const conversationalRetrievalQAChain = RunnableSequence.from([
      {
        question: standaloneQuestionChain,
        chat_history: (input) => input.chat_history,
      },
      answerChain,
      new BytesOutputParser(),
    ]);

    // --- Step 1: Run the LangChain retrieval/answer chain and accumulate its answer ---
    let aiResponse = "";
    const chainStream = await conversationalRetrievalQAChain.stream({
      question: currentMessageContent,
      chat_history: formatVercelMessages(previousMessages),
    });
    const reader = chainStream.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      aiResponse += decoder.decode(value);
    }

    // --- Step 2: Ensure the vector retrieval has completed ---
    const documents = await documentPromise;
    const serializedSources = Buffer.from(
      JSON.stringify(
        documents.map((doc) => {
          return {
            pageContent: doc.pageContent.slice(0, 50) + "...",
            metadata: doc.metadata,
          };
        })
      )
    ).toString("base64");

    // --- Step 3: Update the conversation with the context-aware answer ---
    messages.push({
      role: "assistant",
      content: aiResponse,
    });
    await client
      .from("conversations")
      .update({
        conversation: messages,
        updated_at: new Date().toISOString(),
      })
      .eq("id", chatId)
      .select();

    // Revalidate the conversation cache
    revalidateTag(`pdf_conversation_${chatId}`);

    return NextResponse.json(
      {
        id: chatId,
        role: "assistant",
        content: aiResponse,
        createdAt: Date.now(),
      },
      {
        headers: {
          "x-message-index": (previousMessages.length + 1).toString(),
          "x-sources": serializedSources,
        },
      }
    );
  } catch (e: any) {
    console.error("Error in API:", e);
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
