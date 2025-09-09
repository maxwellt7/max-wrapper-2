import { UIMessage } from "ai";
import { useCopyToClipboard } from "usehooks-ts";
import { useState } from "react";
import { CopyIcon, CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MessageActions({
  message,
  isLoading,
}: {
  message: UIMessage;
  isLoading: boolean;
}) {
  const [_, copyToClipboard] = useCopyToClipboard();
  const [hasCopied, setHasCopied] = useState(false);

  if (isLoading) return null;
  if (message.role === "user") return null;
  // Check if message has tool-related parts (V5)
  const hasToolParts = message.parts?.some(
    (part: any) => part.type?.startsWith('tool-') || part.type === 'dynamic-tool'
  );
  if (hasToolParts) return null;

  const handleCopy = async () => {
    // Extract text from parts for v5 compatibility
    const textContent = message.parts
      ?.filter((part) => part.type === "text")
      .map((part) => (part as any).text)
      .join("")
      || "";
    await copyToClipboard(textContent);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000); // Reset after 2 seconds
  };

  return (
    <div className="flex flex-row gap-2">
      <Button
        className="py-1 px-2 text-xs h-fit hover:bg-primary/10 text-primary hover:text-primary"
        variant="ghost"
        onClick={handleCopy}
      >
        {hasCopied ? (
          <CheckIcon className="text-xs text-green-500 w-4 h-4" />
        ) : (
          <CopyIcon className="text-xs w-4 h-4" />
        )}
      </Button>
    </div>
  );
}
