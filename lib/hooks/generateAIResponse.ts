import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/utils/supabase/client";
import { type ToolConfig } from "@/lib/types/toolconfig";

export const generateAIResponse = (
  toolConfig: ToolConfig,
  userEmail: string,
  imageUrl: string | null,
  setGeneratedImage: React.Dispatch<React.SetStateAction<string | null>>
) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const generateResponse = async (
    formData: { [key: string]: string },
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setLoading(true);

    let endpoint = "/gpt/api";
    let body: { [key: string]: any } = formData;

    // Set the endpoint and body based on the tool type
    switch (toolConfig.type) {
      case "vision":
        endpoint = "/vision/api";
        body = { ...formData, imageUrl };
        break;
      case "dalle":
        endpoint = "/dalle/api";
        break;
      case "groq":
        endpoint = "/groq/api/groq";
        break;
      case "claude":
        endpoint = "/claude/api";
        break;
      case "grok":
        endpoint = "/grok/api";
        break;
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...body,
          email: userEmail,
          toolPath: encodeURIComponent(toolConfig.toolPath!),
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const responseData = await response.json();

      // If we used DALLE, fetch the generated image from Supabase
      if (toolConfig.type === "dalle") {
        const supabase = createClient();
        const { data: generations, error } = await supabase
          .from("generations")
          .select("output_data")
          .eq("id", responseData.id);

        if (error) {
          throw new Error(`Supabase fetch error: ${error.message}`);
        }

        if (generations && generations.length > 0) {
          setGeneratedImage(generations[0].output_data);
        }
      } else {
        // For navigation, use slug for Grok and id for others
        const baseUrl = toolConfig.company.appUrl.startsWith("/")
          ? toolConfig.company.appUrl.slice(1)
          : toolConfig.company.appUrl;

        const navigationPath = `/${baseUrl}/${responseData.slug}`;
        router.push(navigationPath);
      }
    } catch (error) {
      console.error("Failed to generate responses:", error);
    } finally {
      setLoading(false);
    }
  };

  return [generateResponse, loading] as const;
};
