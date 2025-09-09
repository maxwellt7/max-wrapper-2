"use client";

import { AppInfoTemplate } from "@/components/(apps)/dashboard/app-info-template";

export default function VoiceInfo() {
  return (
    <AppInfoTemplate
      heroImage="https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?q=80&w=2669&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      heroTitle="Text to Speech Conversion"
      heroDescription="Convert text into natural-sounding speech using ElevenLabs' advanced AI technology with customizable voices."
      features={[
        {
          icon: "🎙️",
          title: "Voice Generation",
          description:
            "Advanced voice synthesis pipeline with ElevenLabs integration and audio processing.",
          hours: "25+ hours",
        },
      ]}
    />
  );
}
