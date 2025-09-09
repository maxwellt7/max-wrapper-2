"use client";

import { motion } from "framer-motion";
import {
  BrainCircuitIcon,
  GlobeIcon,
  FileTextIcon,
  ImageIcon,
  SparklesIcon,
  SearchIcon,
  CodeIcon,
} from "lucide-react";
import Image from "next/image";
import { availableModels } from "@/lib/ai/models";

export function AppInfo() {
  // Group models by provider
  const providers = {
    OpenAI: availableModels.filter((model) => model.logo.includes("openai")),
    Anthropic: availableModels.filter((model) =>
      model.logo.includes("anthropic")
    ),
    Meta: availableModels.filter((model) => model.logo.includes("meta")),
    Google: availableModels.filter((model) => model.logo.includes("google")),
    xAI: availableModels.filter((model) => model.logo.includes("xai")),
    DeepSeek: availableModels.filter((model) =>
      model.logo.includes("deepseek")
    ),
  };

  const features = [
    {
      icon: <BrainCircuitIcon className="w-4 h-4" />,
      title: "Multiple AI Models",
      color: "from-blue-500 to-indigo-600",
    },
    {
      icon: <SparklesIcon className="w-4 h-4" />,
      title: "Generative UI",
      color: "from-amber-500 to-orange-600",
    },
    {
      icon: <SearchIcon className="w-4 h-4" />,
      title: "Smart Browsing",
      color: "from-emerald-500 to-green-600",
    },
    {
      icon: <ImageIcon className="w-4 h-4" />,
      title: "Multimodal",
      color: "from-violet-500 to-purple-600",
    },
    {
      icon: <GlobeIcon className="w-4 h-4" />,
      title: "Internet Access",
      color: "from-cyan-500 to-blue-600",
    },
    {
      icon: <FileTextIcon className="w-4 h-4" />,
      title: "Document Creation",
      color: "from-rose-500 to-pink-600",
    },
  ];

  return (
    <motion.div
      key="overview"
      className="relative w-full max-w-3xl mx-auto px-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Glass background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/70 to-white/30 backdrop-blur-xl border border-white/50 shadow-lg -z-10 rounded-3xl" />

      <div className="w-full h-full px-6">
        {/* Header with subtle glow */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="relative">
              <div className="absolute -inset-1 bg-blue-500/10 blur-sm rounded-full -z-10"></div>
              <h1 className="text-xl font-semibold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-800 bg-clip-text text-transparent leading-tight">
                Advanced AI Chat Agent
              </h1>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Multimodal AI agent with smart browsing & document generation
            </p>
          </div>
        </div>

        {/* Provider Grid with Featured Models */}
        <div className="mb-6">
          <h2 className="text-xs font-medium text-gray-500 mb-3 flex items-center">
            <span className="relative mr-2">
              <span className="absolute inset-0 bg-blue-400/20 blur-sm rounded-full"></span>
              <BrainCircuitIcon className="w-3.5 h-3.5 text-blue-600 relative" />
            </span>
            AI Providers & Models
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(providers).map(
              ([provider, models], index) =>
                models.length > 0 && (
                  <motion.div
                    key={provider}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative group overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100/80 shadow-sm"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="relative p-3 h-full">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 relative flex-shrink-0">
                          <Image
                            src={models[0].logo}
                            alt={provider}
                            width={20}
                            height={20}
                            className="object-contain"
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-800">
                          {provider}
                        </span>
                      </div>

                      <div className="space-y-1">
                        {models.slice(0, 2).map((model) => (
                          <div
                            key={model.id}
                            className="flex items-center gap-1.5"
                          >
                            <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                            <span className="text-[10px] text-gray-600 truncate">
                              {model.name}
                              {model.vision && (
                                <span className="ml-1 inline-flex items-center text-[8px] text-blue-600">
                                  (Vision)
                                </span>
                              )}
                            </span>
                          </div>
                        ))}

                        {models.length > 2 && (
                          <div className="flex items-center gap-1.5">
                            <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                            <span className="text-[10px] text-gray-500">
                              +{models.length - 2} more
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
            )}

            {/* Add Custom Models - Full Width */}
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative group overflow-hidden col-span-2 md:col-span-3"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-dashed border-gray-200 group-hover:border-blue-200 transition-colors"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 to-indigo-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative p-4 h-full flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-100 to-gray-50 group-hover:from-blue-50 group-hover:to-indigo-50 flex items-center justify-center mr-4 transition-colors shadow-sm">
                  <CodeIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                    Add any model from supported providers with a single line of
                    code
                  </h3>
                  <p className="text-[10px] text-gray-500 mt-0.5 max-w-md">
                    <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-mono">
                      modelId: "your-custom-model-id"
                    </code>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Features Grid - More Beautiful */}
        <div className="mb-6">
          <h2 className="text-xs font-medium text-gray-500 mb-3 flex items-center">
            <span className="relative mr-2">
              <span className="absolute inset-0 bg-amber-400/20 blur-sm rounded-full"></span>
              <SparklesIcon className="w-3.5 h-3.5 text-amber-500 relative" />
            </span>
            Key Capabilities
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative group overflow-hidden"
              >
                <div className="absolute inset-0 bg-white rounded-xl border border-gray-100 shadow-sm"></div>
                <div
                  className={`absolute inset-0 rounded-xl bg-gradient-to-br ${feature.color
                    .replace("from-", "from-")
                    .replace(
                      "to-",
                      "to-"
                    )}/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                ></div>

                <div className="relative p-3">
                  <div
                    className={`w-7 h-7 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center mb-2 shadow-sm`}
                  >
                    <div className="text-white">{feature.icon}</div>
                  </div>
                  <h3 className="text-xs font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                    {feature.title}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
