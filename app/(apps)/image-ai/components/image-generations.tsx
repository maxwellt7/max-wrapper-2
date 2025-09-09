"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { imageHelpers } from "@/lib/ai/image-ai";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface Generation {
  id: string;
  created_at: string;
  input_data: {
    prompt?: string;
    ideaDescription?: string;
    negativePrompt?: string;
    toolPath?: string;
    modelId?: string;
  };
  output_data: string;
  type: string;
}

interface UserGenerationsProps {
  generations: Generation[];
}

export function UserImageGenerations({ generations }: UserGenerationsProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const showNext = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex + 1) % generations.length);
    }
  };

  const showPrevious = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex(
        selectedImageIndex === 0
          ? generations.length - 1
          : selectedImageIndex - 1
      );
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isDialogOpen) return;

    if (e.key === "ArrowRight") {
      showNext();
    } else if (e.key === "ArrowLeft") {
      showPrevious();
    }
  };

  // Add and remove keyboard listener
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDialogOpen, selectedImageIndex]);

  return (
    <div className="w-full py-12">
      {generations.length > 0 && (
        <h2 className="text-xl font-semibold text-zinc-800 mb-6 px-4">
          Previously Generated Images
        </h2>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
        {generations.map((gen, index) => {
          const modelInfo = gen.input_data.modelId
            ? imageHelpers.getModelInfo(gen.input_data.modelId)
            : { name: "Default Model" };

          return (
            <Dialog
              key={gen.id}
              open={isDialogOpen && selectedImageIndex === index}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (open) {
                  setSelectedImageIndex(index);
                } else {
                  setSelectedImageIndex(null);
                }
              }}
            >
              <DialogTrigger asChild>
                <motion.div
                  className="relative rounded-xl overflow-hidden cursor-pointer will-change-transform"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="aspect-square">
                    <img
                      src={gen.output_data}
                      alt={gen.input_data.prompt}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div
                    className="absolute top-3 left-3 px-3 py-1.5 rounded-full 
                    bg-black/50 text-white text-xs font-medium z-10"
                  >
                    {modelInfo.name}
                  </div>

                  <div
                    className="absolute inset-0 opacity-0 hover:opacity-100 
                    transition-all duration-200 bg-gradient-to-t from-black/80 
                    via-black/50 to-transparent p-4 flex flex-col justify-end"
                  >
                    <div className="text-white space-y-2">
                      <p className="text-sm font-light">
                        {format(new Date(gen.created_at), "MMM d, yyyy")}
                      </p>
                      {gen.input_data.prompt && (
                        <p className="text-sm font-medium line-clamp-3">
                          {gen.input_data.prompt}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              </DialogTrigger>

              <DialogContent
                className="max-w-7xl border-none p-6 shadow-none overflow-hidden
                                 bg-transparent "
              >
                <motion.div
                  className="relative group"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Close button */}
                  <button
                    onClick={() => setIsDialogOpen(false)}
                    className="absolute top-4 -right-2 z-50 p-2 rounded-xl 
                             bg-white/10 backdrop-blur-sm border border-white/20
                             text-white hover:bg-white/20 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* Navigation buttons */}
                  <button
                    onClick={showPrevious}
                    className="absolute -left-4 top-1/2 -translate-y-1/2 z-50 p-3
                             bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl
                             text-white hover:bg-white/20 transition-colors
                             opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  <button
                    onClick={showNext}
                    className="absolute -right-4 top-1/2 -translate-y-1/2 z-50 p-3
                             bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl
                             text-white hover:bg-white/20 transition-colors
                             opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>

                  {/* Main image */}
                  <img
                    src={generations[selectedImageIndex ?? index].output_data}
                    alt={
                      generations[selectedImageIndex ?? index].input_data.prompt
                    }
                    className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
                  />

                  {/* Image info overlay - now floating below the image */}
                  <div
                    className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-full max-w-3xl
                                px-6 py-4 rounded-2xl
                                bg-white/10 backdrop-blur-md backdrop-saturate-150
                                border border-white/20"
                  >
                    <div className="text-white space-y-4">
                      <div className="flex items-center gap-3">
                        <span
                          className="px-3 py-1.5 rounded-full 
                                     bg-white/10 backdrop-blur-sm border border-white/20 
                                     text-sm font-medium"
                        >
                          {generations[selectedImageIndex ?? index].input_data
                            .modelId
                            ? imageHelpers.getModelInfo(
                                generations[selectedImageIndex ?? index]
                                  .input_data.modelId!
                              ).name
                            : "Default Model"}
                        </span>
                        <span className="text-sm text-white/70">
                          {format(
                            new Date(
                              generations[
                                selectedImageIndex ?? index
                              ].created_at
                            ),
                            "MMMM d, yyyy HH:mm"
                          )}
                        </span>
                      </div>
                      {generations[selectedImageIndex ?? index].input_data
                        .prompt && (
                        <p className="text-base font-light leading-relaxed">
                          {
                            generations[selectedImageIndex ?? index].input_data
                              .prompt
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              </DialogContent>
            </Dialog>
          );
        })}
      </div>
    </div>
  );
}
