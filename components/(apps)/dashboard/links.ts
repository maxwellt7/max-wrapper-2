import {
  IconMicrophone,
  IconFileText,
  IconMessage,
  IconPhoto,
  IconEye,
  IconBolt,
  IconMessage2,
  IconRobot,
  IconCurrencyDollar,
  IconPencil,
  IconHome,
  IconHistory,
  IconLayoutDashboard,
  IconBook,
} from "@tabler/icons-react";

type NavLink = {
  href: string;
  label: string;
  icon: any;
  isExternal?: boolean;
  isNew?: boolean;
  isUpdated?: boolean;
};

export const freeTools = [
  {
    href: "https://anotherwrapper.com/open-deep-research",
    label: "Open Deep Research",
    icon: IconBook,
  },
  {
    href: "https://anotherwrapper.com/tools/llm-pricing",
    label: "LLM Pricing Comparison",
    icon: IconCurrencyDollar,
  },
  {
    href: "https://anotherwrapper.com/tools/ai-app-generator",
    label: "AI App Generator",
    icon: IconRobot,
  },
];

export const overviewLinks: NavLink[] = [
  { href: "/apps", label: "Overview", icon: IconLayoutDashboard },
  {
    href: "https://anotherwrapper.lemonsqueezy.com/affiliates",
    isExternal: true,
    label: "Affiliates (50%)",
    icon: IconCurrencyDollar,
  },
];

export const navlinks: NavLink[] = [
  {
    href: "/apps/chat",
    label: "Chat AI",
    icon: IconMessage2,
    isExternal: false,
    isNew: true,
  },
  {
    href: "/apps/studio",
    label: "GPT Image",
    icon: IconPhoto,
    isNew: true,
  },
  {
    href: "/apps/image-ai",
    label: "Image AI",
    icon: IconPhoto,
    isNew: false,
  },

  { href: "/apps/pdf", label: "PDF AI", icon: IconFileText },
  {
    href: "/apps/audio",
    label: "Audio AI",
    icon: IconMicrophone,
    isUpdated: false,
  },
  { href: "/apps/grok", label: "Grok xAI", icon: IconBolt },
  { href: "/apps/vision", label: "Vision AI", icon: IconEye },
  {
    href: "/apps/claude",
    label: "Claude 4 Sonnet",
    icon: IconRobot,
  },
  { href: "/apps/gpt", label: "OpenAI GPT-4o", icon: IconMessage },
  { href: "/apps/groq", label: "Llama 3", icon: IconBolt },
  { href: "/apps/dalle", label: "DALL-E", icon: IconPhoto },
  { href: "/apps/voice", label: "Voice AI", icon: IconMicrophone },
];

export const landingPages = [
  { href: "/landing-pages/audio", label: "Audio AI", icon: IconMicrophone },
  { href: "/landing-pages/llama", label: "Llama 3", icon: IconBolt },
  { href: "/landing-pages/gpt", label: "OpenAI GPT", icon: IconMessage },
  { href: "/landing-pages/dalle", label: "DALL-E", icon: IconPhoto },
  { href: "/landing-pages/vision", label: "Vision AI", icon: IconEye },
  {
    href: "/landing-pages/sdxl",
    label: "Stable Diffusion XL",
    icon: IconPhoto,
  },
];

export const otherLinks = [
  { href: "/", label: "Home", icon: IconHome },
  {
    href: "https://docs.anotherwrapper.com",
    label: "Documentation",
    icon: IconFileText,
  },
  {
    href: "https://anotherwrapper.lemonsqueezy.com/affiliates",
    label: "Affiliates Program",
    icon: IconCurrencyDollar,
  },
  {
    href: "https://anotherwrapper.com/blog",
    label: "Blog",
    icon: IconPencil,
  },
];
