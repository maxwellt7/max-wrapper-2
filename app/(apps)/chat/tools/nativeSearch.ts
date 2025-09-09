import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { AI_MODEL_DISPLAY } from "@/lib/ai/models";

/**
 * Get native search tool for the model provider
 * Returns the appropriate search tool based on the model ID
 */
export function getNativeSearchTool(modelId: string, _options?: {
  userLocation?: {
    country?: string;
    region?: string;
    city?: string;
  };
}) {
  // Check if the model supports internet
  const modelInfo = AI_MODEL_DISPLAY[modelId];
  
  if (!modelInfo?.hasInternet) {
    return null;
  }

  // Determine provider from model ID
  if (modelId.startsWith("gpt") || modelId.startsWith("o4")) {
    // OpenAI models use webSearchPreview
    return {
      web_search_preview: openai.tools.webSearchPreview({})
    };
  }
  
  // Remove web search for Anthropic - only use for OpenAI and Google
  // if (modelId.startsWith("claude")) {
  //   return null;
  // }
  
  if (modelId.startsWith("gemini")) {
    // Check if Google has search tool
    if ((google as any).tools?.googleSearch) {
      return {
        google_search: (google as any).tools.googleSearch({})
      };
    }
  }

  return null;
}

/**
 * Check if we should remove the browseInternet tool
 * (when using native search for supported providers)
 */
export function shouldUseNativeSearch(modelId: string): boolean {
  const modelInfo = AI_MODEL_DISPLAY[modelId];
  return modelInfo?.hasInternet === true;
}