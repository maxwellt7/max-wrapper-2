/**
 * Image AI Types and Utilities
 * This file consolidates various types, configurations, and helper functions
 * for the Image AI component.
 */

import { z } from "zod";

// ============================================================================
// Provider Configuration Types and Constants
// ============================================================================

export type ProviderKey = "replicate";
export type ModelMode = "performance" | "quality";

/**
 * Configuration for AI providers, including display properties and available models
 */
export const PROVIDERS: Record<
  ProviderKey,
  {
    displayName: string;
    models: string[];
  }
> = {
  replicate: {
    displayName: "Replicate",
    models: [
      "black-forest-labs/flux-1.1-pro",
      "black-forest-labs/flux-1.1-pro-ultra",
      "black-forest-labs/flux-dev",
      "black-forest-labs/flux-pro",
      "black-forest-labs/flux-schnell",
      "ideogram-ai/ideogram-v2",
      "ideogram-ai/ideogram-v2-turbo",
      "luma/photon",
      "luma/photon-flash",
      "recraft-ai/recraft-v3",
      "stability-ai/stable-diffusion-3.5-large",
      "stability-ai/stable-diffusion-3.5-large-turbo",
      "google/imagen-4",
    ],
  },
};

/**
 * Default model configurations for different performance modes
 */
export const MODEL_CONFIGS: Record<ModelMode, Record<ProviderKey, string>> = {
  performance: {
    replicate: "stability-ai/stable-diffusion-3.5-large-turbo",
  },
  quality: {
    replicate: "recraft-ai/recraft-v3",
  },
};

export const PROVIDER_ORDER: ProviderKey[] = ["replicate"];

/**
 * Helper function to initialize a record with default values for all providers
 */
export const initializeProviderRecord = <T>(defaultValue?: T) =>
  Object.fromEntries(
    PROVIDER_ORDER.map((key) => [key, defaultValue])
  ) as Record<ProviderKey, T>;

// ============================================================================
// API Types and Validation
// ============================================================================

// Get all allowed model IDs from the PROVIDERS configuration
const allowedModelIds = PROVIDERS.replicate.models;

// Create the request validation schema
export const imageGenerationRequestSchema = z.object({
  prompt: z
    .string()
    .min(1, "Prompt is required")
    .max(2000, "Prompt must be less than 2000 characters")
    .trim(),
  modelId: z.string().refine((modelId) => allowedModelIds.includes(modelId), {
    message: `Invalid model. Allowed models are: ${allowedModelIds.join(", ")}`,
  }),
  // Optional parameters that could be added in the future
  provider: z.literal("replicate").optional(),
});

export type GenerateImageRequest = z.infer<typeof imageGenerationRequestSchema>;

/**
 * Response interface for image generation
 */
export interface GenerateImageResponse {
  image?: string;
  error?: string;
}

// Response validation schema (for type safety)
export const imageGenerationResponseSchema = z.object({
  id: z.string().uuid(),
  imageUrl: z.string().url(),
  image: z.string(), // base64 image data
});

export type ImageGenerationResponse = z.infer<
  typeof imageGenerationResponseSchema
>;

// Error response schema
export const errorResponseSchema = z.object({
  error: z.string(),
  details: z.string().optional(),
  creditsRequired: z.number().optional(),
  creditsAvailable: z.number().optional(),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

// ============================================================================
// Image Types
// ============================================================================

/**
 * Represents a generated image with provider information
 */
export interface GeneratedImage {
  provider: ProviderKey;
  image: string | null;
  modelId?: string;
}

export interface ImageResult {
  provider: ProviderKey;
  image: string | null;
  modelId?: string;
}

export interface ImageError {
  provider: ProviderKey;
  message: string;
}

export interface ProviderTiming {
  startTime?: number;
  completionTime?: number;
  elapsed?: number;
}

interface ModelInfo {
  name: string;
  logo: string;
  id: string;
}

export const MODEL_LOGOS: Record<string, string> = {
  "stable-diffusion-3.5-large": "/image-ai/stability.jpeg",
  "stable-diffusion-3.5-large-turbo": "/image-ai/stability.jpeg",
  "flux-1.1-pro": "/image-ai/blackforest.jpg",
  "flux-1.1-pro-ultra": "/image-ai/blackforest.jpg",
  "flux-dev": "/image-ai/blackforest.jpg",
  "flux-pro": "/image-ai/blackforest.jpg",
  "flux-schnell": "/image-ai/blackforest.jpg",
  "ideogram-v2": "/image-ai/ideogram.png",
  "ideogram-v2-turbo": "/image-ai/ideogram.png",
  photon: "/image-ai/luma.svg",
  "photon-flash": "/image-ai/luma.svg",
  "recraft-v3": "/image-ai/recraft.jpg",
  "google/imagen-4": "/image-ai/google.svg",
};

// ============================================================================
// Image Helper Functions
// ============================================================================

export const imageHelpers = {
  /**
   * Converts a base64 string to a Blob object
   */
  base64ToBlob: (base64Data: string, type = "image/png"): Blob => {
    const byteString = atob(base64Data);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }

    return new Blob([uint8Array], { type });
  },

  /**
   * Generates a unique filename for an image based on the provider
   */
  generateImageFileName: (provider: string): string => {
    const uniqueId = Math.random().toString(36).substring(2, 8);
    return `${provider}-${uniqueId}`.replace(/[^a-z0-9-]/gi, "");
  },

  /**
   * Attempts to share an image using the Web Share API, falls back to download
   */
  shareOrDownload: async (
    imageData: string,
    provider: string
  ): Promise<void> => {
    const fileName = imageHelpers.generateImageFileName(provider);
    const blob = imageHelpers.base64ToBlob(imageData);
    const file = new File([blob], `${fileName}.png`, { type: "image/png" });

    try {
      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: `Image generated by ${provider}`,
        });
      } else {
        throw new Error("Share API not available");
      }
    } catch (error) {
      // Fall back to download for any error (including share cancellation)
      console.error("Error sharing/downloading:", error);
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${fileName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }
  },

  /**
   * Formats a model ID by extracting the last part after the slash
   */
  formatModelId: (modelId: string): string => {
    return modelId.split("/").pop() || modelId;
  },

  /**
   * Gets model info including name and logo
   */
  getModelInfo: (modelId: string): ModelInfo => {
    const name = modelId.split("/").pop() || modelId;
    return {
      name,
      logo: MODEL_LOGOS[name] || "/model-icons/default.png",
      id: modelId,
    };
  },
};
