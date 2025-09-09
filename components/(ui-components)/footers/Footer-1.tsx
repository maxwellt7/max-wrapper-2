import { TwitterLogoIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FooterStyle {
  bgColor: string;
  textColor: string;
}
interface CompanyConfig {
  name: string;
  theme: string;
  homeUrl: string;
  appUrl: string;
  description: string;
  logo: string;
  navbarLinks: { label: string; href: string }[];
}

const footerNavs = [
  {
    label: "Product",
    items: [
      {
        href: "https://anotherwrapper.lemonsqueezy.com/affiliates",
        name: "Affiliates (50%)",
      },
      {
        href: "/blog",
        name: "Blog",
      },
      {
        href: "/#features",
        name: "Features",
      },
      {
        href: "/#demos",
        name: "Demo Apps",
      },
      {
        href: "/#pricing",
        name: "Pricing",
      },
    ],
  },
  {
    label: "Free tools",
    items: [
      {
        href: "https://anotherwrapper.com/tools/llm-pricing",
        name: "LLM pricing comparison",
      },
      {
        href: "https://anotherwrapper.com/tools/ai-app-generator",
        name: "AI App Generator",
      },
    ],
  },
  {
    label: "Legal",
    items: [
      {
        href: "/privacy",
        name: "Privacy Policy",
      },
      {
        href: "/terms",
        name: "Terms and Conditions",
      },
    ],
    subSection: {
      label: "Other",
      items: [
        {
          href: "https://docs.anotherwrapper.com",
          name: "Documentation",
        },
        {
          href: "/#faq",
          name: "FAQ",
        },
        {
          href: "mailto:admin@anotherwrapper.com",
          name: "Support",
        },
      ],
    },
  },
  {
    label: "Demo Apps",
    items: [
      {
        href: "https://anotherwrapper.com/apps/chat",
        name: "Chatbot with history",
      },
      {
        href: "https://anotherwrapper.com/apps/pdf",
        name: "Chat with PDF",
      },
      {
        href: "https://anotherwrapper.com/apps/audio",
        name: "Transcribe audio",
      },
      {
        href: "https://anotherwrapper.com/apps/gpt",
        name: "Generate text with GPT",
      },
      {
        href: "https://anotherwrapper.com/apps/groq",
        name: "Generate text with LLaMA",
      },
      {
        href: "https://anotherwrapper.com/apps/openai/vision",
        name: "Analyze images with GPT-4o",
      },
      {
        href: "https://anotherwrapper.com/apps//dalle",
        name: "Generate logos with DALL·E",
      },
      {
        href: "https://anotherwrapper.com/apps//sdxl",
        name: "Generate logos with SDXL",
      },
      {
        href: "https://anotherwrapper.com/apps/claude",
        name: "Generate text with Claude 3.5 Sonnet",
      },
      {
        href: "https://anotherwrapper.com/apps/voice",
        name: "Text to speech using Elevenlabs",
      },
    ],
  },
];

const footerSocials = [
  {
    href: "https://twitter.com/anotherwrapper",
    name: "Twitter",
    icon: <TwitterLogoIcon className="size-4" />,
  },
];

export default function Footer({
  footerConfig,
  companyConfig,
}: {
  footerConfig: FooterStyle;
  companyConfig: CompanyConfig;
}) {
  return (
    <footer className="border-t border-neutral-800 bg-neutral-900 text-neutral-300">
      <div className="mx-auto w-full max-w-screen-xl px-4">
        <div className="gap-4 p-4 py-16 sm:pb-16 md:flex md:justify-between">
          <div className="mb-12 flex flex-col gap-4 mr-4">
            <a href="/" className="flex items-center gap-2">
              <Image
                src="/logo-text-dark.png"
                alt="Logo"
                width={400}
                height={100}
                layout="fixed"
                quality={100}
                className="w-48"
              />{" "}
            </a>
            <div className="max-w-sm">
              <div className="z-10 mt-4 flex w-full flex-col items-start text-left">
                <h2 className="text-xl font-bold text-white">
                  Demo App: {companyConfig.name}
                </h2>
                <p className="mt-2 text-neutral-400 text-xs">
                  {companyConfig.description}{" "}
                </p>
                <a
                  href="https://anotherwrapper.lemonsqueezy.com/buy/c1a15bd7-58b0-4174-8d1a-9bca6d8cb511"
                  className={cn(
                    buttonVariants({
                      size: "lg",
                      variant: "default",
                    }),
                    "mt-4 w-full rounded-full bg-white hover:bg-white px-6 text-sm font-semibold text-neutral-900 tracking-tighter transition-all ease-out hover:ring-2 hover:ring-white hover:ring-offset-2 hover:ring-offset-neutral-900"
                  )}
                >
                  Start now
                  <ChevronRightIcon className="ml-1 size-4 transition-all duration-300 ease-out group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {footerNavs.map((nav) => (
              <div key={nav.label}>
                <h2 className="mb-6 text-xs font-semibold uppercase text-white">
                  {nav.label}
                </h2>
                <ul className="grid gap-2">
                  {nav.items.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className="group text-xs inline-flex cursor-pointer items-center justify-start gap-1 text-neutral-400 duration-200 hover:text-white hover:opacity-90"
                      >
                        {item.name}
                        <ChevronRight className="h-4 w-4 translate-x-0 transform opacity-0 transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:opacity-100" />
                      </a>
                    </li>
                  ))}
                </ul>
                {nav.subSection && (
                  <>
                    <h2 className="mb-6 mt-6 text-xs font-semibold uppercase text-white">
                      {nav.subSection.label}
                    </h2>
                    <ul className="grid gap-2">
                      {nav.subSection.items.map((item) => (
                        <li key={item.name}>
                          <a
                            href={item.href}
                            className="group text-xs inline-flex cursor-pointer items-center justify-start gap-1 text-neutral-400 duration-200 hover:text-white hover:opacity-90"
                          >
                            {item.name}
                            <ChevronRight className="h-4 w-4 translate-x-0 transform opacity-0 transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:opacity-100" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-neutral-800 py-4 sm:flex sm:flex-row sm:items-center sm:justify-between">
          <div className="flex space-x-5 sm:mt-0 sm:justify-center">
            {footerSocials.map((social) => (
              <a
                key={social.name}
                href={social.href}
                className="fill-gray-500 text-gray-500 hover:fill-gray-900 hover:text-gray-900 dark:hover:fill-gray-600 dark:hover:text-gray-600"
              >
                {social.icon}
                <span className="sr-only">{social.name}</span>
              </a>
            ))}
          </div>
          <span className="text-xs tracking-tight text-neutral-400 sm:text-center">
            Copyright © {new Date().getFullYear()}{" "}
            <a href="/" className="cursor-pointer hover:text-white">
              FD Digital
            </a>
            . All Rights Reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
