import { z } from 'zod';
import { streamText } from "ai";
import { getDocumentById } from "@/lib/db/cached-queries";
import { saveDocument } from "@/lib/db/mutations";
import { customModel } from "@/lib/ai/ai-utils";
import { ToolDefinition } from "./types";

// Define the schema for the updateDocument tool parameters
const updateDocumentSchema = z.object({
  id: z.string().describe("The ID of the document to update."),
  description: z
    .string()
    .describe(
      "A description of the changes that need to be made to the document content."
    ),
});

// Type for the parameters expected by the execute function
type UpdateDocumentParams = z.infer<typeof updateDocumentSchema>;

/**
 * Factory function for the Document Update Tool
 * Creates a ToolDefinition for updating documents, injecting necessary context.
 *
 * @param streamWriter - Optional DataStreamWriter for UI updates.
 * @param userId - The ID of the user performing the action.
 * @param modelId - The ID of the AI model to use for content generation.
 * @returns A ToolDefinition object for the updateDocument tool.
 */
export function updateDocumentToolFactory(
  userId: string,
  modelId: string
): ToolDefinition {
  return {
    description:
      "Update an existing document based on a description of the desired changes.",
    inputSchema: updateDocumentSchema,
    execute: async (params: UpdateDocumentParams): Promise<any> => {
      const { id, description } = params;
      console.log(
        "Executing updateDocument tool for doc ID:",
        id,
        "using model:",
        modelId
      );

      try {
        // 1. Fetch the existing document
        const document = await getDocumentById(id);

        if (!document) {
          return { error: `Document with ID \"${id}\" not found.` };
        }
        // Basic ownership check (can be enhanced)
        if (document.user_id !== userId) {
          return { error: "Unauthorized to update this document." };
        }

        const { content: currentContent, title } = document;

        if (!currentContent) {
          console.warn(
            `Document ${id} has empty content. Updating based on description only.`
          );
          // Optionally, could generate content from scratch based on description here
        }

        let draftText: string = "";

        // UI updates handled by v5 architecture

        // 2. Generate updated content using AI
        const { fullStream } = streamText({
          model: customModel(modelId),
          system:
            "You are a helpful writing assistant. Update the provided text based on the user's description. Preserve the original tone and style where appropriate unless instructed otherwise. Respond only with the updated text.",
          // Pass current content if available, otherwise just use the description
          messages: [
            {
              role: "user",
              content: currentContent 
                ? `Update description: ${description}\n\nCurrent content: ${currentContent}`
                : `Update description: ${description}`
            },
          ],
        });

        // 3. Collect generated text
        for await (const delta of fullStream) {
          if (delta.type === "text-delta") {
            draftText += delta.textDelta;
          }
        }

        // Completion handled by v5 architecture

        // 4. Save updated document
        await saveDocument({
          id,
          title: title || "Untitled Document", // Keep original title or default
          content: draftText,
          userId, // Ensure userId is passed for potential RLS policies
        });

        // 5. Return success confirmation
        return {
          id, // Document ID
          title: title || "Untitled Document",
          content: "The document has been updated successfully.",
        };
      } catch (error) {
        console.error(
          `Error executing updateDocument tool for doc ID ${id}:`,
          error
        );
        return {
          error: `Failed to update document: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        };
      }
    },
  };
}
