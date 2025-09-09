"use client";

import { ArrowRight, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

const FEATURES = [
  {
    emoji: "🎨",
    title: "AI Ad Creatives",
    description:
      "Generate compelling visuals for ad campaigns with just a few prompts.",
  },
  {
    emoji: "📱",
    title: "Social Media Content",
    description:
      "Create engaging images for posts and stories to boost your social media presence.",
  },
  {
    emoji: "📦",
    title: "Product Mockups",
    description:
      "Visualize your products in different settings without expensive photo shoots.",
  },
  {
    emoji: "💡",
    title: "Concept Visualization",
    description:
      "Bring your ideas to life from text prompts, perfect for brainstorming and ideation.",
  },
  {
    emoji: "✏️",
    title: "Image Editing",
    description:
      "Upload and modify existing images by describing what you want to change.",
  },
];

export function StudioInfo() {
  const pathname = usePathname();
  return (
    <div className="w-full">
      <div className="py-8 bg-blue-50/60 rounded-xl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                AI Image Studio
              </h2>
              <p className="text-gray-600 max-w-2xl">
                Generate stunning images for marketing, social media,
                presentations, and more using OpenAI's latest image models.
                Create Ghibli-style art, ad generators, custom styles, and more
                with just a text prompt.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link
                href="https://anotherwrapper.lemonsqueezy.com/buy/c1a15bd7-58b0-4174-8d1a-9bca6d8cb511"
                target="_blank"
              >
                <Button className="bg-[#0F172A] hover:bg-black text-white">
                  <span className="flex items-center gap-2">
                    Get the code
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            {FEATURES.map((feature, index) => (
              <div
                key={index}
                className="bg-white shadow-sm p-4 rounded-lg hover:shadow-md transition-all"
              >
                <div className="mb-2 text-2xl">{feature.emoji}</div>
                <h3 className="font-medium text-gray-900 mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* What You'll Get Section */}
      <div className="py-6 px-6 max-w-7xl mx-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          What you'll get with this codebase:
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="flex items-start gap-3">
            <div className="text-gray-400 mt-0.5">
              <ChevronRight className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium text-gray-800">12+ AI demo apps</p>
              <p className="text-sm text-gray-600">
                including Chat AI, PDF AI, Audio AI, and more
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-gray-400 mt-0.5">
              <ChevronRight className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium text-gray-800">
                Ready-to-use infrastructure
              </p>
              <p className="text-sm text-gray-600">
                with Supabase auth and database
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-gray-400 mt-0.5">
              <ChevronRight className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium text-gray-800">Built-in monetization</p>
              <p className="text-sm text-gray-600">
                with credit system and Stripe integration
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-gray-400 mt-0.5">
              <ChevronRight className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium text-gray-800">Email system</p>
              <p className="text-sm text-gray-600">
                for user onboarding and notifications
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-gray-400 mt-0.5">
              <ChevronRight className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium text-gray-800">Analytics integration</p>
              <p className="text-sm text-gray-600">
                with PostHog to track user behavior
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-gray-400 mt-0.5">
              <ChevronRight className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium text-gray-800">
                Beautiful UI components
              </p>
              <p className="text-sm text-gray-600">
                built with Next.js and TailwindCSS
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <Link
            href="https://anotherwrapper.lemonsqueezy.com/buy/c1a15bd7-58b0-4174-8d1a-9bca6d8cb511"
            target="_blank"
          >
            <Button className="bg-[#0F172A] hover:bg-black text-white">
              <span className="flex items-center gap-2">
                Save 260+ development hours
                <ArrowRight className="h-4 w-4" />
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
