/**
 * Chat utilities for handling AI message transformations and sanitization
 * Includes functions for:
 * - Converting database messages to UI format
 * - Sanitizing messages
 * - Managing tool invocations
 * - Handling message annotations
 */

import {
  CoreAssistantMessage,
  CoreToolMessage,
  UIMessage,
  ToolResultPart,
  ModelMessage,
  UIMessagePart,
  UIDataTypes,
  UITools,
} from "ai";
import type { Database } from "@/lib/types/supabase";

type DBMessage = Database["public"]["Tables"]["messages"]["Row"];
type Document = Database["public"]["Tables"]["chat_documents"]["Row"];

export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Remove unused interface

function parseToolContent(content: string): ToolResultPart[] {
  try {
    const parsed = JSON.parse(content);
    
    // Handle single tool result format from formatMessageContent
    if (parsed.type === "tool-result") {
      return [{
        type: "tool-result" as const,
        toolCallId: parsed.toolCallId || generateUUID(),
        toolName: parsed.toolName,
        output: parsed.result || parsed.output,
      }];
    }
    
    // Handle array format
    const toolResults = Array.isArray(parsed) ? parsed : [parsed];

    return toolResults.map((item: any) => ({
      type: "tool-result" as const,
      toolCallId: item.toolCallId || generateUUID(),
      toolName: item.toolName,
      output: item.result || item.output,
    }));
  } catch (e) {
    console.error("Failed to parse tool content:", e);
    return [];
  }
}

function addToolMessageToChat<TMetadata = unknown>({
  toolMessage,
  messages,
}: {
  toolMessage: DBMessage;
  messages: Array<UIMessage<TMetadata>>;
}): Array<UIMessage<TMetadata>> {
  return messages.map((message: UIMessage<TMetadata>): UIMessage<TMetadata> => {
    // In V5, tool invocations are in the parts array
    const toolParts =
      message.parts?.filter(
        (part) => part.type.startsWith("tool-") || part.type === "dynamic-tool"
      ) || [];

    if (toolParts.length === 0) return message;

    const toolContent = parseToolContent(toolMessage.content?.toString() ?? "");
    const matchedToolCallIds = new Set<string>();

    // Update parts array with tool results
    const updatedParts = message.parts.map((part) => {
      if (!part.type.startsWith("tool-") && part.type !== "dynamic-tool") {
        return part;
      }

      // Find matching tool result
      const toolResult = toolContent.find(
        (tool) => "toolCallId" in part && tool.toolCallId === part.toolCallId
      );

      if (toolResult && "state" in part && part.state === "input-available") {
        matchedToolCallIds.add(toolResult.toolCallId);
        return {
          ...part,
          state: "output-available" as const,
          output: toolResult.output,
        };
      }

      return part;
    });

    return {
      ...message,
      parts: updatedParts,
    };
  });
}

export function convertToUIMessages<TMetadata = unknown>(
  messages: Array<DBMessage>
): Array<UIMessage<TMetadata>> {
  return messages.reduce((chatMessages: Array<UIMessage<TMetadata>>, message) => {
    if (message.role === "tool") {
      return addToolMessageToChat({
        toolMessage: message,
        messages: chatMessages,
      });
    }

    let parts: Array<UIMessagePart<UIDataTypes, UITools>> = [];

    try {
      const content = message.content?.toString() ?? "";
      if (content.trim().startsWith("[") || content.trim().startsWith("{")) {
        const parsedContent = JSON.parse(content);

        if (Array.isArray(parsedContent)) {
          for (const item of parsedContent) {
            if (item.type === "text") {
              parts.push({ type: "text" as const, text: item.text });
            } else if (item.type === "image") {
              parts.push({
                type: "file",
                url: item.image,
                mediaType: "image/jpeg", // or determine from URL
              });
            } else if (item.type === "tool-call") {
              // In V5, tool invocations are tool-specific parts
              parts.push({
                type: `tool-${item.toolName}`,
                toolCallId: item.toolCallId,
                toolName: item.toolName,
                state: "input-available" as const,
                input: item.args,
              } as UIMessagePart<UIDataTypes, UITools>);
            } else if (item.type && item.type.startsWith("tool-")) {
              // Handle already formatted tool parts (from database)
              parts.push(item as UIMessagePart<UIDataTypes, UITools>);
            }
          }
        } else {
          parts.push({ type: "text" as const, text: content });
        }
      } else {
        parts.push({ type: "text" as const, text: content });
      }
    } catch {
      parts.push({ type: "text" as const, text: message.content?.toString() ?? "" });
    }

    chatMessages.push({
      id: message.id,
      role: message.role as UIMessage["role"],
      parts: parts.length > 0 ? parts : [{ type: "text" as const, text: "" }],
    });

    return chatMessages;
  }, []);
}

