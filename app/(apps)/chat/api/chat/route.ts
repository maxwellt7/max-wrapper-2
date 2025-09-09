/**
 * Chat API Route Handler
 * This file manages the chat functionality, including message processing, document creation,
 * web information retrieval, and credit system management.
 *
 * Main Features:
 * 1. Process chat messages between user and AI
 * 2. Create and update documents based on chat interactions
 * 3. Browse the internet for information
 * 4. Save chat history and manage chat sessions
 * 5. Credit System Management:
 *    - Track and manage user credits
 *    - Handle premium vs free model access
 *    - Control access to premium features
 *    - Automatic credit deduction
 *
 * Credit System Flow:
 * 1. Check user's available credits
 * 2. Validate feature access based on credits
 * 3. Calculate costs for:
 *    - Premium AI models
 *    - Web browsing feature
 * 4. Deduct credits for premium usage
 * 5. Return credit status in response
 *
 * Available Endpoints:
 * - POST /api/chat: Process new messages, generate AI responses, handle credits
 * - DELETE /api/chat?id={chatId}: Delete an entire chat session
 */

import {
  convertToModelMessages,
  UIMessage,
  streamText,
  CoreUserMessage,
  generateText,
  CoreMessage,
  ModelMessage,
  stepCountIs,
} from "ai";
import { createClient } from "@/lib/utils/supabase/server";
import { getChatById } from "@/lib/db/cached-queries";
import {
  saveChat,
  saveMessages,
  deleteChatById,
  reduceUserCredits,
} from "@/lib/db/mutations";
import { MessageRole } from "@/lib/types/supabase";
import {
  generateUUID,
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from "@/lib/ai/chat";
import { createSystemPrompt } from "@/app/(apps)/chat/prompt";
import { createTools, allTools, ToolsReturn } from "@/app/(apps)/chat/tools/";
import { customModel } from "@/lib/ai/ai-utils";
import { getUserCreditsQuery } from "@/lib/db/queries/general";
import {
  canUseConfiguration,
  FREE_MODELS,
} from "@/app/(apps)/chat/usage-limits";
import { AIModel, AI_MODEL_DISPLAY } from "@/lib/ai/models";

/**
 * Configuration Settings
 * - maxDuration: Maximum time (in seconds) allowed for API response
 * - customMiddleware: Custom settings for the AI model behavior
 */
export const maxDuration = 60;

/**
 * Generates a title for a new chat based on the user's first message
 * @param message - The first message from the user
 * @returns A generated title (max 80 characters)
 */
async function generateTitleFromUserMessage({
  message,
  modelId = "gpt-4o-mini",
}: {
  message: CoreUserMessage;
  modelId?: string;
}) {
  console.log("Generating title using model:", modelId);
  const { text: title } = await generateText({
    model: customModel(modelId, { isBrowseEnabled: false }),
    system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
    prompt: JSON.stringify(message),
  });

  return title;
}

/**
 * Gets the current authenticated user
 * @throws Error if user is not authenticated
 */
async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}

/**
 * Formats message content for database storage based on message type
 * Handles different message formats:
 * - User messages: Stored as plain text
 * - Tool messages: Stored as formatted tool results
 * - Assistant messages: Stored as text and tool calls
 */
function formatMessageContent(message: CoreMessage): string {
  // For user messages, store as plain text
  if (message.role === "user") {
    return typeof message.content === "string"
      ? message.content
      : JSON.stringify(message.content);
  }

  // For tool messages in v5
  if (message.role === "tool") {
    return JSON.stringify({
      type: "tool-result",
      toolCallId: (message as any).toolCallId,
      toolName: (message as any).toolName,
      result: message.content,
    });
  }

  // For assistant messages in v5
  if (message.role === "assistant") {
    const content = message.content;
    
    // If content is a string, return it as text
    if (typeof content === "string") {
      return JSON.stringify([{
        type: "text",
        text: content
      }]);
    }
    
    // If content is an array (v4 style), handle it
    if (Array.isArray(content)) {
      return JSON.stringify(
        content.map((item: any) => {
          if (item.type === "text") {
            return {
              type: "text",
              text: item.text
            };
          }
          if (item.type === "tool-call") {
            return {
              type: "tool-call",
              toolCallId: item.toolCallId,
              toolName: item.toolName,
              args: item.args
            };
          }
          return item;
        })
      );
    }
    
    // Otherwise return as-is
    return JSON.stringify(content);
  }

  return "";
}

/**
 * Main POST Handler
 * Processes incoming chat messages and generates AI responses
 *
 * Flow:
 * 1. Validates user authentication
 * 2. Creates or retrieves chat session
 * 3. Checks credit balance and feature access
 * 4. Processes message with AI
 * 5. Handles tool interactions (documents, internet)
 * 6. Manages credit deductions for premium features
 * 7. Saves chat history
 *
 * Credit Headers:
 * Returns 'x-credit-usage' with:
 * - cost: Credits used
 * - remaining: Available balance
 * - features: Premium features accessed
 *
 * @param request Contains chat ID, messages, and feature settings
 */
