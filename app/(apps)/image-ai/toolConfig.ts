// Please read the @/lib/types/toolconfig file for more details on each field.
import { ToolConfig } from "@/lib/types/toolconfig";

export const toolConfig: ToolConfig = {
  ////// Base config
  company: {
    name: "AI Image Studio",
    theme: "image-ai",
    homeUrl: "/apps/image-ai",
    appUrl: "/apps/image-ai/app",
    description:
      "Create stunning AI-generated images with multiple models including SDXL, Flux, Recraft V3, and more. Built with Replicate, Cloudflare R2 & Supabase.",
    logo: "https://cdn1.iconfinder.com/data/icons/education-791/512/learning-knowledge-idea-thinking-create-128.png",
    navbarLinks: [
      { label: "App", href: `/apps/image-ai` },
      { label: "Home", href: "/" },
      { label: "Other apps", href: "/apps" },
      { label: "Blog", href: "/blog" },
    ],
  },

  ////// SEO stuff
  metadata: {
    title: "AI Image Generator Studio | Multiple Models | AnotherWrapper",
    description:
      "Create stunning AI-generated images using multiple state-of-the-art models. Choose from SDXL, Flux, Recraft V3, and more for perfect results.",
    canonical: "https://anotherwrapper.com/apps/image-ai",
  },

  ////// Paywall
  paywall: true,
  credits: 5,

  ////// Location
  toolPath: "(apps)/image-ai",

  ////// AI model configuration
  aiModel: "stability-ai/stable-diffusion-3.5-large-turbo",
};
