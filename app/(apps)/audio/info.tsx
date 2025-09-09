"use client";

import { AppInfoTemplate } from "@/components/(apps)/dashboard/app-info-template";

export default function AudioInfo() {
  return (
    <AppInfoTemplate
      heroImage="https://images.unsplash.com/photo-1488376986648-2512dfc6f736?q=80&w=2676&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      heroTitle="AI Audio Transcription & Summarization"
      heroDescription="Transform audio content into accurate transcriptions and summaries using Whisper and LLaMA AI models."
      features={[
        {
          icon: "🎙️",
          title: "Audio Processing",
          description:
            "Advanced audio processing pipeline with Whisper integration for accurate transcription.",
          hours: "25+ hours",
        },
      ]}
    />
  );
}
