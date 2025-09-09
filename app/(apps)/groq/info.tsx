"use client";

import { AppInfoTemplate } from "@/components/(apps)/dashboard/app-info-template";

export default function LLaMAInfo() {
  return (
    <AppInfoTemplate
      heroImage="https://images.unsplash.com/photo-1504198266287-1659872e6590?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      heroTitle="Return Structured Output Using Groq and Llama 3"
      heroDescription="Generate structured JSON outputs from text input using Groq & LLaMA 3 with advanced processing capabilities."
      features={[
        {
          icon: "🦙",
          title: "LLaMA Integration",
          description:
            "Advanced text processing pipeline with Groq & LLaMA 3 integration for structured outputs.",
          hours: "25+ hours",
        },
      ]}
    />
  );
}
