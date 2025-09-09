"use client";

import { AppInfoTemplate } from "@/components/(apps)/dashboard/app-info-template";

export default function VisionInfo() {
  return (
    <AppInfoTemplate
      heroImage="https://images.unsplash.com/photo-1617791932882-a70117e3564d?q=80&w=2673&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      heroTitle="AI Image Analysis using GPT-4o"
      heroDescription="Analyze images and generate detailed descriptions using GPT-4's advanced vision capabilities."
      features={[
        {
          icon: "👁️",
          title: "Vision Processing",
          description:
            "Advanced image analysis pipeline with GPT-4 Vision integration and structured outputs.",
          hours: "25+ hours",
        },
      ]}
    />
  );
}
