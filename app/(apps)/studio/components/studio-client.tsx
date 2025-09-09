"use client";

import { useState, useCallback, useEffect } from "react";
import { ImageGenerator } from "./image-generator";
import type { FileUpload } from "@/lib/types/supabase";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Download,
  ImageIcon,
  Share,
  ImagePlay,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPortal } from "react-dom";
import { Spinner } from "@/components/ui/spinner";

interface StudioClientProps {
  // Removed initial media props and subscription prop
}

export function StudioClient({}: StudioClientProps) {
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string>(""); // Store prompt used for generation
  const [isZoomed, setIsZoomed] = useState(false); // State for zoom modal

  // Removed media library state (userUploads, aiStudioImages, avatars, isLoading)
  // Removed localSubscription state
  // Removed useEffect for usage update listener

  const handleAddFiles = useCallback(
    (files: File[]) => {
      const maxFiles = 4;
      const currentFileCount = uploadedImages.length;
      const filesToAdd = files.slice(0, maxFiles - currentFileCount);
      if (files.length > filesToAdd.length) {
        toast.warning(`You can upload a maximum of ${maxFiles} images.`);
      }
      setUploadedImages((prev) => [...prev, ...filesToAdd]);
    },
    [uploadedImages.length]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"] },
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: handleAddFiles,
    onDropRejected: (fileRejections) => {
      const error = fileRejections[0]?.errors[0];
      if (error?.code === "file-too-large") toast.error("Max size 5MB.");
      else if (error?.code === "file-invalid-type")
        toast.error("Invalid type.");
      else toast.error("Upload failed.");
    },
    noClick: false, // Allow clicking the dropzone to open file dialog
  });

  // Removed handleSelect function (was for media library)

  const handleRemoveImage = useCallback((index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleClearAllImages = useCallback(() => {
    setUploadedImages([]);
  }, []);

  // Removed media library dialog open state and handler

  // Submission handler
  const handleSubmit = async (prompt: string) => {
    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null); // Clear previous result
    setLastPrompt(prompt); // Store the prompt

    try {
      let response;
      const apiUrl = "/studio/api"; // Updated to match new API structure

      if (uploadedImages.length > 0) {
        const formData = new FormData();
        formData.append("prompt", prompt);
        uploadedImages.forEach((image) => formData.append("images", image));
        response = await fetch(apiUrl, { method: "POST", body: formData });
      } else {
        response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });
      }

      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorData.message || errorMsg;
        } catch {
          errorMsg = await response.text();
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      if (data.success && data.output?.preview) {
        setGeneratedImage(data.output.preview);
        toast.success("Image generated successfully!");
        // Optionally handle data.output.publicUrl or data.fileId if needed
      } else {
        throw new Error(data.error || "Failed to generate image");
      }
    } catch (err: any) {
      console.error("Error generating image:", err);
      const errorMsg = err.message || "An unexpected error occurred";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  // Image Zoom Logic
  useEffect(() => {
    if (isZoomed) window.history.pushState({ zoomed: true }, "");
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isZoomed) setIsZoomed(false);
    };
    const handlePopState = () => {
      if (isZoomed) setIsZoomed(false);
    };
    if (isZoomed) {
      document.addEventListener("keydown", handleEscape);
      window.addEventListener("popstate", handlePopState);
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isZoomed]);

  // Share and Download for generated image
  const shareGeneratedImage = () => {
    if (generatedImage) {
      navigator.clipboard
        .writeText(generatedImage)
        .then(() => toast.success("Image Data URL copied!"))
        .catch(() => toast.error("Failed to copy image data."));
    } else {
      toast.error("No image generated to share.");
    }
  };

  const downloadGeneratedImage = () => {
    if (!generatedImage) return;
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Image download started.");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column: Input Generator Component */}
      <div>
        <ImageGenerator
          uploadedImages={uploadedImages}
          onAddFiles={handleAddFiles}
          onRemoveImage={handleRemoveImage}
          onClearAllImages={handleClearAllImages}
          getRootProps={getRootProps}
          getInputProps={getInputProps}
          isDragActive={isDragActive}
          isGenerating={isGenerating}
          error={error}
          onSubmit={handleSubmit}
        />
      </div>

      {/* Right Column: Generated Image Display Area - Made more compact */}
      <div className="rounded-xl overflow-hidden bg-zinc-50/70 p-4">
        <div className="flex items-center justify-between mb-4">
          {" "}
          {/* Reduced mb */}
          <div className="flex items-center gap-2.5">
            {" "}
            {/* Reduced gap */}
            <div className="rounded-lg bg-gradient-to-r from-zinc-50 to-zinc-100 p-1.5">
              {" "}
              {/* Changed gradient */}
              <ImagePlay className="h-4 w-4 text-zinc-600" />{" "}
              {/* Changed icon and color */}
            </div>
            <h3 className="text-base font-medium text-zinc-700">
              {" "}
              {/* Adjusted text color */}
              Generated Image
            </h3>
          </div>
        </div>

        <div
          className={cn(
            "relative w-full aspect-square rounded-lg overflow-hidden", // Reduced rounded-xl to rounded-lg
            "group",
            generatedImage && !isGenerating
              ? "cursor-pointer"
              : "bg-zinc-100/80" // Slightly adjusted bg
          )}
          onClick={() => generatedImage && !isGenerating && setIsZoomed(true)}
        >
          {generatedImage && !isGenerating ? (
            <>
              <img
                src={generatedImage}
                alt="Generated by AI"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity flex justify-between items-center">
                {" "}
                {/* Adjusted padding/gradient */}
                <div className="text-white text-xs line-clamp-1">
                  {" "}
                  {/* Adjusted size */}
                  {lastPrompt || "Generated Image"}
                </div>
                <div className="flex gap-1.5">
                  {" "}
                  {/* Reduced gap */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      shareGeneratedImage();
                    }}
                    className="p-1.5 bg-white/20 rounded-full text-white hover:bg-white/30"
                  >
                    <Share className="h-3.5 w-3.5" /> {/* Adjusted size */}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadGeneratedImage();
                    }}
                    className="p-1.5 bg-white/20 rounded-full text-white hover:bg-white/30"
                  >
                    <Download className="h-3.5 w-3.5" /> {/* Adjusted size */}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
              {" "}
              {/* Added padding */}
              {isGenerating ? (
                <Spinner className="h-6 w-6 text-zinc-500" /> /* Adjusted color/size */
              ) : error ? (
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-2 mx-auto">
                    {" "}
                    {/* Adjusted size/mb */}
                    <X className="h-6 w-6 text-red-500" /> {/* Adjusted size */}
                  </div>
                  <h3 className="text-sm font-medium text-red-600 mb-1">
                    Generation failed
                  </h3>
                  <p className="text-xs text-center text-red-500 max-w-xs">
                    {error}
                  </p>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 bg-gradient-to-r from-zinc-50 to-zinc-100 rounded-full flex items-center justify-center mb-3">
                    {" "}
                    {/* Adjusted size/mb */}
                    <ImageIcon className="h-6 w-6 text-zinc-500" />{" "}
                    {/* Adjusted size/color */}
                  </div>
                  <h3 className="text-sm font-medium text-zinc-600 mb-1">
                    {" "}
                    {/* Adjusted size/color */}
                    No image generated yet
                  </h3>
                  <p className="text-xs text-center text-zinc-500 max-w-xs">
                    Your generated image will appear here
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {generatedImage && !isGenerating && (
          <div className="flex justify-center mt-4 gap-2">
            {" "}
            {/* Reduced mt/gap */}
            <Button
              onClick={shareGeneratedImage}
              variant="outline"
              size="sm"
              className="rounded-md border-zinc-200 text-zinc-700 hover:bg-zinc-100 gap-1.5 h-8 text-xs" /* Adjusted styles */
            >
              <Share className="h-3.5 w-3.5" />
              Share
            </Button>
            <Button
              onClick={downloadGeneratedImage}
              variant="outline"
              size="sm"
              className="rounded-md border-zinc-200 text-zinc-700 hover:bg-zinc-100 gap-1.5 h-8 text-xs" /* Adjusted styles */
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </Button>
          </div>
        )}
      </div>

      {/* Image Zoom Portal */}
      {isZoomed &&
        generatedImage &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center cursor-pointer min-h-[100dvh] w-screen"
            onClick={() => setIsZoomed(false)}
          >
            <img
              src={generatedImage}
              alt="Generated by AI - Zoomed"
              className="max-h-[90dvh] max-w-[90vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsZoomed(false);
              }}
              className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20"
              aria-label="Close zoom"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  shareGeneratedImage();
                }}
                variant="secondary"
                size="sm"
                className="backdrop-blur-sm gap-2 rounded-full"
              >
                <Share className="h-4 w-4" /> Share
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadGeneratedImage();
                }}
                variant="secondary"
                size="sm"
                className="backdrop-blur-sm gap-2 rounded-full"
              >
                <Download className="h-4 w-4" /> Download
              </Button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
