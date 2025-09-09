// Define constants for provider logos
const LOGO_OPENAI = "/providers/openai.webp";
const LOGO_ANTHROPIC = "/providers/anthropic.jpeg";
const LOGO_META = "/providers/meta.jpeg";
const LOGO_GOOGLE = "/providers/google.svg";
const LOGO_XAI = "/providers/xai.png";
const LOGO_DEEPSEEK = "/providers/deepseek.png";

// Define the model interface with all possible properties
interface ModelInfo {
  name: string;
  logo: string;
  vision?: boolean;
  searchGrounding?: boolean;
  citations?: boolean;
  hasInternet?: boolean;
}

// Define the model display object with proper typing
export const AI_MODEL_DISPLAY: Record<string, ModelInfo> = {
  "gpt-5": {
    name: "GPT-5",
    logo: LOGO_OPENAI,
    vision: true,
    hasInternet: true,
  },
  "gpt-5-mini": {
    name: "GPT-5 mini",
    logo: LOGO_OPENAI,
    vision: true,
    hasInternet: true,
  },
  "gpt-5-nano": {
    name: "GPT-5 nano",
    logo: LOGO_OPENAI,
    vision: true,
    hasInternet: true,
  },
  "gpt-4o-mini": {
    name: "GPT-4o mini",
    logo: LOGO_OPENAI,
    vision: true,
    hasInternet: true,
  },
  "gpt-4o": {
    name: "GPT-4o",
    logo: LOGO_OPENAI,
    vision: true,
    hasInternet: true,
  },
  "o4-mini": {
    name: "o4 mini",
    logo: LOGO_OPENAI,
    vision: true,
    hasInternet: true,
  },
  "claude-sonnet-4-20250514": {
    name: "Claude 4 Sonnet",
    logo: LOGO_ANTHROPIC,
    vision: true,
  },
  "claude-opus-4-20250514": {
    name: "Claude Opus 4",
    logo: LOGO_ANTHROPIC,
    vision: true,
  },
  "claude-3-7-sonnet-20250219": {
    name: "Claude 3.7 Sonnet",
    logo: LOGO_ANTHROPIC,
    vision: true,
  },
  "meta-llama/llama-4-scout-17b-16e-instruct": {
    name: "Llama 4 Scout",
    logo: LOGO_META,
    vision: true,
  },
  "meta-llama/llama-4-maverick-17b-128e-instruct": {
    name: "Llama 4 Maverick",
    logo: LOGO_META,
    vision: true,
  },
  "gemini-2.5-pro": {
    name: "Gemini 2.5 Pro",
    logo: LOGO_GOOGLE,
    vision: true,
    searchGrounding: true,
    hasInternet: true,
  },
  "gemini-2.5-flash": {
    name: "Gemini 2.5 Flash",
    logo: LOGO_GOOGLE,
    vision: true,
    searchGrounding: true,
    hasInternet: true,
  },
  "grok-3-fast": {
    name: "Grok 3",
    logo: LOGO_XAI,
    vision: false,
  },
  "grok-3-mini-fast": {
    name: "Grok 3 Mini",
    logo: LOGO_XAI,
    vision: false,
  },
  "grok-4": {
    name: "Grok 4",
    logo: LOGO_XAI,
    vision: false,
  },
  "grok-code-fast-1": {
    name: "Grok Code Fast 1",
    logo: LOGO_XAI,
    vision: false,
  },
  "deepseek-chat": {
    name: "DeepSeek Chat",
    logo: LOGO_DEEPSEEK,
    vision: false,
  },
} as const;

// Get model IDs from the display object
export const AI_MODELS = Object.keys(AI_MODEL_DISPLAY) as Array<
  keyof typeof AI_MODEL_DISPLAY
>;

// Type for model IDs
export type AIModel = keyof typeof AI_MODEL_DISPLAY;

// Type for model display info
export type AIModelDisplayInfo = ModelInfo & {
  id: AIModel;
};

// List of models with their display info
export const availableModels: AIModelDisplayInfo[] = AI_MODELS.map((model) => ({
  id: model as AIModel,
  ...AI_MODEL_DISPLAY[model],
}));
