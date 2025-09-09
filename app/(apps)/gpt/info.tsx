"use client";

import { AppInfoTemplate } from "@/components/(apps)/dashboard/app-info-template";

export default function GPTInfo() {
  return (
    <AppInfoTemplate
      heroImage="https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      heroTitle="AI Text and JSON Generator using GPT-4o"
      heroDescription="Generate structured JSON outputs from text input using OpenAI's GPT-4o with advanced processing capabilities."
      features={[
        {
          icon: "🤖",
          title: "GPT Integration",
          description:
            "Advanced text processing pipeline with GPT-4 integration for structured JSON outputs.",
          hours: "25+ hours",
        },
      ]}
    />
  );
}
