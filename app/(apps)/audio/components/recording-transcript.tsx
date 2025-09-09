"use client";

import { useState } from "react";
import { formatTimestamp } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, Wand2, FileText, ListTodo, XIcon } from "lucide-react";
import { motion } from "framer-motion";

// Reuse the same GridPattern from record-audio
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

export default function RecordingDesktop({ data }: { data: any }) {
  const { recording, summary, transcript } = data;
  const [note, setNote] = useState(summary);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const router = useRouter();

  const generateSummary = async () => {
    setIsGeneratingSummary(true);
    setIsOpen(true);

    try {
      const response = await fetch("/audio/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordingId: recording.id,
          transcript: transcript.transcript,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setNote({
          ...note,
          summary: result.summary,
          action_items: result.action_items,
        });
        router.refresh();
        setIsOpen(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error generating summary:", error);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const { created_at: _creationTime } = recording;
  const { generatingTitle, title } = summary ?? {};

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/audio")}
          className="mb-4 hover:bg-primary rounded-xl dark:hover:bg-neutral-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to recordings
        </Button>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1
            className={`text-2xl font-bold text-neutral-700 dark:text-neutral-300 ${
              generatingTitle && "animate-pulse"
            }`}
          >
            {generatingTitle ? "Generating Title..." : title ?? "Untitled Note"}
          </h1>
          <p className="text-sm text-neutral-400 dark:text-neutral-400">
            {formatTimestamp(new Date(_creationTime).getTime())}
          </p>
        </motion.div>
      </div>

      {/* Content Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Transcript Card */}
        <motion.div
          whileHover="animate"
          className="p-10 group block rounded-lg w-full relative overflow-hidden bg-white dark:bg-neutral-900 shadow-[0_0_1px_1px_rgba(0,0,0,0.05)] dark:shadow-[0_0_1px_1px_rgba(255,255,255,0.05)]"
        >
          <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
            <GridPattern />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-neutral-400" />
              <h2 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300">
                Transcript
              </h2>
            </div>
            <div className="prose prose-neutral dark:prose-invert">
              {transcript.transcript}
            </div>
          </div>
        </motion.div>

        {/* Summary & Action Items */}
        <div className="space-y-8">
          {/* Summary Card */}
          <motion.div
            whileHover="animate"
            className="p-10 group block rounded-lg w-full relative overflow-hidden bg-white dark:bg-neutral-900 shadow-[0_0_1px_1px_rgba(0,0,0,0.05)] dark:shadow-[0_0_1px_1px_rgba(255,255,255,0.05)]"
          >
            <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
              <GridPattern />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <Wand2 className="w-5 h-5 text-neutral-400" />
                <h2 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300">
                  Summary
                </h2>
              </div>

              {summary?.summary ? (
                <div className="prose prose-neutral dark:prose-invert">
                  {summary.summary}
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-neutral-400">
                    No summary available yet. Generate one with AI.
                  </p>
                  <button
                    onClick={generateSummary}
                    disabled={isGeneratingSummary}
                    className="bg-black dark:bg-white flex justify-center items-center rounded-[20px] px-10 py-3 text-white dark:text-black text-base font-medium w-full hover:opacity-90 transition-opacity"
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    {isGeneratingSummary ? "Generating..." : "Generate Summary"}
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Action Items Card */}
          <motion.div
            whileHover="animate"
            className="p-10 group block rounded-lg w-full relative overflow-hidden bg-white dark:bg-neutral-900 shadow-[0_0_1px_1px_rgba(0,0,0,0.05)] dark:shadow-[0_0_1px_1px_rgba(255,255,255,0.05)]"
          >
            <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
              <GridPattern />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <ListTodo className="w-5 h-5 text-neutral-400" />
                <h2 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300">
                  Action Items
                </h2>
              </div>

              {summary?.action_items ? (
                <ul className="space-y-4">
                  {(Array.isArray(summary.action_items)
                    ? summary.action_items
                    : JSON.parse(summary.action_items)
                  ).map((item: string, index: number) => (
                    <motion.li
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      key={index}
                      className="flex items-start group"
                    >
                      <div className="w-6 h-6 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-sm font-medium mr-3 group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700 transition-colors">
                        {index + 1}
                      </div>
                      <span className="text-neutral-700 dark:text-neutral-300">
                        {item}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="text-neutral-400">
                  Action items will appear here after generating the summary.
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Loading Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[440px] p-8 border-none bg-white dark:bg-neutral-900 rounded-3xl shadow-lg">
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2 text-center">
              <DialogTitle className="text-2xl font-semibold">
                Analyzing Recording
              </DialogTitle>
              <DialogDescription className="text-neutral-500 dark:text-neutral-400">
                Processing your audio to generate insights
              </DialogDescription>
            </div>

            {/* Main Content */}
            <div className="flex flex-col items-center py-6">
              {/* Loading Animation */}
              <div className="relative mb-8">
                <div className="w-20 h-20 rounded-full border-[3px] border-neutral-100 dark:border-neutral-800"></div>
                <div className="absolute top-0 left-0 w-20 h-20 rounded-full border-[3px] border-t-black dark:border-t-white animate-spin"></div>
              </div>

              {/* Status */}
              <div className="w-full space-y-4">
                <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="font-medium">Transcribing audio</span>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>

                <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-black dark:bg-white animate-pulse"></div>
                    <span className="font-medium">Identifying key points</span>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-t-black dark:border-t-white animate-spin"></div>
                </div>

                <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-2xl opacity-50">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-600"></div>
                    <span className="font-medium">Creating action items</span>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-600"></div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div className="h-full bg-black dark:bg-white w-2/3 rounded-full animate-pulse"></div>
            </div>

            {/* Cancel Button - Matching record-audio style */}
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 h-10 rounded-full bg-red-50 hover:bg-red-100 text-red-500 text-sm font-medium flex items-center justify-center"
              >
                <XIcon className="w-3 h-3 mr-1.5" />
                Cancel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
