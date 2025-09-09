// wrapLanguageModel is removed in v5, models are returned directly
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { groq } from "@ai-sdk/groq";
import { xai } from "@ai-sdk/xai";
import { deepseek } from "@ai-sdk/deepseek";
import { google } from "@ai-sdk/google";
// Middleware is handled differently in v5

type ModelProvider =
  | "openai"
  | "anthropic"
  | "groq"
  | "xai"
  | "deepseek"
  | "google"
  | "perplexity";

// Helper to determine provider from model ID
function getProviderFromModelId(modelId: string): ModelProvider {
  if (modelId.startsWith("gpt") || modelId.startsWith("o4")) return "openai";
  if (modelId.startsWith("claude")) return "anthropic";
  if (
    modelId.startsWith("llama") ||
    modelId.startsWith("meta-llama") ||
    modelId.startsWith("gemma")
  )
    return "groq";
  if (modelId.startsWith("grok")) return "xai";
  if (modelId.startsWith("deepseek")) return "deepseek";
  if (modelId.startsWith("gemini")) return "google";
  return "openai"; // fallback
}

/**
 * Get model instance based on provider and model name
 */
function getModelInstance(
  provider: ModelProvider,
  modelName: string,
  _options: any = {}
) {
  switch (provider) {
    case "openai":
      return openai(modelName);
    case "anthropic":
      return anthropic(modelName);
    case "groq":
      return groq(modelName);
    case "xai":
      return xai(modelName);
    case "deepseek":
      return deepseek(modelName);
    case "google":
      return google(modelName);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

/**
 * Creates a customized AI model instance with specific settings
 */
export function customModel(modelId: string, options?: any) {
  const provider = getProviderFromModelId(modelId);
  console.log(
    `Creating model instance for ${modelId} using ${provider} provider`,
    options
  );

  // Get provider-specific options
  let providerOptions = options?.[provider] || {};
  
  // Add search grounding for supported providers when browse is enabled
  let modelOptions = { ...providerOptions };
  
  if (options?.isBrowseEnabled) {
    switch (provider) {
      case "google":
        // Google uses searchGrounding
        modelOptions = {
          ...modelOptions,
          searchGrounding: true
        };
        break;
      case "openai":
        // OpenAI MUST use responses API for web search
        console.log(`OpenAI web search enabled - using responses API for ${modelId}`);
        return openai.responses(modelId);
      case "anthropic":
        // Anthropic will use their web search through function calling
        // No specific options needed here
        break;
    }
  }

  const modelInstance = getModelInstance(
    provider,
    modelId,
    modelOptions
  );

  // In v5, wrapLanguageModel expects only the model as parameter
  // Middleware is handled differently
  console.log(`Returning model instance for ${modelId}.`);
  return modelInstance;
}
