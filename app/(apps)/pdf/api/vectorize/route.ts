import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/utils/supabase/server";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "langchain/document";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { authMiddleware } from "@/lib/middleware/authMiddleware";
import { revalidateTag } from "next/cache";

/**
 * API Route: Handles PDF vectorization for semantic search capabilities.
 *
 * **Features:**
 * - Converts PDF content into vector embeddings using OpenAI
 * - Splits documents into manageable chunks for better search
 * - Stores embeddings in Supabase for vector similarity search
 * - Maintains page numbers and document references
 * - Sanitizes text to remove problematic characters
 * - Revalidates cache tags for UI consistency
 *
 * **Process:**
 * 1. Authenticates the user
 * 2. Fetches PDF from provided URL
 * 3. Splits document into chunks using LangChain
 * 4. Generates embeddings using OpenAI
 * 5. Stores embeddings with metadata in Supabase
 * 6. Revalidates related cache tags
 *
 * **Technical Details:**
 * - Chunk size: 1000 characters
 * - Chunk overlap: 200 characters
 * - Uses RecursiveCharacterTextSplitter for intelligent splitting
 * - Maintains document-chunk-page relationships
 *
 * @param {NextRequest} request - Contains fileUrl and documentId
 * @returns {Promise<NextResponse>} Confirmation of successful vectorization
 */

type DocumentMetadata = {
  document_id: any;
  page: number;
};

/**
 * Sanitizes text by removing problematic characters
 * - Removes null characters
 * - Removes non-printable ASCII characters
 * - Preserves common whitespace characters
 */
function sanitizeText(text: string): string {
  return text
    .replace(/\u0000/g, "") // Remove null characters
    .replace(/[^\x20-\x7E\n\r\t]/g, "") // Remove non-printable ASCII characters
    .trim();
}

/**
 * Batch size for processing and inserting embeddings
 * - Prevents Supabase statement timeout errors
 * - Reduces memory usage for large documents
 * - Recommended: 100 chunks per batch for optimal performance
 * - Adjust based on your Supabase plan and document size
 */
const BATCH_SIZE = 100;

export async function POST(request: NextRequest) {
  // Check if the user is authenticated
  const authResponse = await authMiddleware(request);
  if (authResponse.status === 401) return authResponse;

  const supabase = await createClient();
  const { fileUrl, documentId } = await request.json();
  const userId = (request as any).user.id; // Get userId from middleware-enhanced request

  if (!fileUrl || typeof fileUrl !== "string") {
    return NextResponse.json(
      { error: "A valid file URL is required" },
      { status: 400 }
    );
  }

  if (!documentId) {
    return NextResponse.json(
      { error: "Document ID is required" },
      { status: 400 }
    );
  }

  async function fetchDocumentsFromUrl(url: string) {
    try {
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`Failed to fetch PDF: ${response.statusText}`);

      const buffer = await response.arrayBuffer();

      // Load the PDF with improved parsing (splitting by page)
      const loader = new PDFLoader(new Blob([buffer]), {
        splitPages: true,
        parsedItemSeparator: "",
      });

      const rawDocs = await loader.load();

      // Set up the text splitter with additional separators to help preserve whole sentences/paragraphs
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
        separators: ["\n\n", "\n", " "], // try to break at natural boundaries
      });

      const splitDocs = await textSplitter.splitDocuments(rawDocs);

      // Filter out any chunks that are too short to be meaningful,
      // then create new Documents that include page number metadata.
      return splitDocs
        .filter((doc) => doc.pageContent.trim().length > 20)
        .map(
          (doc) =>
            new Document<DocumentMetadata>({
              pageContent: sanitizeText(doc.pageContent),
              metadata: {
                document_id: documentId,
                page: doc.metadata.loc?.pageNumber || 1,
              },
            })
        );
    } catch (error) {
      console.error("Error fetching documents from URL:", error);
      throw error;
    }
  }

  try {
    const documents = await fetchDocumentsFromUrl(fileUrl);
    const embeddings = new OpenAIEmbeddings();

    /**
     * Process and insert documents in batches to avoid Supabase timeouts
     *
     * Why batching is necessary:
     * 1. Supabase has a default statement timeout (typically 30s)
     * 2. Large PDFs can generate hundreds/thousands of embeddings
     * 3. Single transaction with many insertions can exceed timeout
     *
     * Batch processing:
     * - Splits documents into chunks of BATCH_SIZE
     * - Processes embeddings for each batch
     * - Inserts each batch separately into Supabase
     * - Continues even if document has hundreds of pages
     */
    for (let i = 0; i < documents.length; i += BATCH_SIZE) {
      const batch = documents.slice(i, i + BATCH_SIZE);

      // Generate embeddings for current batch only
      const batchEmbeddings = await embeddings.embedDocuments(
        batch.map((doc) => doc.pageContent)
      );

      // Prepare data for current batch
      const batchEmbeddingsData = batch.map((doc, index) => ({
        document_id: documentId,
        content: doc.pageContent,
        embedding: batchEmbeddings[index],
        metadata: doc.metadata,
      }));

      // Insert current batch to Supabase
      const { error: supabaseError } = await supabase
        .from("embeddings")
        .insert(batchEmbeddingsData);

      if (supabaseError) {
        console.error("Supabase insertion error:", supabaseError);
        throw supabaseError;
      }
    }

    // Revalidate cache tags
    revalidateTag(`pdf_document_${documentId}`);
    revalidateTag(`user_${userId}_pdf_documents`);

    return NextResponse.json({
      text: "Successfully embedded PDF",
      id: documentId,
    });
  } catch (error) {
    console.error("Error in POST function:", error);
    return NextResponse.json(
      { error: "Failed to ingest your data" },
      { status: 500 }
    );
  }
}
