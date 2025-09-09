"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import {
  ArrowUp,
  Upload,
  X,
  ImageIcon,
  RefreshCw,
  ArrowUpRight,
  Plus,
  Wand2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import cx from "classnames";
import {
  useDropzone,
  DropzoneRootProps,
  DropzoneInputProps,
} from "react-dropzone";
import { getRandomSuggestions } from "./image-suggestions";
import type { Suggestion } from "./image-suggestions";
import { motion } from "framer-motion";

// Grid pattern component for the upload area
function GridPattern() {
  const columns = 41;
  const rows = 11;
  return (
    <div className="flex bg-gray-100 dark:bg-neutral-900 flex-shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`w-10 h-10 flex flex-shrink-0 rounded-[2px] ${
                index % 2 === 0
                  ? "bg-gray-50 dark:bg-neutral-950"
                  : "bg-gray-50 dark:bg-neutral-950 shadow-[0px_0px_1px_3px_rgba(255,255,255,1)_inset] dark:shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]"
              }`}
            />
          );
        })
      )}
    </div>
  );
}

const mainVariant = {
  initial: { x: 0, y: 0 },
  animate: { x: 20, y: -20, opacity: 0.9 },
};

// Define the props interface
interface ImageGeneratorProps {
  uploadedImages?: File[];
  onAddFiles?: (files: File[]) => void; // Callback to add files
  onRemoveImage?: (index: number) => void; // Callback to remove a file
  onClearAllImages?: () => void; // Callback to clear all files
  getRootProps?: <T extends DropzoneRootProps>(props?: T) => T;
  getInputProps?: <T extends DropzoneInputProps>(props?: T) => T;
  isDragActive?: boolean;
  isGenerating: boolean; // Receive generating state from parent
  error: string | null; // Receive error state from parent
  onSubmit: (prompt: string) => void; // Use parent's submit handler
}

export function ImageGenerator({
  uploadedImages = [],
  onAddFiles,
  onRemoveImage,
  onClearAllImages,
  getRootProps,
  getInputProps,
  isDragActive,
  isGenerating,
  error,
  onSubmit,
}: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>(() =>
    getRandomSuggestions(uploadedImages.length > 0)
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Internal dropzone setup ONLY if props aren't provided
  const internalDropzone = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: (acceptedFiles) => {
      if (onAddFiles) {
        onAddFiles(acceptedFiles);
      } else {
        console.warn("ImageGenerator: onAddFiles prop not provided.");
      }
    },
    onDropRejected: (fileRejections) => {
      const error = fileRejections[0]?.errors[0];
      if (error?.code === "file-too-large") {
        toast.error("File is too large. Maximum size is 5MB.");
      } else if (error?.code === "file-invalid-type") {
        toast.error("Invalid file type. Please upload only images.");
      } else {
        toast.error("Upload failed. Please try again.");
      }
    },
    noClick: true, // Prevent dropzone div itself from opening dialog
  });

  const finalGetRootProps = getRootProps || internalDropzone.getRootProps;
  const finalGetInputProps = getInputProps || internalDropzone.getInputProps;
  const finalIsDragActive =
    isDragActive !== undefined ? isDragActive : internalDropzone.isDragActive;

  // Generate image preview URLs
  useEffect(() => {
    const newPreviewUrls: string[] = [];
    let filesProcessed = 0;

    if (!Array.isArray(uploadedImages)) {
      setImagePreviewUrls([]);
      setSuggestions(getRandomSuggestions(false));
      return;
    }
    if (uploadedImages.length === 0) {
      setImagePreviewUrls([]);
      setSuggestions(getRandomSuggestions(false));
      return;
    }

    uploadedImages.forEach((file) => {
      if (!(file instanceof File)) {
        filesProcessed++;
        if (filesProcessed === uploadedImages.length)
          setImagePreviewUrls(newPreviewUrls);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        newPreviewUrls.push(reader.result as string);
        filesProcessed++;
        if (filesProcessed === uploadedImages.length)
          setImagePreviewUrls(newPreviewUrls);
      };
      reader.onerror = () => {
        filesProcessed++;
        if (filesProcessed === uploadedImages.length)
          setImagePreviewUrls(newPreviewUrls);
      };
      reader.readAsDataURL(file);
    });

    setSuggestions(getRandomSuggestions(uploadedImages.length > 0));

    // Cleanup
    return () => {
      newPreviewUrls.forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, [uploadedImages]);

  const handleSubmitClick = () => {
    if (!isGenerating && prompt.trim()) {
      onSubmit(prompt); // Call parent's submit handler
    }
  };

  // Reintroduce explicit click handler for buttons/clickable areas
  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection from hidden input
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && onAddFiles) {
      onAddFiles(Array.from(files));
    } else if (!onAddFiles) {
      console.warn("ImageGenerator: onAddFiles prop not provided.");
    }
    if (e.target) e.target.value = ""; // Reset file input
  };

  // Use the callbacks passed via props
  const removeUploadedImage = (index: number) => {
    if (onRemoveImage) {
      onRemoveImage(index);
    } else {
      console.warn("ImageGenerator: onRemoveImage prop not provided.");
    }
  };

  const clearAllUploadedImages = () => {
    if (onClearAllImages) {
      onClearAllImages();
    } else {
      console.warn("ImageGenerator: onClearAllImages prop not provided.");
    }
  };

  const refreshSuggestions = () => {
    setSuggestions(getRandomSuggestions(uploadedImages.length > 0));
  };

  const handleSuggestionSelect = (suggestionPrompt: string) => {
    setPrompt(suggestionPrompt);
    // Optionally trigger submit immediately after selection?
    // onSubmit(suggestionPrompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitClick();
    }
  };

  return (
    <div className="w-full mb-8 space-y-4">
      {/* Hidden file input managed by the ref */}
      <input
        {...finalGetInputProps()} // Use dropzone input props here
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileInputChange}
        multiple
      />

      {/* Image upload section */}
      {uploadedImages.length > 0 ? (
        <div className="mb-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-zinc-700">
              Added Images ({uploadedImages.length})
            </h3>
            <button
              onClick={clearAllUploadedImages}
              className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
            >
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {imagePreviewUrls.map((url, index) => (
              <div key={index} className="relative">
                <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                  <img
                    src={url}
                    alt={`Uploaded ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeUploadedImage(index);
                    }}
                    className="absolute top-1.5 right-1.5 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
            <div
              className="w-24 h-24 flex items-center justify-center border border-dashed border-zinc-300 hover:border-zinc-400 rounded-lg cursor-pointer hover:bg-zinc-50 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                openFileDialog();
              }} // Stop propagation and open dialog
            >
              <div className="flex flex-col items-center">
                <Plus className="h-5 w-5 text-zinc-500" />
                <span className="text-xs text-zinc-500 mt-1">Add</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          {...finalGetRootProps({ className: "cursor-pointer" })}
          onClick={openFileDialog}
        >
          <motion.div
            whileHover="animate"
            className="p-8 group/file block rounded-lg w-full relative overflow-hidden"
          >
            <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
              <GridPattern />
            </div>

            <div className="flex flex-col items-center justify-center">
              <p className="relative z-20 font-sans font-bold text-neutral-700 dark:text-neutral-300 text-base">
                Add photos to edit
              </p>
              <p className="relative z-20 font-sans font-normal text-neutral-400 dark:text-neutral-400 text-base mt-2">
                {finalIsDragActive
                  ? "Drop your images here..."
                  : "Drag & drop your images here or click anywhere to browse"}
              </p>

              <div className="relative w-full mt-8 max-w-xl mx-auto">
                <motion.div
                  layoutId="image-upload"
                  variants={mainVariant}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="relative group-hover/file:shadow-2xl z-40 bg-white dark:bg-neutral-900 flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md shadow-[0px_10px_50px_rgba(0,0,0,0.1)]"
                >
                  {finalIsDragActive ? (
                    <ImageIcon className="h-8 w-8 text-indigo-500 animate-pulse" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-neutral-600 dark:text-neutral-300" />
                  )}
                </motion.div>
              </div>

              <p className="relative z-20 text-xs text-neutral-400 dark:text-neutral-500 mt-4">
                Supported formats: JPEG, PNG, GIF, WEBP up to 5MB
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Manual input field */}
      <div className="relative">
        <textarea
          placeholder={
            uploadedImages.length > 0
              ? "Describe how you want to edit or combine these images..."
              : "Describe the image you want to generate..."
          }
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          className={cx(
            "min-h-[72px] w-full max-h-[calc(100dvh)]",
            "overflow-y-auto resize-none px-4 pb-16 pt-4 rounded-2xl",
            "outline-none focus:outline-none focus:ring-0 border-0",
            "bg-zinc-50/70 text-sm"
          )}
          rows={3}
          autoFocus
        />

        <div className="absolute bottom-4 right-4 z-10">
          <button
            onClick={handleSubmitClick}
            disabled={isGenerating || !prompt.trim()}
            className="p-1.5 rounded-full bg-black text-white hover:bg-zinc-800 
                     disabled:opacity-50 disabled:hover:bg-black transition-colors"
          >
            {isGenerating ? (
              <Spinner className="w-4 h-4" />
            ) : (
              <ArrowUp className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Suggestions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
        <div
          onClick={refreshSuggestions}
          className="flex items-center justify-center p-3 bg-zinc-50 rounded-lg hover:bg-zinc-100 cursor-pointer transition-colors"
        >
          <RefreshCw className="w-5 h-5 text-zinc-600" />
          <span className="ml-2 text-sm text-zinc-600">New ideas</span>
        </div>
        {suggestions.slice(0, 3).map((suggestion, index) => (
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
