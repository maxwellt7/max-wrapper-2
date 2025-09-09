import { apps } from "@/lib/ai/apps";
import { createClient } from "@/lib/utils/supabase/server";
import { loops } from "@/lib/clients/loops";
import { HeaderApps } from "@/components/(apps)/dashboard/header-apps";
import { FaqSection } from "@/components/(apps)/dashboard/faq-section";
import { DashboardLayout } from "@/components/(apps)/dashboard/layout";
import Image from "next/image";
import Link from "next/link";
import {
  BrainCircuitIcon,
  FileTextIcon,
  ImageIcon,
  SparklesIcon,
  DatabaseIcon,
  LockIcon,
  CreditCardIcon,
  MailIcon,
  LineChartIcon,
} from "lucide-react";
import { ReactNode } from "react";

export const metadata = {
  title: "Next.js Templates & AI Boilerplate Code | AI Wrapper Templates",
  description:
    "Production-ready Next.js templates and AI boilerplate code. Start your AI project with pre-built AI templates, authentication, payments, and more.",
  keywords:
    "nextjs template, nextjs templates, boilerplate code, ai wrapper, nextjs boilerplate",
};

export const revalidate = 0;

export default async function Page() {
  const client = await createClient();

  const {
    data: { user },
  } = await client.auth.getUser();

  if (user) {
    /// Once you have set up your Loops API key, you can uncomment the code below to create a contact in Loops when a user logs in
    // If contact already exists, it will simply return an error
    const userMetadata = user.user_metadata;
    const userEmail = user.email;
    const userName = userMetadata.full_name || userMetadata.name;

    if (userEmail) {
      const contactProperties = {
        purchased: false,
        ...(userName && { firstName: userName }),
      };

      await loops.createContact(userEmail, contactProperties);
    }
  }

  // Group AI providers by category
  interface ProviderItem {
    name: string;
    logo: string;
  }

  interface CapabilityItem {
    name: string;
    icon: ReactNode;
  }

  const providers: {
    "AI Integrations & Services": ProviderItem[];
    Capabilities: CapabilityItem[];
  } = {
    "AI Integrations & Services": [
      { name: "OpenAI", logo: "/providers/openai.webp" },
      { name: "Anthropic", logo: "/providers/anthropic.jpeg" },
      { name: "Meta", logo: "/providers/meta.jpeg" },
      { name: "Google", logo: "/providers/google.svg" },
      { name: "xAI", logo: "/providers/xai.png" },
      { name: "Groq", logo: "/providers/groq.png" },
      { name: "Replicate", logo: "/providers/replicate.png" },
      { name: "DeepSeek", logo: "/providers/deepseek.png" },
      { name: "ElevenLabs", logo: "/providers/elevenlabs.svg" },
      { name: "Supabase", logo: "/providers/supabase.png" },
      { name: "Stripe", logo: "/providers/stripe.jpeg" },
      { name: "LemonSqueezy", logo: "/providers/lemonsqueezy.jpeg" },
      { name: "Cloudflare R2", logo: "/providers/cloudflare.png" },
      { name: "Posthog", logo: "/providers/posthog.png" },
      { name: "Loops", logo: "/providers/loops.svg" },
      { name: "Tailwind", logo: "/providers/tailwind.png" },
    ],
    Capabilities: [
      {
        name: "Text AI",
        icon: (
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
            <FileTextIcon className="h-5 w-5 text-blue-500" />
          </div>
        ),
      },
      {
        name: "Image AI",
        icon: (
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
            <ImageIcon className="h-5 w-5 text-purple-500" />
          </div>
        ),
      },
      {
        name: "Computer Vision",
        icon: (
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-green-500"
            >
              <circle cx="12" cy="12" r="2" />
              <path d="M12 19c-4.2 0-7-1.3-7-6V6.2a2 2 0 0 1 .6-1.4A20.7 20.7 0 0 1 12 2c4.2 0 7 1.3 7 6v6.8a2 2 0 0 1-.6 1.4A20.7 20.7 0 0 1 12 19Z" />
              <path d="M12 19v3" />
              <path d="M10 22h4" />
            </svg>
          </div>
        ),
      },
      {
        name: "PDF Processing",
        icon: (
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-red-500"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M9 14.5a.5.5 0 1 1 1 0 .5.5 0 0 1-1 0Z" />
              <path d="M9 11.5a.5.5 0 1 1 1 0 .5.5 0 0 1-1 0Z" />
              <path d="M14 14.5a.5.5 0 1 1 1 0 .5.5 0 0 1-1 0Z" />
              <path d="M14 11.5a.5.5 0 1 1 1 0 .5.5 0 0 1-1 0Z" />
            </svg>
          </div>
        ),
      },
      {
        name: "Speech to Text",
        icon: (
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-amber-500"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
              <line x1="8" y1="22" x2="16" y2="22" />
            </svg>
          </div>
        ),
      },
      {
        name: "Text to Speech",
        icon: (
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-100 to-cyan-50 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-cyan-500"
            >
              <path d="M16 10c0 2.3-1.8 4-4 4s-4-1.7-4-4c0-2.2 1.8-4 4-4s4 1.8 4 4z" />
              <path d="M16 10v2a6 6 0 0 1-12 0v-2" />
              <path d="m19 8-2 2 2 2" />
              <path d="m5 8 2 2-2 2" />
            </svg>
          </div>
        ),
      },
      {
        name: "Smart Chat",
        icon: (
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-indigo-500"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <path d="M8 10h.01" />
              <path d="M12 10h.01" />
              <path d="M16 10h.01" />
            </svg>
          </div>
        ),
      },
      {
        name: "Function Calling",
        icon: (
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-100 to-teal-50 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-teal-500"
            >
              <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1" />
              <path d="M16 21h1a2 2 0 0 0 2-2v-5a2 2 0 0 1 2-2 2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1" />
            </svg>
          </div>
        ),
      },
    ],
  };

  // Core features that all templates include
  const coreFeatures = [
    {
      icon: <LockIcon className="w-4 h-4" />,
      title: "Authentication",
      description: "User accounts and profiles with Supabase Auth",
      color: "from-blue-500 to-indigo-600",
    },
    {
      icon: <DatabaseIcon className="w-4 h-4" />,
      title: "Database",
      description: "Powerful PostgreSQL database with Supabase",
      color: "from-emerald-500 to-green-600",
    },
    {
      icon: <CreditCardIcon className="w-4 h-4" />,
      title: "Payments",
      description: "Credit-based consumption & one-time payments",
      color: "from-violet-500 to-purple-600",
    },
    {
      icon: <MailIcon className="w-4 h-4" />,
      title: "Email",
      description: "Transactional emails with Loops",
      color: "from-amber-500 to-orange-600",
    },
    {
      icon: <LineChartIcon className="w-4 h-4" />,
      title: "Analytics",
      description: "User behavior tracking and insights",
      color: "from-rose-500 to-pink-600",
    },
    {
      icon: <SparklesIcon className="w-4 h-4" />,
      title: "Responsive UI",
      description: "Beautiful interfaces with shadcn/ui",
      color: "from-cyan-500 to-blue-600",
    },
  ];

  return (
    <DashboardLayout showGreeting={false}>
      <main
        className="mx-auto w-full px-6 lg:px-8 max-w-screen-xl mb-auto relative bg-white"
        data-theme="anotherwrapper"
      >
        {/* Decorative background blur */}
        <div className="w-[600px] h-40 select-none pointer-events-none blur-[100px] opacity-50 absolute -rotate-12 -top-44 -left-20" />
        {/* Header Section */}
        <HeaderApps />
        {/* Correctly placed wrapper for content below header */}
        <div className="max-w-6xl mx-auto">
          {/* Summary Section */}
          <div className="mt-12">
            <div className="bg-gradient-to-br from-white/70 to-white/30 backdrop-blur-xl rounded-3xl p-6 md:p-8">
              {/* Highlight banner for 10 AI apps */}
              <div className="mb-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-4 text-white flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white bg-opacity-20 rounded-full p-2">
                    <BrainCircuitIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">
                      10 Ready-to-use AI applications
                    </h3>
                    <p className="text-sm text-white text-opacity-90">
                      Full source code with all AI integrations, authentication,
                      payments, and database
                    </p>
                  </div>
                </div>
                <Link
                  href="#apps-section"
                  className="hidden md:flex items-center bg-white text-blue-600 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-opacity-90 transition-colors"
                >
                  See all apps
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ml-1.5"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* AI Providers */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="relative mr-2">
                      <span className="absolute inset-0 bg-blue-400/20 blur-sm rounded-full"></span>
                      <BrainCircuitIcon className="w-5 h-5 text-blue-600 relative" />
                    </span>
                    AI Providers & Models
                  </h2>
                  <div className="space-y-5">
                    {Object.entries(providers).map(([category, items]) => (
                      <div key={category}>
                        <h3 className="text-sm font-medium text-gray-500 mb-3">
                          {category}
                        </h3>
                        {category === "Capabilities" ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {(items as CapabilityItem[]).map((capability) => (
                              <div
                                key={capability.name}
                                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                              >
                                {capability.icon}
                                <span className="text-sm font-medium text-gray-700">
                                  {capability.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                            {(items as ProviderItem[]).map((provider) => (
                              <div
                                key={provider.name}
                                className="flex flex-col items-center justify-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                              >
                                <div className="w-8 h-8 relative mb-2">
                                  <Image
                                    src={provider.logo}
                                    alt={provider.name}
                                    fill
                                    className="object-contain"
                                  />
                                </div>
                                <span className="text-xs font-medium text-gray-700">
                                  {provider.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Core Features */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="relative mr-2">
                      <span className="absolute inset-0 bg-amber-400/20 blur-sm rounded-full"></span>
                      <SparklesIcon className="w-5 h-5 text-amber-500 relative" />
                    </span>
                    Complete SaaS package
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {coreFeatures.map((feature, index) => (
                      <div
                        key={feature.title}
                        className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div
                          className={`w-8 h-8 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center mb-3 shadow-sm`}
                        >
                          <div className="text-white">{feature.icon}</div>
                        </div>
                        <h3 className="text-sm font-medium text-gray-800 mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {feature.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Apps Section with Improved Cards */}
          <div id="apps-section" className="mt-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Ready-to-use AI demo apps
              </h2>
              <div className="mt-2 md:mt-0 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 text-blue-700 font-medium text-sm flex items-center">
                <BrainCircuitIcon className="w-4 h-4 mr-2 text-blue-500" />
                <span>10+ complete AI applications included</span>
              </div>
            </div>

            {/* Value proposition banner */}
            <div className="mb-8 bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-xl border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="bg-blue-500 rounded-full p-2 mt-0.5">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-1">
                    All 10 AI demo apps included in your purchase
                  </h3>
                  <p className="text-sm text-gray-600">
                    Each application is production-ready with full source code,
                    authentication, payments, database, and all the AI
                    integrations shown below.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {apps.map((app, index) => (
                <div
                  key={app.href}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:border-gray-200 overflow-hidden flex flex-col"
                >
                  {/* App Image */}
                  <div className="relative h-40 overflow-hidden">
                    <Image
                      src={app.image}
                      alt={app.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    <div className="absolute bottom-3 left-3">
                      <h3 className="text-lg font-semibold text-white">
                        {app.shortTitle}
                      </h3>
                      <p className="text-sm text-white/90">{app.shortDesc}</p>
                    </div>
                  </div>

                  {/* App Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {app.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700"
                        >
                          {tag}
                        </span>
                      ))}
                      {app.tags.length > 4 && (
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                          +{app.tags.length - 4} more
                        </span>
                      )}
                    </div>

                    {/* Features */}
                    <div className="mb-5">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Key Features
                      </h4>
                      <ul className="grid grid-cols-1 gap-y-1">
                        {app.simpleFeatures.slice(0, 3).map((feature) => (
                          <li
                            key={feature}
                            className="text-sm text-gray-600 flex items-center gap-2"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-300" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Actions */}
                    <div className="mt-auto pt-4 flex gap-3">
                      <Link
                        href={`${app.href}`}
                        className="px-4 py-2 rounded-lg bg-[#0F172A] text-white text-sm font-medium hover:bg-black transition-colors flex-1 text-center"
                      >
                        Try Demo
                      </Link>
                      <Link
                        href="https://anotherwrapper.lemonsqueezy.com/buy/c1a15bd7-58b0-4174-8d1a-9bca6d8cb511"
                        target="_blank"
                        rel="noopener"
                        className="px-4 py-2 rounded-lg bg-white text-gray-700 text-sm font-medium border border-gray-200 hover:border-gray-300 transition-colors"
                      >
                        Purchase
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section at the bottom */}
          <div className="mt-16">
            <FaqSection />
          </div>
        </div>{" "}
      </main>
    </DashboardLayout>
  );
}
