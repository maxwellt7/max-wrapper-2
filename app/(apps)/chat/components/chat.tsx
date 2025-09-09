"use client";

import {
  UIMessage,
  DefaultChatTransport,
  ChatRequestOptions,
  CreateUIMessage,
} from "ai";

interface FileAttachment {
  url: string;
  name?: string;
  contentType?: string;
}
import { useChat } from "@ai-sdk/react";
import { AnimatePresence } from "framer-motion";
import {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useSWRConfig } from "swr";
import { useWindowSize } from "usehooks-ts";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { PreviewMessage, ThinkingMessage } from "./message";
import { useScrollToBottom } from "./use-scroll-to-bottom";
import { Block, UIBlock } from "./canvas/canvas";
import { BlockStreamHandler } from "./canvas/canvas-stream-handler";
import { MultimodalInput } from "./multimodal-input";
import { AppInfo } from "@/app/(apps)/chat/info";
import { setCookie } from "@/lib/utils/cookies";
import { useToast } from "@/components/ui/use-toast";
import { InfoCircledIcon } from "@radix-ui/react-icons";

export interface CreditUsage {
  cost: number;
  remaining: number;
  used: number;
  total: number;
}

export type ExtendedMessage = UIMessage<{ creditUsage?: CreditUsage }>;
export type ExtendedMessageMetadata = { creditUsage?: CreditUsage };

function hasImagesInConversation(messages: ExtendedMessage[]): boolean {
  return messages.some((message) =>
    message.parts?.some(
      (part) => part.type === "file" && part.mediaType?.startsWith("image/")
    )
  );
}

