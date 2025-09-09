"use client";

import { AppInfoTemplate } from "@/components/(apps)/dashboard/app-info-template";

export default function ImageAIInfo() {
  return (
    <AppInfoTemplate
      heroImage="https://images.unsplash.com/photo-1554147090-e1221a04a025?q=80&w=2648&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      heroTitle="Multi-Model AI Image Generator"
      heroDescription="Generate high-quality images using various state-of-the-art models through Replicate and the Vercel AI SDK. Choose from models like SDXL, Flux, Recraft V3, and more for perfect results."
      features={[
        {
          icon: "🎨",
          title: "Multiple Image AI Models",
          description:
            "Integration with various state-of-the-art image generation models through Replicate including SDXL, Flux, and Recraft V3.",
          hours: "25+ hours",
        },
      ]}
    />
  );
}
