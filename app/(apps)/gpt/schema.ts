import { z } from 'zod/v3';

export const growthPlanSchema = z.object({
  seoMetadata: z.object({
    title: z
      .string()
      .describe("SEO-optimized title for the growth plan (50-60 characters)"),
    subtitle: z
      .string()
      .describe(
        "SEO-optimized subtitle for the growth plan (50-100 characters)"
      ),
    description: z
      .string()
      .describe(
        "SEO-optimized description summarizing the growth plan (150-160 characters)"
      ),
  }),
  traditionalGrowthTactics: z
    .array(
      z.object({
        tacticName: z
          .string()
          .describe("Name of the traditional growth method."),
        specificActions: z.array(
          z
            .string()
            .describe(
              "Concrete steps the startup should take to implement this tactic."
            )
        ),
        toolsRecommended: z.array(
          z
            .string()
            .describe(
              "Recommended tools or services that can aid in executing the tactic."
            )
        ),
        keywords: z
          .array(z.string())
          .describe(
            "List of possible keywords the user can target with validation strategy"
          ),
        expectedImpact: z
          .string()
          .describe(
            "The potential impact of the tactic on the startup's growth."
          ),
      })
    )
    .describe("Detailed plans for traditional growth tactics."),
  creativeGrowthHacks: z
    .array(
      z.object({
        campaignName: z
          .string()
          .describe("A catchy name for the creative growth campaign."),
        description: z
          .string()
          .describe("A detailed description of the creative campaign."),
        expectedResults: z
          .string()
          .describe("The anticipated outcomes of the campaign."),
        trackingMetrics: z
          .string()
          .describe("Specific metrics to measure the success of the campaign."),
      })
    )
    .describe("An array of creative growth hacking campaigns."),
});

export const functionSchema = growthPlanSchema;
