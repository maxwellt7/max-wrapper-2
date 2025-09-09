"use client";

import { AppInfoTemplate } from "@/components/(apps)/dashboard/app-info-template";

export default function PDFInfo() {
  return (
    <AppInfoTemplate
      heroImage="https://images.unsplash.com/photo-1521572063439-8a4186b6d843?q=80&w=2680&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      heroTitle="Chat with Your PDF Documents"
      heroDescription="Interact with your PDF documents using AI-powered chat. Built with OpenAI and LangChain for intelligent document processing."
      features={[
        {
          icon: "📄",
          title: "PDF Processing",
          description:
            "Advanced document processing with vector storage and embeddings for intelligent chat interactions.",
          hours: "25+ hours",
        },
      ]}
    />
  );
}
