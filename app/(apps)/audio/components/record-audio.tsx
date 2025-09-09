"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  MicIcon,
  StopCircle,
  XIcon,
  PauseIcon,
  PlayIcon,
  CheckIcon,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import YourRecordings from "./your-recordings";

// Add this type at the top of the file
interface CustomMediaRecorder extends MediaRecorder {
  cancel?: () => void;
}

// Reuse the GridPattern component
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

type RecordingState = "idle" | "recording" | "processing";

interface RecordVoicePageProps {
  user: any;
  recordings?: any[];
}

const RecordVoicePage: React.FC<RecordVoicePageProps> = ({
  user,
  recordings,
}) => {
  const [title, setTitle] = useState("Record new voice note");
  const [mediaRecorder, setMediaRecorder] =
    useState<CustomMediaRecorder | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [dataArray, setDataArray] = useState<Uint8Array | null>(null);
  const animationFrameRef = useRef<number>(undefined);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [audioLevel, setAudioLevel] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>(undefined);
  const [activeTab, setActiveTab] = useState("record");

  const router = useRouter();

  // Start timer when recording begins
  useEffect(() => {
    if (recordingState === "recording") {
      timerRef.current = setInterval(() => {
        setTotalSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [recordingState]);

  // Add keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "r" && recordingState === "idle") {
        startRecording();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [recordingState]);

  async function stopRecording(isDone: boolean = true) {
    if (mediaRecorder) {
      if (!isDone) {
        // Call cancel before stopping
        (mediaRecorder as any).cancel?.();
      }
      mediaRecorder.stop();

      // Reset state and cleanup
      setRecordingState(isDone ? "processing" : "idle");
      setTotalSeconds(0);
      setAudioLevel(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioContext) {
        audioContext.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (!isDone) {
        setMediaRecorder(null);
      }
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream) as CustomMediaRecorder;
      let audioChunks: any = [];
      let isCanceled = false;

      // Set up audio analysis (keep existing visualization logic)
      const context = new AudioContext();
      const source = context.createMediaStreamSource(stream);
      const analyserNode = context.createAnalyser();
      analyserNode.fftSize = 32;
      source.connect(analyserNode);

      // Keep existing audio level monitoring
      const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
      const checkAudioLevel = () => {
        analyserNode.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average);
        animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
      };
      checkAudioLevel();

      recorder.ondataavailable = (e) => {
        audioChunks.push(e.data);
      };

      recorder.onstop = async () => {
        if (isCanceled) return; // Skip processing if canceled

        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const formData = new FormData();
        formData.append("file", audioBlob);
        formData.append("uploadPath", "audio");

        try {
          setRecordingState("processing");
          const response = await fetch("/audio/api/upload", {
            method: "POST",
            body: formData,
          });
          const result = await response.json();

          if (result.error) {
            throw new Error(result.error);
          }

          // Call transcribe API
          const transcriptionResponse = await fetch("/audio/api/transcribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              recordingId: result.recordingId,
              audioUrl: result.url,
            }),
          });

          const transcriptionResult = await transcriptionResponse.json();

          if (transcriptionResponse.status !== 200) {
            throw new Error(transcriptionResult.error);
          }

          if (user) {
            router.push(`/audio/${result.recordingId}`);
          }
        } catch (error) {
          console.error("Error processing audio:", error);
          setRecordingState("idle");
        }
      };

      recorder.cancel = () => {
        isCanceled = true;
      };

      setMediaRecorder(recorder);
      recorder.start();
      setRecordingState("recording");
      setAudioContext(context);
      setAnalyser(analyserNode);
      setDataArray(dataArray);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Please allow access to the microphone and try again.");
    }
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioContext) {
        audioContext.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioContext]);

  // Helper function to format time
  const formatTime = (num: number) => String(num).padStart(2, "0");

  const handleRecordClick = () => {
    if (recordingState === "idle") {
      startRecording();
    } else if (recordingState === "recording") {
      stopRecording(true);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full space-y-8"
      >
        <div className="flex justify-center">
          <TabsList className="grid grid-cols-2 w-[400px] h-12 items-center bg-neutral-100/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-full p-1">
            <TabsTrigger
              value="record"
              className="rounded-full px-6 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300"
            >
              <div className="flex items-center gap-2">
                <MicIcon className="h-4 w-4" />
                <span className="font-medium">Record Audio</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="files"
              className="rounded-full px-6 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300"
            >
              <div className="flex items-center gap-2">
                <PlayIcon className="h-4 w-4" />
                <span className="font-medium">Your Files</span>
              </div>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="record">
          <motion.div
            whileHover="animate"
            className="p-10 group/record block rounded-lg cursor-pointer w-full relative overflow-hidden"
            onClick={recordingState === "idle" ? handleRecordClick : undefined}
          >
            <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
              <GridPattern />
            </div>

            <div className="flex flex-col items-center justify-center">
              <p className="relative z-20 font-sans font-bold text-neutral-700 dark:text-neutral-300 text-base">
                Record Voice Note
              </p>
              <p className="relative z-20 font-sans font-normal text-neutral-400 dark:text-neutral-400 text-base mt-2">
                {recordingState === "recording"
                  ? "Recording in progress..."
                  : recordingState === "processing"
                  ? "Processing audio..."
                  : "Click to start recording your voice note"}
              </p>

              {/* Recording UI */}
              <div className="relative w-full mt-10 max-w-xl mx-auto">
                {recordingState === "idle" ? (
                  <div className="flex justify-center my-5">
                    <div className="rounded-3xl bg-white dark:bg-neutral-800 px-2.5 py-2 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
                      <button className="bg-black dark:bg-white flex justify-center items-center rounded-[20px] px-10 py-3 text-white dark:text-black text-base font-medium">
                        <div className="w-4 h-4 rounded-full border-[5px] border-red-500 flex items-center justify-center flex-shrink-0 mr-2.5" />
                        Start recording
                      </button>
                    </div>
                  </div>
                ) : recordingState === "recording" ? (
                  <div className="p-4 w-[440px] rounded-3xl shadow-lg bg-white dark:bg-neutral-900 dark:border dark:border-white/5 xxs:w-[360px] xxs:px-3">
                    <div className="flex flex-col items-center justify-center h-[200px] relative">
                      <div
                        className="absolute"
                        style={{
                          width: "120px",
                          height: "120px",
                          borderRadius: "50%",
                          background:
                            "radial-gradient(circle, rgba(239,68,68,0.2) 0%, rgba(239,68,68,0) 70%)",
                          transform: `scale(${1 + audioLevel / 255})`,
                        }}
                      />

                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-red-500 mb-3 animate-pulse" />
                        <span className="font-medium text-2xl tabular-nums tracking-wider">
                          {formatTime(Math.floor(totalSeconds / 60))}:
                          {formatTime(totalSeconds % 60)}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between gap-4 mt-6">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          stopRecording(false);
                        }}
                        className="flex-1 h-10 rounded-full bg-red-50 hover:bg-red-100 text-red-500 text-sm font-medium flex items-center justify-center"
                      >
                        <XIcon className="w-3 h-3 mr-1.5" />
                        Cancel
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          stopRecording(true);
                        }}
                        className="flex-1 h-10 rounded-full bg-green-50 hover:bg-green-100 text-green-500 text-sm font-medium flex items-center justify-center"
                      >
                        <CheckIcon className="w-3 h-3 mr-1.5" />
                        Done
                      </button>
                    </div>
                  </div>
                ) : recordingState === "processing" ? (
                  <div className="p-4 w-[440px] rounded-3xl shadow-lg bg-white dark:bg-neutral-900 dark:border dark:border-white/5 xxs:w-[360px] xxs:px-3">
                    <div className="h-[200px] flex flex-col items-center justify-center">
                      <div className="loading loading-spinner loading-lg text-neutral-300 mb-4" />
                      <p className="text-neutral-500 font-medium">
                        Processing audio...
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>

              <p className="relative z-20 text-xs text-neutral-400 dark:text-neutral-500 mt-6">
                Maximum recording duration: 5 minutes
              </p>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="files">
          {recordings && recordings.length > 0 ? (
            <YourRecordings recordings={recordings} />
          ) : (
            <div className="w-full max-w-md mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 p-6 rounded-xl bg-white dark:bg-neutral-900 shadow-[0_0_1px_1px_rgba(0,0,0,0.05)] dark:shadow-[0_0_1px_1px_rgba(255,255,255,0.05)]"
              >
                <div className="flex flex-col items-center justify-center py-8">
                  <PlayIcon className="h-8 w-8 text-neutral-300 dark:text-neutral-700 mb-4" />
                  <p className="text-neutral-500 dark:text-neutral-400">
                    No recordings found. Start by recording your first audio!
                  </p>
                </div>
              </motion.div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RecordVoicePage;
