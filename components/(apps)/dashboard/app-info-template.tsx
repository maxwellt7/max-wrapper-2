"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
  hours?: string;
}

interface AppInfoTemplateProps {
  heroImage: string;
  heroTitle: string;
  heroDescription: string;
  features: FeatureItemProps[];
}

function FeatureItem({ icon, title, description, hours }: FeatureItemProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <h3 className="font-semibold text-zinc-800">{title}</h3>
      </div>
      <p className="text-sm text-zinc-600 leading-relaxed pl-9">
        {description}
      </p>
      {hours && (
        <p className="text-sm font-medium text-zinc-500 pl-9">{hours} saved</p>
      )}
    </div>
  );
}

function CTASection({ title }: { title: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-zinc-900 to-zinc-800 p-6 sm:p-8 my-8">
      <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/50 to-transparent" />

      <div className="relative">
        <h3 className="text-center text-lg font-medium text-white mb-6">
          Ready to build your own AI app?
        </h3>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="https://anotherwrapper.lemonsqueezy.com/buy/c1a15bd7-58b0-4174-8d1a-9bca6d8cb511"
            target="_blank"
          >
            <Button className="w-full sm:w-auto relative group bg-white text-zinc-900 hover:bg-white/90 min-w-[160px]">
              <span className="relative z-10 flex items-center gap-2">
                Get the code
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
          </Link>
          <Link href="https://docs.anotherwrapper.com/" target="_blank">
            <Button
              variant="outline"
              className="w-full sm:w-auto min-w-[160px] border-white/20 text-white bg-white/10 hover:bg-white/20"
            >
              View documentation
            </Button>
          </Link>
        </div>
      </div>

      <div className="absolute -left-4 top-0 h-32 w-32 bg-gradient-to-r from-blue-500/30 blur-2xl" />
      <div className="absolute -right-4 bottom-0 h-32 w-32 bg-gradient-to-l from-purple-500/30 blur-2xl" />
    </div>
  );
}

export function AppInfoTemplate({
  heroImage,
  heroTitle,
  heroDescription,
  features,
}: AppInfoTemplateProps) {
  const standardFeatures = [
    {
      icon: "🧠",
      title: "AI Integration",
      description:
        "Ready-to-use integrations with OpenAI, Anthropic, xAI, Groq, DeepSeek, Replicate, ElevenLabs, and more.",
      hours: "40+ hours",
    },
    {
      icon: "⚡",
      title: "Frontend Components",
      description:
        "Polished Next.js 15 components built with React and shadcn/ui and TailwindCSS, including responsive layouts, real-time updates, and loading states.",
      hours: "30+ hours",
    },
    {
      icon: "🔧",
      title: "Backend Integration",
      description:
        "Production-ready Next.js API routes with authentication, rate limiting, and type-safe clients.",
      hours: "30+ hours",
    },
    {
      icon: "💾",
      title: "Infrastructure",
      description:
        "Production-ready infrastructure with Supabase (auth, database, vector storage), S3-compatible for file storage, Loops for emails, and PostHog for analytics.",
      hours: "35+ hours",
    },
    {
      icon: "🔒",
      title: "Monetization",
      description:
        "Built-in credit system with Stripe and LemonSqueezy integration.",
      hours: "20+ hours",
    },
    {
      icon: "📊",
      title: "Analytics & SEO",
      description:
        "PostHog analytics, SEO optimization, and performance monitoring with meta tags.",
      hours: "15+ hours",
    },
    {
      icon: "✨",
      title: "10 AI Demo Apps",
      description:
        "Production-ready AI applications showcasing chat, vision, audio processing, and more.",
      hours: "100+ hours",
    },
  ];

  // Show app-specific features first
  const allFeatures = [...features, ...standardFeatures];
  const halfLength = Math.ceil(allFeatures.length / 2);
  const firstHalf = allFeatures.slice(0, halfLength);
  const secondHalf = allFeatures.slice(halfLength);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Hero Section */}
      <div className="relative w-full overflow-hidden rounded-lg border border-zinc-200">
        <AspectRatio ratio={16 / 9}>
          <img
            src={heroImage}
            alt={`${heroTitle} Showcase`}
            className="w-full h-full object-cover brightness-[0.95]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
            <h1 className="text-xl sm:text-2xl font-semibold text-white mb-2">
              {heroTitle}
            </h1>
            <p className="text-sm text-zinc-100 leading-relaxed max-w-2xl">
              {heroDescription}
            </p>
          </div>
        </AspectRatio>
      </div>

      {/* First Half Features */}
      <div className="grid gap-6">
        {firstHalf.map((feature, index) => (
          <FeatureItem key={index} {...feature} />
        ))}
      </div>

      {/* CTA Section */}
      <CTASection title={heroTitle} />

      {/* Second Half Features */}
      <div className="grid gap-6">
        {secondHalf.map((feature, index) => (
          <FeatureItem key={index} {...feature} />
        ))}
      </div>

      {/* Total Development Time */}
      <div className="mt-12 p-6 bg-zinc-50 rounded-xl border border-zinc-200">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xl">⏰</span>
          <h3 className="font-semibold text-zinc-800">
            Total Development Time
          </h3>
        </div>
        <p className="text-sm text-zinc-600 leading-relaxed pl-9 mb-2">
          Save hundreds of development hours using our AI demo applications as a
          starting ground for your own app.
        </p>
        <p className="text-lg font-semibold text-zinc-800 pl-9">
          260+ hours saved
        </p>
      </div>
    </div>
  );
}
