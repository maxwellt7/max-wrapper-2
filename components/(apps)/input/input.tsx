"use client";

import { useState, ReactElement } from "react";
import Upload from "@/components/(apps)/input/image-upload";
import { useFormData } from "@/lib/hooks/useFormData";
import { generateAIResponse } from "@/lib/hooks/generateAIResponse";
import { RenderFields } from "@/components/(apps)/input/form-fields";
import { type ToolConfig } from "@/lib/types/toolconfig";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Login from "@/components/(apps)/input/login";

interface InputCaptureProps {
  emptyStateComponent: ReactElement<any>;
  toolConfig: ToolConfig;
  userEmail?: string;
  credits?: number;
}

const AppInfoWrapper: React.FC<{
  children: React.ReactNode;
  title?: string;
  background?: string;
}> = ({ children, title, background = "bg-primary/5" }) => {
  return (
    <div className="flex justify-center no-scrollbar overflow-y-scroll w-full">
      <div
        className={`relative mt-4 max-w-[700px] p-6 rounded-xl xs:p-5 ${background}`}
      >
        <h1 className="text-2xl font-inter-medium xs:text-3xl">{title}</h1>
        {children}
      </div>
    </div>
  );
};

export default function InputCapture({
  toolConfig,
  emptyStateComponent,
  userEmail,
  credits: initialCredits,
}: InputCaptureProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [credits, setCredits] = useState(initialCredits ?? undefined);

  const [formData, handleChange] = useFormData(toolConfig.fields!);
  const [generateResponse, loading] = generateAIResponse(
    toolConfig,
    userEmail || "",
    imageUrl,
    setGeneratedImage
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (credits !== undefined && toolConfig.credits !== undefined) {
      if (credits < toolConfig.credits || credits < 1) {
        window.location.reload();
        return;
      }
    }
    await generateResponse(formData, event);
    if (credits !== undefined && toolConfig.credits !== undefined) {
      setCredits((prevCredits) => {
        const updatedCredits = prevCredits
          ? prevCredits - toolConfig.credits
          : undefined;
        return updatedCredits;
      });
    }
  };

  return (
    <section className="pb-20 w-full mx-auto">
      <div className="flex flex-col md:flex-row items-start no-scrollbar">
        <div className="w-full md:w-1/2 no-scrollbar">
          {!userEmail ? (
            <div className="w-full">
              <Login />
            </div>
          ) : (
            <div className="mt-5 w-full">
              <form onSubmit={handleSubmit} className="w-full">
                <div className="flex flex-col">
                  <div className="w-full mb-5">
                    {toolConfig.type === "vision" && (
                      <Upload
                        uploadConfig={toolConfig.upload}
                        setImageUrl={setImageUrl}
                      />
                    )}
                    <RenderFields
                      fields={toolConfig.fields!}
                      formData={formData}
                      handleChange={handleChange}
                    />
                  </div>
                </div>
                <div className="mb-5">
                  <Button
                    disabled={
                      (!imageUrl && toolConfig.type === "vision") || loading
                    }
                    type="submit"
                    className="bg-accent hover:bg-accent/80 text-white w-full"
                  >
                    {!loading ? (
                      toolConfig.submitText
                    ) : (
                      <span className="flex items-center justify-center">
                        <LoaderCircle className="w-4 h-4 mr-2 text-green-500 animate-spin" />
                        {toolConfig.submitTextGenerating}
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
        <div className="w-full md:w-1/2 no-scrollbar">
          {toolConfig.type === "gpt" ||
          toolConfig.type === "grok" ||
          toolConfig.type === "groq" ||
          toolConfig.type === "claude" ||
          toolConfig.type === "vision" ? (
            emptyStateComponent
          ) : toolConfig.type === "dalle" && !generatedImage ? (
            emptyStateComponent
          ) : toolConfig.type === "dalle" && generatedImage ? (
            <AppInfoWrapper title="Your image has been generated.">
              <img
                src={generatedImage}
                className="mt-10 w-full group-hover:scale-105 duration-300 transition rounded-xl"
              />
              <p className="text-sm mt-4">
                Fill in the form on the right to generate a different image.
              </p>
            </AppInfoWrapper>
          ) : null}
        </div>
      </div>
    </section>
  );
}
