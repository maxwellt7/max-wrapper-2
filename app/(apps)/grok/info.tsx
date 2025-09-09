"use client";

import { AppInfoTemplate } from "@/components/(apps)/dashboard/app-info-template";

export default function GrokInfo() {
  return (
    <AppInfoTemplate
      heroImage="https://images.unsplash.com/photo-1552696142-c264f14ee784?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      heroTitle="Product Hunt Launch Chaos Simulator"
      heroDescription="Simulate Product Hunt launches with metrics and community interactions using xAI's Grok for realistic scenarios."
      features={[
        {
          icon: "🚀",
          title: "Launch Simulation",
          description:
            "Advanced launch simulation using Grok for generating realistic Product Hunt scenarios and metrics.",
          hours: "25+ hours",
        },
      ]}
    />
  );
}
