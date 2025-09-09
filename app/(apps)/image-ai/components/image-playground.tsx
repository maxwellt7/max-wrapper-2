"use client";

import { useState } from "react";
import { PromptInput } from "./prompt-input";
import { MODEL_CONFIGS, PROVIDERS, ProviderKey } from "@/lib/ai/image-ai";
import { Suggestion } from "./suggestions";
import { useImageGeneration } from "@/lib/hooks/use-image-generation";
import { ImageDisplay } from "./image-display";

export function ImagePlayground({
  suggestions,
}: {
  suggestions: Suggestion[];
}) {
  const { images, timings, failedProviders, isLoading, startGeneration } =
    useImageGeneration();

  const [selectedModels, setSelectedModels] = useState<
    Record<ProviderKey, string>
  >(MODEL_CONFIGS.quality);

  const handleModelChange = (providerKey: ProviderKey, model: string) => {
    setSelectedModels((prev) => ({ ...prev, [providerKey]: model }));
  };

  const providerToModel = {
    replicate: selectedModels.replicate,
  };

  const handlePromptSubmit = (newPrompt: string) => {
    startGeneration(newPrompt, ["replicate"], providerToModel);
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <PromptInput
          onSubmit={handlePromptSubmit}
          isLoading={isLoading}
          selectedModel={selectedModels.replicate}
          onModelChange={(model) => handleModelChange("replicate", model)}
          models={PROVIDERS.replicate.models}
          suggestions={suggestions}
        />

        <div className="space-y-8">
          {images.map((imageItem, index) => (
            <ImageDisplay
              key={index}
              provider={imageItem.provider}
              image={imageItem.image}
              timing={timings[imageItem.provider]}
              failed={failedProviders.includes(
                imageItem.provider as ProviderKey
              )}
              modelId={imageItem.modelId || "N/A"}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
