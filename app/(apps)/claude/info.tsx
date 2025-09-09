"use client";

import { AppInfoTemplate } from "@/components/(apps)/dashboard/app-info-template";

export default function ClaudeInfo() {
  return (
    <AppInfoTemplate
      heroImage="https://images.unsplash.com/photo-1531736275454-adc48d079ce9?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      heroTitle="AI Text/JSON Generator using Claude 3.5 Sonnet"
      heroDescription="Generate structured JSON outputs using Claude 3.5 Sonnet and LangChain with advanced text processing capabilities."
      features={[
        {
          icon: "💬",
          title: "Text Generation",
          description:
            "Advanced text processing pipeline with Claude 3.5 Sonnet and LangChain integration for structured outputs.",
          hours: "25+ hours",
        },
      ]}
    />
  );
}
