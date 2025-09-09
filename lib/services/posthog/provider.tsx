"use client";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

if (typeof window !== "undefined") {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  
  // Only initialize PostHog if properly configured
  if (posthogKey && posthogHost && !posthogKey.includes('dummy') && !posthogHost.includes('dummy')) {
    posthog.init(posthogKey, {
      api_host: posthogHost,
      capture_pageview: true,
    });
  }
}

export function PHProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
