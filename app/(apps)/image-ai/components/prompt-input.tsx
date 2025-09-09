import { useState } from "react";
import { ArrowUpRight, ArrowUp, RefreshCw } from "lucide-react";
import { getRandomSuggestions, Suggestion } from "./suggestions";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { imageHelpers } from "@/lib/ai/image-ai";
import cx from "classnames";
import Image from "next/image";

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isLoading?: boolean;
  selectedModel: string;
  onModelChange: (model: string) => void;
  models: string[];
  suggestions: Suggestion[];
}

export function PromptInput({
  suggestions: initSuggestions,
  isLoading,
  onSubmit,
  selectedModel,
  onModelChange,
  models,
}: PromptInputProps) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>(initSuggestions);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  const updateSuggestions = () => {
    setSuggestions(getRandomSuggestions());
  };
  const handleSuggestionSelect = (prompt: string) => {
    setInput(prompt);
    onSubmit(prompt);
  };

  const handleSubmit = () => {
    if (!isLoading && input.trim()) {
      onSubmit(input);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim()) {
        onSubmit(input);
      }
    }
  };

  return (
    <div className="w-full mb-8 space-y-4">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <textarea
            placeholder="Send a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cx(
              "min-h-[72px] w-full max-h-[calc(100dvh)]",
              "overflow-hidden resize-none px-4 pb-16 pt-4 rounded-2xl",
              "outline-none focus:outline-none focus:ring-0 border-0",
              "bg-base-100/70"
            )}
            rows={3}
            autoFocus
          />

          <div className="absolute bottom-4 right-2 z-10">
            <button
              onClick={handleSubmit}
              disabled={isLoading || !input.trim()}
              className="p-1.5 rounded-full bg-black text-white hover:bg-zinc-800 disabled:opacity-50 disabled:hover:bg-black transition-colors"
            >
              {isLoading ? (
                <Spinner className="w-4 h-4" />
              ) : (
                <ArrowUp className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="absolute bottom-2.5 left-2 z-20">
            <div className="relative">
              <button
                type="button"
                className="cursor-pointer text-xs inline-flex items-center justify-center text-sm font-medium 
                         transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 
                         focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 
                         text-muted-foreground hover:text-primary/80 h-7 rounded-md px-2 py-1
                         bg-white/50 backdrop-blur-sm"
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
              >
                <Image
                  src={imageHelpers.getModelInfo(selectedModel).logo}
                  alt={imageHelpers.getModelInfo(selectedModel).name}
                  width={16}
                  height={16}
                  className="mr-1 rounded-sm"
                />
                {imageHelpers.formatModelId(selectedModel)}
                <svg
                  className={`ml-1 h-4 w-4 transform transition-transform ${
                    isModelDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {isModelDropdownOpen && (
                <ul
                  className="absolute bottom-full mb-2 z-30 w-60 max-h-[300px] overflow-y-auto 
                            rounded-md border border-zinc-200 dark:border-zinc-700 
                            bg-white dark:bg-zinc-800 shadow-lg no-scrollbar"
                >
                  {models.map((model) => (
                    <li
                      key={model}
                      className="flex items-center px-3 py-2 text-xs cursor-pointer 
                               text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 
                               dark:hover:bg-zinc-700"
                      onClick={() => {
                        onModelChange(model);
                        setIsModelDropdownOpen(false);
                      }}
                    >
                      <Image
                        src={imageHelpers.getModelInfo(model).logo}
                        alt={imageHelpers.getModelInfo(model).name}
                        width={16}
                        height={16}
                        className="mr-2 rounded-sm"
                      />
                      {imageHelpers.formatModelId(model)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
        <div
          onClick={updateSuggestions}
          className="flex items-center justify-center p-3 bg-zinc-50 rounded-lg hover:bg-zinc-100 cursor-pointer transition-colors"
        >
          <RefreshCw className="w-5 h-5 text-zinc-600" />
          <span className="ml-2 text-sm text-zinc-600">New ideas</span>
        </div>
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            onClick={() => handleSuggestionSelect(suggestion.prompt)}
            className={cn(
              "group p-4 bg-zinc-50 rounded-lg cursor-pointer",
              "hover:bg-zinc-100 transition-all",
              "flex flex-col justify-between",
              "min-h-[100px]"
            )}
          >
            <p className="text-sm text-zinc-700 line-clamp-2">
              {suggestion.text}
            </p>
            <div className="flex justify-end mt-2">
              <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
