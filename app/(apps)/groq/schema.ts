import { z } from 'zod/v3';

export const personalBrandSchema = z.object({
  seoMetadata: z.object({
    title: z
      .string()
      .describe(
        "SEO-optimized title for the personal branding strategy (50-60 characters)"
      ),
    subtitle: z
      .string()
      .describe(
        "SEO-optimized subtitle for the personal branding strategy (50-100 characters)"
      ),
    description: z
      .string()
      .describe(
        "SEO-optimized description summarizing the personal branding strategy (150-160 characters)"
      ),
  }),
  personalBrandPositioning: z.object({
    statement: z
      .string()
      .describe("The personalized brand positioning statement."),
    uniqueValueProposition: z
      .string()
      .describe("The individual's unique value proposition."),
  }),
  contentStrategy: z.object({
    contentTypes: z.array(
      z.string().describe("Content types recommended for the individual.")
    ),
    contentCalendar: z
      .string()
      .describe(
        "A suggested content calendar to maintain consistency and engagement."
      ),
  }),
  onlinePresence: z.object({
    socialMediaPlatforms: z.array(
      z
        .string()
        .describe("Social media platforms recommended for the individual.")
    ),
    profileOptimizationTips: z
      .string()
      .describe(
        "Tips for optimizing online profiles to maintain a consistent personal brand image."
      ),
  }),
  networkingAndCollaboration: z.object({
    networkingEvents: z.array(
      z
        .string()
        .describe(
          "Networking events or conferences recommended for the individual."
        )
    ),
    collaborationIdeas: z
      .string()
      .describe(
        "Ideas for collaborating with other professionals in the industry."
      ),
  }),
});

export const functionSchema = personalBrandSchema;
