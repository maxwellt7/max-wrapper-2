"use client";

import { useEffect, useRef, useState, ReactElement, FormEvent } from "react";
import { UIMessage } from "ai";
import { ChatMessages } from "./chat-messages";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ChatInputField } from "./chat-input-field";

export function ChatWindow(props: {
  endpoint: string;
  emptyStateComponent: ReactElement<any>;
  placeholder?: string;
  chatId: string;
  initialMessages: UIMessage[];
  documentId?: string;
}) {
  const {
    endpoint,
    emptyStateComponent,
    placeholder,
    chatId,
    initialMessages,
    documentId,
  } = props;

  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<UIMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sourcesForMessages, setSourcesForMessages] = useState<
    Record<string, any>
  >({});
  const { toast } = useToast();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setInput(e.target.value);
  };

  const sendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage: UIMessage = {
      id: Date.now().toString(),
      role: "user",
      parts: [{ type: "text", text: input }],
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          chatId,
          documentId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      const assistantMessage: UIMessage = {
        id: data.id,
        role: "assistant",
        parts: [{ type: "text", text: data.content }],
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Handle sources if they exist
      const sourcesHeader = response.headers.get("x-sources");
      if (sourcesHeader) {
        const sources = JSON.parse(
          Buffer.from(sourcesHeader, "base64").toString("utf8")
        );
        const messageIndex = response.headers.get("x-message-index");
        if (messageIndex) {
          setSourcesForMessages((prev) => ({
            ...prev,
            [messageIndex]: sources,
          }));
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to send message",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col w-full h-full no-scrollbar">
      <section className="flex flex-col w-full h-full no-scrollbar">
        {messages.length === 0 ? emptyStateComponent : ""}
        <div
          className="flex flex-col-reverse w-full mb-4 overflow-auto h-full no-scrollbar"
          ref={messageContainerRef}
        >
          {messages.length > 0
            ? [...messages]
                .reverse()
                .map((m, i) => (
                  <ChatMessages
                    key={m.id}
                    message={m}
                    sources={
                      sourcesForMessages[(messages.length - 1 - i).toString()]
                    }
                  />
                ))
            : ""}
        </div>
        <div className="flex flex-col justify-center items-center">
          <ChatInputField
            input={input}
            placeholder={placeholder}
            handleInputChange={handleInputChange}
            handleSubmit={sendMessage}
            isLoading={isLoading}
          />
        </div>
      </section>
      <Toaster />
    </main>
  );
}
