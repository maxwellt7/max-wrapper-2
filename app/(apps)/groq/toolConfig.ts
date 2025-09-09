// Please read the @/lib/types/toolconfig file for more details on each field.
import { ToolConfig } from "@/lib/types/toolconfig";

export const toolConfig: ToolConfig = {
  ////// Base config
  company: {
    name: "BrandingGenerator",
    theme: "branding",
    homeUrl: "/apps/groq",
    appUrl: "/apps/groq",
    description:
      "Build your own Llama 3 AI wrapper in minutes with this demo app that uses Groq, LangChain & Supabase.",
    logo: "https://cdn2.iconfinder.com/data/icons/privacy-policy/512/privacy-data-policy-security-05-512.png",
    navbarLinks: [
      { label: "App", href: `/apps/groq` },
      { label: "Home", href: "/" },
      { label: "Other apps", href: "/apps" },
      { label: "Blog", href: "/blog" },
    ],
  },
  ////// SEO stuff
  metadata: {
    title: "Llama 3 AI wrapper demo app | AnotherWrapper",
    description:
      "Build your own Llama 3 AI wrapper in minutes with this demo app that uses Groq, LangChain & Supabase.",
    og_image: "https://anotherwrapper.com/og.png",
    canonical: "https://anotherwrapper.com/apps/groq",
  },

  ////// Paywall
  paywall: true,
  credits: 5,

  ////// Location
  toolPath: "(apps)/groq",

  ////// AI config
  aiModel: "llama-3.3-70b-versatile",
  systemMessage:
    "You are a talented personal coach. You are helping a client build his personal brand. Only reply with the JSON, do not return anything else.",

  ////// Form input
  type: "groq",
  fields: [
    {
      label: "💡 Personal Brand Statement",
      name: "personalBrandStatement",
      type: "textarea",
      placeholder:
        "Describe your personal brand in one sentence. What makes you unique?",
      required: true,
    },
    {
      label: "👥 Target Audience",
      name: "targetAudience",
      type: "input",
      placeholder:
        "Who do you want to reach with your personal brand? (e.g., entrepreneurs, marketers)",
      required: true,
    },
    {
      label: "💻 Current Online Presence",
      name: "currentOnlinePresence",
      type: "select",
      options: [
        "None",
        "Basic social media profiles",
        "Established online presence with website/blog",
        "Strong online presence with multiple platforms",
      ],
      required: true,
    },
    {
      label: "💼 Desired Personal Brand Image",
      name: "desiredPersonalBrandImage",
      type: "select",
      options: [
        "Thought leader/expert",
        "Creative/innovative thinker",
        "Authentic/transparent storyteller",
        "Inspirational/motivational figure",
      ],
      required: true,
    },
  ],
  submitText: "Generate branding plan 🚀",
  submitTextGenerating: "Generating branding ideas...",
  responseTitle: "Your personal branding strategy has been generated",
  responseSubTitle: "Find your personal branding strategy below",

  ////// UI config
  navbarLanding: {
    bgColor: "primary",
    textColor: "text-neutral",
    buttonColor: "accent",
  },

  navbarApp: {
    bgColor: "base-100",
    textColor: "text-base-content",
    buttonColor: "accent",
  },

  footerLanding: {
    bgColor: "accent",
    textColor: "white",
  },

  footerApp: {
    bgColor: "accent",
    textColor: "white",
  },
};
