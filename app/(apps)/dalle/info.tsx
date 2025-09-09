"use client";

import { AppInfoTemplate } from "@/components/(apps)/dashboard/app-info-template";

export default function DallEInfo() {
  return (
    <AppInfoTemplate
      heroImage="https://images.unsplash.com/photo-1490367605959-06955305859b?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      heroTitle="AI Logo Generator using DALL-E"
      heroDescription="Create unique and creative logos from text descriptions using OpenAI's DALL-E with advanced image generation."
      features={[
        {
          icon: "🎨",
          title: "Logo Generation",
          description:
            "Generate logos from text descriptions using DALL-E with advanced image generation.",
          hours: "25+ hours",
        },
      ]}
    />
  );
}