export async function POST(request: Request) {
  const {
    id,
    messages,
    selectedModelId,
    isBrowseEnabled,
  }: {
    id: string;
    messages: Array<UIMessage>;
    selectedModelId?: string;
    isBrowseEnabled: boolean;
  } = await request.json();

  console.log("Chat route params:", {
    id,
    selectedModelId,
    isBrowseEnabled,
    messageCount: messages.length,
  });

  const user = await getUser();

  if (!user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Get the most recent user message for title generation
  const modelMessages = convertToModelMessages(messages);
  const userMessage = getMostRecentUserMessage(modelMessages);

  if (!userMessage || userMessage.role !== "user") {
    return new Response("No user message found", { status: 400 });
  }

  const supabase = await createClient();
  const credits = await getUserCreditsQuery(supabase, user.id);
  // Declare streamingData early, before the try block
  // const streamingData = new StreamData(); // Deprecated

  // Initial chat title logic (outside the main streaming response)
  let initialChatTitle = "New Chat";
  let isNewChat = false;

  try {
    // Chat title generation logic
    const chat = await getChatById(id);

    if (!chat) {
      const title = await generateTitleFromUserMessage({
        message: userMessage as CoreUserMessage,
        modelId: selectedModelId,
      });
      await saveChat({ id, userId: user.id, title });
      // Append chatReady signal AFTER saving the chat
      // streamingData.append({ chatReady: true }); // Moved to UI message stream
      initialChatTitle = title;
      isNewChat = true;
    } else if (chat.user_id !== user.id) {
      return new Response("Unauthorized", { status: 401 });
    } else if (chat.title === "New Chat") {
      // Update the title if it's still the default
      const title = await generateTitleFromUserMessage({
        message: userMessage as CoreUserMessage,
        modelId: selectedModelId,
      });
      await supabase
        .from("chats")
        .update({ title })
        .eq("id", id)
        .eq("user_id", user.id);
    }

    // Save the initial user message immediately
    await saveMessages({
      chatId: id,
      messages: [
        {
          id: generateUUID(),
          chat_id: id,
          role: userMessage.role as MessageRole,
          content: formatMessageContent(userMessage),
          created_at: new Date().toISOString(),
        },
      ],
    });

    const modelToUse = selectedModelId || "gpt-4o-mini";

    // Create tools and get active tool names
    const tools = createTools(user.id, modelToUse, isBrowseEnabled);
    const toolNames = Object.keys(tools);
    
    // Use all available tool names as active tools
    const activeTools = toolNames;

    console.log("Active tools:", activeTools, "Browse enabled:", isBrowseEnabled);

    // Credit check and usage
    const usageCheck = canUseConfiguration(credits, {
      modelId: selectedModelId as AIModel,
      isBrowseEnabled,
    });

    if (!usageCheck.canUse) {
      return new Response(
        JSON.stringify({
          error: "Insufficient credits",
          message: usageCheck.reason,
        }),
        { status: 402, headers: { "Content-Type": "application/json" } }
      );
    }

    // Calculate headers before creating the response stream
    const headers: Record<string, string> = {};
    if (usageCheck.requiredCredits > 0) {
      try {
        await reduceUserCredits(user.email!, usageCheck.requiredCredits);
        const updatedCredits = await getUserCreditsQuery(supabase, user.id);
        const creditUsageData = {
          cost: usageCheck.requiredCredits,
          remaining: updatedCredits,
          features: [
            !FREE_MODELS.includes(selectedModelId as any)
              ? "Premium Model"
              : null,
            isBrowseEnabled ? "Web Browsing" : null,
          ].filter(Boolean),
        };
        headers["x-credit-usage"] = JSON.stringify(creditUsageData);
      } catch (creditError) {
        console.error(
          "Failed to reduce credits or fetch updated count:",
          creditError
        );
        headers["x-credit-error"] = "Failed to process credits";
      }
    }

    const systemPrompt = createSystemPrompt(isBrowseEnabled);
    
    console.log("[CHAT ROUTE] Tool names in tools object:", Object.keys(tools));
    
    const result = streamText({
      model: customModel(modelToUse, { isBrowseEnabled }),
      system: systemPrompt,
      messages: modelMessages,
      activeTools,
      tools: tools as any,
      onFinish: async ({ response }) => {
        // Save messages after completion
        if (user && user.id && response) {
          try {
            const responseMessages = response.messages || [];
            
            // Log tool results to debug web search
            const toolMessages = responseMessages.filter(m => m.role === 'tool');
            console.log('[CHAT ROUTE] Tool messages found:', toolMessages.length);
            toolMessages.forEach((msg) => {
              console.log('[CHAT ROUTE] Tool message:', {
                role: msg.role,
                toolName: (msg as any).toolName,
                content: typeof msg.content === 'string' ? 
                  msg.content.substring(0, 200) : msg.content
              });
            });
            
            // Also log assistant messages to see tool calls
            const assistantMessages = responseMessages.filter(m => m.role === 'assistant');
            assistantMessages.forEach((msg) => {
              if (Array.isArray(msg.content)) {
                const toolCalls = msg.content.filter((c: any) => c.type === 'tool-call');
                if (toolCalls.length > 0) {
                  console.log('[CHAT ROUTE] Assistant tool calls:', toolCalls);
                }
              }
            });
            
            const responseMessagesWithoutIncompleteToolCalls =
              sanitizeResponseMessages(responseMessages);

            // --- DE-DUPLICATION START ---
            const uniqueMessagesMap = new Map<string, any>();
            responseMessagesWithoutIncompleteToolCalls.forEach((message) => {
              // Format content first to create a reliable unique key
              const formattedContent = formatMessageContent(message);
              const uniqueKey = `${message.role}-${JSON.stringify(
                formattedContent
              )}`;

              if (!uniqueMessagesMap.has(uniqueKey)) {
                // Generate ID only for unique messages before adding to map
                const messageId = generateUUID();
                uniqueMessagesMap.set(uniqueKey, {
                  id: messageId,
                  chat_id: id,
                  role: message.role as MessageRole,
                  content: formattedContent,
                  created_at: new Date().toISOString(),
                });
              }
            });

            // Extract the unique message objects from the map
            const finalMessagesToSave = Array.from(uniqueMessagesMap.values());

            // Save only the unique messages
            await saveMessages({
              chatId: id,
              messages: finalMessagesToSave,
            });
          } catch (error) {
            console.error("Failed to save chat:", error);
          }
        }
      }
    });

    // Special handling for provider-specific search features
    const isOpenAIResponsesAPI = modelToUse.startsWith("gpt") || modelToUse.startsWith("o4");
    const isGoogleModel = modelToUse.startsWith("gemini");
    
    if (isOpenAIResponsesAPI && isBrowseEnabled && (result as any).sources) {
      console.log('[CHAT ROUTE] OpenAI Responses API detected with sources');
      
      // Wait for the sources to be available
      (result as any).sources.then((sources: any) => {
        console.log('[CHAT ROUTE] OpenAI sources available:', sources);
      }).catch((error: any) => {
        console.error('[CHAT ROUTE] Failed to get OpenAI sources:', error);
      });
    }
    
    if (isGoogleModel && isBrowseEnabled) {
      console.log('[CHAT ROUTE] Google model with search detected');
      // Google might include grounding metadata in the response
      if ((result as any).experimental_providerMetadata) {
        console.log('[CHAT ROUTE] Google provider metadata:', (result as any).experimental_providerMetadata);
      }
    }
    
    // Regular response - the UI will handle tool results
    return result.toUIMessageStreamResponse({
      headers,
      originalMessages: messages,
      messageMetadata: ({ part }) => {
        // Send credit usage with finish event
        if (part.type === 'finish' && headers["x-credit-usage"]) {
          try {
            const creditUsage = JSON.parse(headers["x-credit-usage"] as string);
            return { creditUsage };
          } catch (e) {
            console.error('Failed to parse credit usage', e);
          }
        }
      }
    });
  } catch (error) {
    console.error("Error in chat route:", error);
    // This catch block might need adjustment as the main logic is now within UI message stream
    // For now, let's keep the existing fallback for 'Chat ID already exists'
    if (error instanceof Error && error.message === "Chat ID already exists") {
      // This case should be less likely now with the check moved up, but keep as fallback
      console.warn(
        "Caught 'Chat ID already exists' outside main stream logic - check flow."
      );
      return new Response("Conflict: Chat ID potentially already exists", {
        status: 409,
      });
    } else {
      // For other errors caught *before* UI message stream
      return new Response("Internal Server Error", { status: 500 });
    }
  }
}

/**
 * DELETE Handler
 * Removes an entire chat session and its messages
 *
 * Security:
 * - Verifies user ownership of chat
 * - Only allows deletion of user's own chats
 *
 * @param request Contains chat ID to delete
 */
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get("id");

  if (!chatId) {
    return new Response("Chat ID is required", { status: 400 });
  }

  const user = await getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // First verify that the chat belongs to the user
    const chat = await getChatById(chatId);
    if (!chat || chat.user_id !== user.id) {
      return new Response("Chat not found or unauthorized", { status: 403 });
    }

    // Delete the chat (messages will be cascade deleted due to foreign key constraint)
    await deleteChatById(chatId, user.id);

    return new Response("Chat deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Failed to delete chat:", error);
    return new Response("Failed to delete chat", { status: 500 });
  }
}