"use client";

import {
  UIMessage,
  TextUIPart,
  FileUIPart,
  ToolUIPart,
  DynamicToolUIPart,
} from "ai";
import { extractSearchResults } from "./search-result-handler";
import cx from "classnames";
import { motion } from "framer-motion";
import { Dispatch, SetStateAction, useState } from "react";
import {
  BrainCircuitIcon,
  ChevronDown,
  ChevronUp,
  Globe,
  ComputerIcon,
} from "lucide-react";
import { UIBlock } from "./canvas/canvas";
import {
  DocumentToolCall,
  DocumentToolResult,
  AppSuggestionToolCall,
} from "./agent-actions";
import { Markdown } from "./markdown";
import { MessageActions } from "./message-actions";
import { PreviewAttachment } from "./preview-attachment";
import { Button } from "@/components/ui/button";
import { AppCards } from "./widgets/app-cards";
import { cn } from "@/lib/utils";

// V5 tool states
type ToolState =
  | "input-streaming"
  | "input-available"
  | "output-available"
  | "output-error";

interface ToolStatus {
  content: string;
  progress?: {
    found: number;
    scraped: number;
  };
}

interface InternetSearchResultProps {
  result?: {
    sources?: Array<{ title: string; url: string }>;
    summary?: string;
    // Native provider formats
    webSearchQueries?: string[]; // Google
    searchEntryPoint?: any; // Google
    groundingSupports?: any[]; // Google
    citations?: any[]; // OpenAI/Anthropic
  };
  isLoading: boolean;
  status?: string;
  toolName?: string;
  state?: ToolState;
}

interface ExtendedMessage extends UIMessage {
  // No additional properties needed - UIMessage now has parts array
}

interface PreviewMessageProps {
  message: ExtendedMessage;
  block: UIBlock;
  setBlock: Dispatch<SetStateAction<UIBlock>>;
  isLoading?: boolean;
  className?: string;
}

