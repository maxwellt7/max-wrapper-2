//hello
//export evertything here

// Re-export core types and schemas
export * from "./types";

// Import tool factory functions
import { createDocumentToolFactory } from "./createDocument";
import { updateDocumentToolFactory } from "./updateDocument";
import { suggestAppsToolFactory } from "./suggestApps";
import { getNativeSearchTool } from "./nativeSearch";

// Import shared types
import type {
  AllowedTools,
  ToolsReturn,
  BaseTools,
} from "./types";

// Define tool categories (can be used for filtering)
export const canvasTools: AllowedTools[] = ["createDocument", "updateDocument"];
export const appTools: AllowedTools[] = ["suggestApps"];
export const allTools: AllowedTools[] = [
  ...canvasTools,
  ...appTools,
];

/**
 * Master Factory Function for Creating AI Tools
 *
 * This function assembles the complete set of tools based on the provided context
 * and configuration (like whether browsing is enabled).
 * It uses the individual tool factory functions to create each tool definition,
 * injecting the necessary context (userId, modelId).
 *
 * @param userId - The ID of the user performing the action.
 * @param modelId - The ID of the AI model being used.
 * @param isBrowseEnabled - Flag indicating if the browseInternet tool should be included.
 * @returns A ToolsReturn object containing the configured tool definitions.
 */
export function createTools(
  userId: string,
  modelId: string,
  isBrowseEnabled: boolean
): ToolsReturn {

  // Create base tools using their factories, passing the context
  const baseTools: BaseTools = {
    createDocument: createDocumentToolFactory(userId, modelId),
    updateDocument: updateDocumentToolFactory(userId, modelId),
    suggestApps: suggestAppsToolFactory(),
  };

  // If browsing is not enabled, return only the base tools
  if (!isBrowseEnabled) {
    return baseTools;
  }

  // Get native search tool for the model
  const nativeSearchTool = getNativeSearchTool(modelId);
  console.log('[TOOLS] Native search tool for', modelId, ':', nativeSearchTool);
  
  if (nativeSearchTool) {
    // Special handling for Google models - they can't mix function tools with provider-defined tools
    if (modelId.startsWith("gemini")) {
      console.log('[TOOLS] Google model detected - returning only native search tool');
      // Return an object that only has the native search tool
      // This avoids the type error about missing base tools
      return nativeSearchTool as any;
    }
    
    // For other models, combine base tools with native search
    const finalTools = {
      ...baseTools,
      ...nativeSearchTool
    };
    console.log('[TOOLS] Final tools with search:', Object.keys(finalTools));
    return finalTools as ToolsReturn;
  }

  // If no native search available, return base tools
  return baseTools;
}