export function Chat({
  id,
  initialMessages,
  selectedModelId,
  initialBrowseEnabled = false,
  isAuthenticated = false,
}: {
  id: string;
  initialMessages: Array<ExtendedMessage>;
  selectedModelId: string;
  initialBrowseEnabled?: boolean;
  isAuthenticated?: boolean;
}) {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const [currentModelId, setCurrentModelId] = useState(selectedModelId);
  const [isBrowseEnabled, setIsBrowseEnabled] = useState(initialBrowseEnabled);
  const { toast } = useToast();
  const pathname = usePathname();
  const navigatedRef = useRef(false);

  const handleBrowseToggle = useCallback((enabled: boolean) => {
    setIsBrowseEnabled(enabled);
    setCookie("browse-enabled", enabled.toString());
  }, []);

  const handleModelChange = useCallback((modelId: string) => {
    setCurrentModelId(modelId);
    setCookie("model-id", modelId);
  }, []);

  // Manage input state manually in v5
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    messages,
    setMessages,
    sendMessage,
    regenerate,
    stop,
    status,
    error,
    addToolResult,
  } = useChat<ExtendedMessage>({
    id,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/chat/api/chat",
    }),
    onError: (error) => {
      if (error?.message?.includes("Insufficient credits")) {
        toast({
          variant: "destructive",
          title: "Out of Credits",
          description: (
            <div className="flex flex-col gap-2">
              <p className="font-medium">
                {error.message
                  .replace('{"error":"Insufficient credits","message":"', "")
                  .replace('"}', "")}
              </p>
              <p>
                You can still use GPT-4o mini and Claude 3.5 Haiku for free!
                However, premium models and features (like web browsing) require
                credits.
              </p>
              <p>
                To prevent abuse, we use a credit system for premium features.
              </p>
              <a
                href="https://anotherwrapper.lemonsqueezy.com/buy/d69ee93a-1070-4820-bec8-cce8b7d6de7d"
                className="text-primary hover:underline font-medium"
                target="_blank"
              >
                Get more credits →
              </a>
            </div>
          ),
          duration: 10000,
        });
      }
    },
    onFinish: ({ message }) => {
      setIsLoading(false);
      mutate("/api/history");

      // Handle credit usage from message metadata
      const creditUsage = message.metadata?.creditUsage;

      if (creditUsage) {
        try {
          const usage = creditUsage;

          if (usage.remaining < 10) {
            toast({
              description: (
                <div className="flex flex-col gap-4 p-1">
                  {/* Credit Usage Section */}
                  <div className="flex items-start gap-3">
                    <InfoCircledIcon className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-medium text-[15px]">
                        -{usage.cost} credits used for this message
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {usage.remaining} credits remaining
                      </p>
                    </div>
                  </div>

                  {/* Explanation Section */}
                  <div className="ml-8 space-y-4">
                    <p className="text-[15px] text-blue-600 font-medium">
                      You're running low on credits
                    </p>

                    <div className="space-y-2.5">
                      <div className="flex items-start gap-2.5">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5" />
                        <p className="text-[14px] text-muted-foreground">
                          Premium models cost 1 credit per message
                        </p>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5" />
                        <p className="text-[14px] text-muted-foreground">
                          Web browsing costs 1 credit per message
                        </p>
                      </div>

                      <p className="text-[14px] text-green-600 leading-normal pl-1 font-medium">
                        Turn off browsing and switch to GPT-4o mini or Claude
                        Haiku to chat for free
                      </p>
                    </div>
                  </div>
                </div>
              ),
              duration: 5000,
            });
          }
        } catch (error) {
          console.error("[Frontend] Error parsing credit usage:", error);
        }
      }
    },
  });

  // Handle navigation after chat is created
  useEffect(() => {
    const isOnNewChatPage = pathname === "/apps/chat";
    // Check if we have an assistant message (which means the chat has been saved)
    const hasAssistantMessage = messages.some(
      (msg) => msg.role === "assistant"
    );

    if (
      isOnNewChatPage &&
      initialMessages.length === 0 &&
      !navigatedRef.current &&
      messages.length > 0 &&
      hasAssistantMessage // Only navigate after receiving assistant response
    ) {
      console.log(
        "Chat saved and assistant responded, navigating to:",
        `/apps/chat/${id}`
      );
      navigatedRef.current = true;
      router.push(`/apps/chat/${id}`);
    }
  }, [messages, pathname, initialMessages, id, router]);

  const { width: windowWidth = 1920, height: windowHeight = 1080 } =
    useWindowSize();

  const [block, setBlock] = useState<UIBlock>({
    documentId: "init",
    content: "",
    title: "",
    status: "idle",
    isVisible: false,
    boundingBox: {
      top: windowHeight / 4,
      left: windowWidth / 4,
      width: 250,
      height: 50,
    },
  });

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  const [attachments, setAttachments] = useState<Array<FileAttachment>>([]);

  const containsImages = useMemo(
    () => hasImagesInConversation(messages),
    [messages]
  );

  // Create v5-compatible handlers
  const handleSubmit = useCallback(
    async (event?: { preventDefault?: () => void }) => {
      event?.preventDefault?.();

      if (!input.trim() && attachments.length === 0) return;

      setIsLoading(true);

      // Build message parts
      const parts: Array<
        | { type: "text"; text: string }
        | { type: "file"; url: string; mediaType: string }
      > = [];

      // Add text if present
      if (input.trim()) {
        parts.push({ type: "text", text: input });
      }

      // Add attachments if present
      if (attachments.length > 0) {
        attachments.forEach((attachment) => {
          parts.push({
            type: "file",
            url: attachment.url,
            mediaType: attachment.contentType || "application/octet-stream",
          });
        });
      }

      // Clear input immediately before sending
      setInput("");
      setAttachments([]);

      try {
        await sendMessage(
          {
            role: "user",
            parts,
          },
          {
            body: {
              id,
              selectedModelId: currentModelId,
              isBrowseEnabled,
            },
          }
        );
      } catch (error) {
        console.error("Failed to send message:", error);
        // Restore input on error
        setInput(input);
        setAttachments(attachments);
        setIsLoading(false);
      }
    },
    [input, attachments, sendMessage, id, currentModelId, isBrowseEnabled]
  );

  // Create append function for compatibility
  const append = useCallback(
    async (
      message:
        | UIMessage
        | CreateUIMessage<any>
        | { role: "user" | "assistant"; content: string },
      options?: ChatRequestOptions
    ): Promise<string | null | undefined> => {
      setIsLoading(true);

      try {
        const messageOptions = {
          ...options,
          body: {
            id,
            selectedModelId: currentModelId,
            isBrowseEnabled,
            ...(options?.body || {}),
          },
        };

        if (typeof message === "object" && "parts" in message) {
          // Handle UIMessage or CreateUIMessage format
          await sendMessage(message as ExtendedMessage, messageOptions);
          return null;
        } else if (
          typeof message === "object" &&
          message.role &&
          "content" in message
        ) {
          // Handle simple content format
          await sendMessage(
            {
              role: message.role,
              parts: [{ type: "text", text: message.content }],
            },
            messageOptions
          );
          return null;
        }
      } catch (error) {
        console.error("Failed to append message:", error);
        setIsLoading(false);
      }
      return null;
    },
    [sendMessage, id, currentModelId, isBrowseEnabled]
  );

  // Track loading state based on status
  useEffect(() => {
    setIsLoading(status === "streaming" || status === "submitted");
  }, [status]);

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
          <Button
            variant="ghost"
            className="order-2 hover:bg-primary/10 hover:text-primary md:order-1 md:px-2 px-2 md:h-fit ml-auto md:ml-0"
            onClick={() => {
              router.push("/apps/chat");
              router.refresh();
            }}
          >
            <PlusIcon />
            <span className="md:sr-only">New Chat</span>
          </Button>
        </header>
        <div
          ref={messagesContainerRef}
          className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4"
        >
          {messages.length === 0 && <AppInfo />}

          {messages.map((message, index) => (
            <PreviewMessage
              key={message.id}
              message={message}
              block={block}
              setBlock={setBlock}
              isLoading={isLoading && messages.length - 1 === index}
            />
          ))}

          {isLoading &&
            messages.length > 0 &&
            messages[messages.length - 1].role === "user" && (
              <ThinkingMessage />
            )}

          <div
            ref={messagesEndRef}
            className="shrink-0 min-w-[24px] min-h-[24px]"
          />
        </div>
        <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          <MultimodalInput
            chatId={id}
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            stop={stop}
            messages={messages}
            attachments={attachments}
            setAttachments={setAttachments}
            containsImages={containsImages}
            setMessages={setMessages}
            append={append}
            selectedModelId={currentModelId}
            onModelChange={handleModelChange}
            isBrowseEnabled={isBrowseEnabled}
            onBrowseToggle={handleBrowseToggle}
            className="bg-base-100/70"
            isAuthenticated={isAuthenticated}
          />
        </form>
      </div>

      <AnimatePresence>
        {block && block.isVisible && (
          <Block
            chatId={id}
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            stop={stop}
            attachments={attachments}
            setAttachments={setAttachments}
            append={append}
            block={block}
            setBlock={setBlock}
            messages={messages}
            setMessages={setMessages}
            selectedModelId={currentModelId}
            isBrowseEnabled={isBrowseEnabled}
            onBrowseToggle={handleBrowseToggle}
            onModelChange={handleModelChange}
          />
        )}
      </AnimatePresence>

      {/* BlockStreamHandler removed - streaming is handled differently in v5 */}
    </>
  );
}