export function PreviewMessage({
  message,
  block,
  setBlock,
  isLoading,
  className,
}: PreviewMessageProps) {
  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      data-role={message.role}
    >
      <div
        className={cx(
          "flex gap-4 rounded-2xl",
          {
            "bg-base-100 text-primary px-4 py-3 w-fit ml-auto max-w-2xl":
              message.role === "user",
            "w-full": message.role === "assistant",
          },
          className
        )}
      >
        {message.role === "assistant" && (
          <div className="flex items-start pt-1">
            <div className="size-8 flex items-center rounded-full justify-center shrink-0">
              <BrainCircuitIcon
                size={14}
                className="text-muted-foreground/70"
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 w-full">
          {message.parts?.some((part) => part.type === "file") && (
            <div className="flex flex-wrap gap-1">
              {message.parts
                ?.filter((part) => part.type === "file")
                .map((part, index) => {
                  const filePart = part as FileUIPart;
                  return (
                    <div key={filePart.url || index} className="flex-shrink-0">
                      <PreviewAttachment
                        attachment={{
                          url: filePart.url,
                          contentType: filePart.mediaType || "",
                          name: filePart.url?.split("/").pop() || "file",
                        }}
                        showFileName={false}
                        size="normal"
                      />
                    </div>
                  );
                })}
            </div>
          )}

          {/* Render all parts in order */}
          <div className="flex flex-col gap-4">
            {message.parts?.map((part, index) => {
              // Skip step-start parts entirely to avoid showing false "Processed" messages
              if (part.type === "step-start") {
                return null;
              }

              // Handle text parts
              if (part.type === "text") {
                const textPart = part as TextUIPart;
                return textPart.text?.trim() ? (
                  <div
                    key={`text-${index}`}
                    className="prose dark:prose-invert group-data-[role=user]/message:text-primary"
                  >
                    <Markdown>{textPart.text}</Markdown>
                  </div>
                ) : null;
              }

              // Handle tool parts
              if (
                part.type &&
                (part.type.startsWith("tool-") || part.type === "dynamic-tool")
              ) {
                const toolPart = part as ToolUIPart<any> | DynamicToolUIPart;
                const toolName =
                  toolPart.type === "dynamic-tool"
                    ? toolPart.toolName
                    : toolPart.type.replace("tool-", "");
                const state: ToolState = toolPart.state || "input-available";
                const output =
                  toolPart.state === "output-available"
                    ? toolPart.output
                    : undefined;
                const status =
                  "status" in toolPart &&
                  toolPart.status &&
                  typeof toolPart.status === "object" &&
                  "content" in toolPart.status
                    ? (toolPart.status as ToolStatus)
                    : undefined;

                // For web search tools, always render the component and let it handle states internally
                if (
                  toolName === "web_search" ||
                  toolName === "google_search" ||
                  toolName === "web_search_preview"
                ) {
                  // Determine loading state based on tool state
                  const isLoading =
                    state !== "output-available" && state !== "output-error";

                  // Get status text based on state
                  let statusText = status?.content;
                  if (!statusText) {
                    switch (state) {
                      case "input-streaming":
                        statusText = "Preparing web search...";
                        break;
                      case "input-available":
                        statusText = "Searching the web...";
                        break;
                      case "output-error":
                        statusText = "Search failed";
                        break;
                      default:
                        statusText = "Searching the web...";
                    }
                  }

                  return (
                    <div key={`tool-${index}`}>
                      <InternetSearchResult
                        isLoading={isLoading}
                        result={output as InternetSearchResultProps["result"]}
                        status={statusText}
                        toolName={toolName}
                        state={state}
                      />
                    </div>
                  );
                }

                // Handle other tools
                if (state === "output-available") {
                  return (
                    <div key={`tool-${index}`}>
                      {toolName === "createDocument" ? (
                        <DocumentToolResult
                          type="create"
                          result={output}
                          block={block}
                          setBlock={setBlock}
                        />
                      ) : toolName === "updateDocument" ? (
                        <DocumentToolResult
                          type="update"
                          result={output}
                          block={block}
                          setBlock={setBlock}
                        />
                      ) : toolName === "suggestApps" ? (
                        <AppSuggestionResult
                          isLoading={false}
                          result={output as AppSuggestionResultProps["result"]}
                          status={status?.content}
                        />
                      ) : (
                        <pre>{JSON.stringify(output, null, 2)}</pre>
                      )}
                    </div>
                  );
                } else {
                  // Tool is still processing
                  return (
                    <div
                      key={`tool-${index}`}
                      className={cx({ skeleton: false })}
                    >
                      <div className="flex items-center">
                        {toolName === "createDocument" ? (
                          <DocumentToolCall
                            type="create"
                            args={toolPart.input}
                          />
                        ) : toolName === "updateDocument" ? (
                          <DocumentToolCall
                            type="update"
                            args={toolPart.input}
                          />
                        ) : toolName === "suggestApps" ? (
                          <AppSuggestionToolCall args={toolPart.input} />
                        ) : null}
                      </div>
                    </div>
                  );
                }
              }

              return null;
            })}
          </div>

          <MessageActions message={message} isLoading={isLoading || false} />
        </div>
      </div>
    </motion.div>
  );
}

export const ThinkingMessage = () => {
  const role = "assistant";

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cx(
          "flex gap-4 items-center w-full group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl",
          {
            "group-data-[role=user]/message:bg-muted": true,
          }
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center shrink-0">
          <BrainCircuitIcon size={14} className="text-muted-foreground/70" />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Thinking...
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const InternetSearchResult = ({
  result,
  isLoading,
  status,
  toolName,
  state,
}: InternetSearchResultProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Always show the search component once it appears
  // This prevents flickering by keeping it mounted
  if (isLoading || !result) {
    return (
      <div className="w-fit bg-background/50 border-[0.5px] border-border/40 py-2.5 px-3.5 rounded-lg flex flex-row items-center gap-3 shadow-[0_1px_3px_0_rgb(0,0,0,0.02)] backdrop-blur-[2px]">
        <div className="text-muted-foreground/70 flex items-center">
          <Globe className="h-[15px] w-[15px] animate-pulse" />
        </div>
        <div className="text-[13px] leading-[15px] text-muted-foreground/90">
          <span className="opacity-60 font-normal">
            {status || "Searching the web..."}
          </span>
        </div>
      </div>
    );
  }

  // Use the helper to extract search results in a unified format
  const searchResult = extractSearchResults(toolName || "web_search", result);
  if (!searchResult || searchResult.sources.length === 0) {
    // Show processed state even if no sources found
    return (
      <div className="w-fit bg-background/50 border-[0.5px] border-border/40 py-2.5 px-3.5 rounded-lg flex flex-row items-center gap-3 shadow-[0_1px_3px_0_rgb(0,0,0,0.02)] backdrop-blur-[2px]">
        <div className="text-muted-foreground/70 flex items-center">
          <Globe className="h-[15px] w-[15px]" />
        </div>
        <div className="text-[13px] leading-[15px] text-muted-foreground/90">
          <span className="opacity-60 font-normal">Processed</span>
        </div>
      </div>
    );
  }

  const { sources, summary } = searchResult;

  return (
    <div className="flex flex-col gap-4">
      <div className="w-fit bg-background/50 border-[0.5px] border-border/40 rounded-lg shadow-[0_1px_3px_0_rgb(0,0,0,0.02)] backdrop-blur-[2px] overflow-hidden">
        <div className="py-2.5 px-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="text-muted-foreground/70 flex items-center">
              <Globe className="h-[15px] w-[15px]" />
            </div>
            <div className="text-[13px] leading-[15px] text-muted-foreground/90">
              <span className="opacity-90 font-medium">
                {sources.length} sources found
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              setIsOpen(!isOpen);
            }}
            className="h-7 w-7 p-0 hover:bg-muted/50"
          >
            {isOpen ? (
              <ChevronUp className="h-[15px] w-[15px] text-muted-foreground/70" />
            ) : (
              <ChevronDown className="h-[15px] w-[15px] text-muted-foreground/70" />
            )}
          </Button>
        </div>

        {isOpen && (
          <>
            {result.summary && (
              <div className="px-3.5 pb-3.5 prose dark:prose-invert max-w-none text-[13px] leading-relaxed text-muted-foreground/90">
                <Markdown>{result.summary}</Markdown>
              </div>
            )}

            <div className="border-t border-border/40 divide-y divide-border/40">
              {sources.map((source, i) => (
                <a
                  key={i}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3.5 py-2 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center justify-center h-5 w-5 bg-background/80 rounded-md ring-[0.5px] ring-border/40">
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${source.url}&sz=32`}
                      alt=""
                      className="h-3.5 w-3.5"
                    />
                  </div>
                  <span className="flex-1 text-[13px] leading-[15px] text-muted-foreground/90 line-clamp-1">
                    {source.title}
                  </span>
                  <ChevronDown className="h-[15px] w-[15px] rotate-[-90deg] text-muted-foreground/50" />
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

interface AppSuggestionResultProps {
  result?: {
    apps: any[];
    total: number;
    metadata?: {
      analysis?: string;
      needsCombination?: boolean;
      recommendedWorkflow?: string;
    };
  };
  isLoading: boolean;
  status?: string;
}

const AppSuggestionResult = ({
  result,
  isLoading,
  status,
}: AppSuggestionResultProps) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="w-fit bg-background/50 border-[0.5px] border-border/40 py-2.5 px-3.5 rounded-lg flex flex-row items-center gap-3 shadow-[0_1px_3px_0_rgb(0,0,0,0.02)] backdrop-blur-[2px]">
        <div className="text-muted-foreground/70 flex items-center">
          <ComputerIcon
            className={cn("h-[15px] w-[15px]", {
              "animate-pulse": isLoading,
            })}
          />
        </div>
        <div className="text-[13px] leading-[15px] text-muted-foreground/90">
          <span className="opacity-90 font-medium">
            {isLoading
              ? status || "Finding relevant demo apps..."
              : `Found ${result?.total || 0} demo apps`}
          </span>
        </div>
      </div>

      {result?.apps && result.apps.length > 0 && (
        <>
          <AppCards apps={result.apps} />
        </>
      )}
    </div>
  );
};
