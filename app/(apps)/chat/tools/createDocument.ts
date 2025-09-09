import { z } from 'zod';
import { streamText } from "ai";
import { generateUUID } from "@/lib/ai/chat";
import { saveDocument } from "@/lib/db/mutations";
import { customModel } from "@/lib/ai/ai-utils";
import { ToolDefinition } from "./types";

// Define the schema for the createDocument tool parameters
const createDocumentSchema = z.object({
  title: z.string().describe("The title for the new document."),
});

// Type for the parameters expected by the execute function
type CreateDocumentParams = z.infer<typeof createDocumentSchema>;

/**
 * Factory function for the Document Creation Tool
 * Creates a ToolDefinition for creating documents, injecting necessary context.
 *
 * @param streamWriter - Optional DataStreamWriter for UI updates.
 * @param userId - The ID of the user performing the action.
 * @param modelId - The ID of the AI model to use for content generation.
 * @returns A ToolDefinition object for the createDocument tool.
 */
export function createDocumentToolFactory(
  userId: string,
  modelId: string
): ToolDefinition {
  return {
    description:
      "Create a document based on a given title for a writing activity. Generates content.",
    inputSchema: createDocumentSchema,
    // This execute function now has the correct signature expected by the AI SDK
    execute: async (params: CreateDocumentParams): Promise<any> => {
      const { title } = params;
      console.log("Executing createDocument tool with model:", modelId);
      const id = generateUUID();
      const toolCallId = generateUUID(); // Generate a unique ID for this specific tool call
      let draftText: string = "";

      // Tools no longer handle UI updates in v5

      try {
        // Use streamText to generate content based on the title
        const { fullStream } = streamText({
          model: customModel(modelId),
          system:
            "Write about the given topic. Markdown is supported. Use headings wherever appropriate.",
          prompt: title,
        });

        // Collect the generated text
        for await (const delta of fullStream) {
          if (delta.type === "text-delta") {
            draftText += delta.textDelta;
          }
        }

        // Tool completion handled by v5 architecture

        // Save the generated document to the database (userId is closed over)
        await saveDocument({ id, title, content: draftText, userId });

        // Return metadata about the successful operation
        return {
          toolCallId, // Include the tool call ID in the result
          id, // Document ID
          title, // Document Title
          content: `A document titled \"${title}\" was created successfully and is now visible to the user.`, // Confirmation message
        };
      } catch (error) {
        console.error("Error executing createDocument tool:", error);
        // Return an error object if something goes wrong
        return {
          toolCallId,
          error: `Failed to create document: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        };
      }
    },
  };
}
