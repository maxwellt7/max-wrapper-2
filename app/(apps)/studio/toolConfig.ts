import { ToolConfig } from "@/lib/types/toolconfig";

export const toolConfig: ToolConfig = {
  ////// Base config
  company: {
    name: "GPT Image Studio",
    theme: "anotherwrapper",
    homeUrl: "/apps/studio",
    appUrl: "/apps/studio",
    description:
      "Generate and edit images using AI. Upload your own images for variations or start from scratch with a prompt.",
    logo: "https://cdn0.iconfinder.com/data/icons/basic-ui-elements-2-3/24/101-photo-picture-landscape-image-gallery-512.png", // Example logo
    navbarLinks: [
      { label: "App", href: `/apps/studio` },
      { label: "Home", href: "/" },
      { label: "Other apps", href: "/apps" },
      { label: "Blog", href: "/blog" },
    ],
  },
  ////// Location
  toolPath: "(apps)/studio",

  ////// SEO stuff
  metadata: {
    title: "GPT Image Studio | AnotherWrapper",
    description:
      "Generate and edit images with AI. Upload your own images or start from scratch.",
    canonical: "https://anotherwrapper.com/apps/studio",
  },

  ////// Payments
  paywall: true, // Set to true to enable credit consumption
  credits: 5, // Adjust if paywall is enabled

  ////// AI config
  aiModel: "gpt-image-1",

  ////// Storage config
  upload: {
    path: "/studio", // Matches the upload path in the API route
  },
};