export function sanitizeResponseMessages(
  messages: Array<CoreToolMessage | CoreAssistantMessage>
): Array<CoreToolMessage | CoreAssistantMessage> {
  let toolResultIds: Array<string> = [];

  for (const message of messages) {
    if (message.role === "tool") {
      for (const content of message.content) {
        if (content.type === "tool-result") {
          toolResultIds.push(content.toolCallId);
        }
      }
    }
  }

  const messagesBySanitizedContent = messages.map((message) => {
    if (message.role !== "assistant") return message;

    if (typeof message.content === "string") return message;

    const sanitizedContent = message.content.filter((content) =>
      content.type === "tool-call"
        ? toolResultIds.includes(content.toolCallId)
        : content.type === "text"
        ? content.text.length > 0
        : true
    );

    return {
      ...message,
      content: sanitizedContent,
    };
  });

  return messagesBySanitizedContent.filter(
    (message) => message.content.length > 0
  );
}

export function sanitizeUIMessages<TMetadata = unknown>(
  messages: Array<UIMessage<TMetadata>>
): Array<UIMessage<TMetadata>> {
  const messagesBySanitizedParts = messages.map((message) => {
    if (message.role !== "assistant") return message;

    // Filter parts to keep only valid ones
    const sanitizedParts = message.parts.filter((part) => {
      if (part.type === "text") {
        return part.text && part.text.length > 0;
      }
      if (part.type.startsWith("tool-") || part.type === "dynamic-tool") {
        return (
          "state" in part &&
          (part.state === "output-available" ||
            (part.state === "input-available" &&
              "toolCallId" in part &&
              part.toolCallId &&
              "toolName" in part &&
              part.toolName))
        );
      }
      return true; // Keep other part types
    });

    return {
      ...message,
      parts:
        sanitizedParts.length > 0
          ? sanitizedParts
          : [{ type: "text" as const, text: "" }],
    };
  });

  // Filter out messages with no meaningful content
  return messagesBySanitizedParts.filter((message) =>
    message.parts.some(
      (part) =>
        (part.type === "text" && part.text && part.text.length > 0) ||
        part.type.startsWith("tool-") ||
        part.type === "dynamic-tool"
    )
  );
}

export function getMostRecentUserMessage(messages: Array<ModelMessage>) {
  const userMessages = messages.filter((message) => message.role === "user");
  return userMessages.at(-1);
}

export function getDocumentTimestampByIndex(
  documents: Array<Document>,
  index: number
) {
  if (!documents) return new Date();
  if (index > documents.length) return new Date();

  return documents[index].created_at;
}

// Add fetcher function for SWR
export async function fetcher<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(input, init);

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  return response.json();
}

// In V5, annotations are replaced with metadata
export function getMessageIdFromAnnotations(message: UIMessage) {
  // V5 uses metadata instead of annotations
  if (!message.metadata) return message.id;

  const metadata = message.metadata as any;
  if (!metadata?.messageIdFromServer) return message.id;

  return metadata.messageIdFromServer;
}
