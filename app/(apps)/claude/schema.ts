import { z } from 'zod/v3';

export const businessPlanSchema = z.object({
  seoMetadata: z.object({
    title: z
      .string()
      .describe("SEO-optimized title for the business plan (50-60 characters)"),
    subtitle: z
      .string()
      .describe(
        "SEO-optimized subtitle for the business plan (50-100 characters)"
      ),
    description: z
      .string()
      .describe(
        "SEO-optimized description summarizing the business plan (150-160 characters)"
      ),
  }),
  businessIdea: z.object({
    description: z.string().describe("The business idea description."),
    uniqueAspect: z.string().describe("What makes the business idea unique."),
  }),
  targetMarket: z.object({
    demographics: z.string().describe("Key demographics of the target market."),
    marketNeeds: z
      .string()
      .describe("Needs and pain points of the target market."),
  }),
  revenueStreams: z.object({
    streams: z.array(z.string().describe("Revenue streams.")),
    profitability: z
      .string()
      .describe("Explanation of potential profitability."),
  }),
  marketingStrategies: z.object({
    onlineTactics: z.array(z.string().describe("Online marketing tactics.")),
    offlineTactics: z.array(z.string().describe("Offline marketing tactics.")),
  }),
  operationalPlan: z.object({
    dailyOperations: z.string().describe("Day-to-day operations."),
    requiredResources: z.string().describe("Resources needed for operations."),
  }),
  financialPlan: z.object({
    projections: z
      .string()
      .describe("Revenue, expense, and profitability projections."),
  }),
  growthGoals: z.object({
    shortTermGoals: z.string().describe("Short-term growth goals."),
    longTermGoals: z.string().describe("Long-term growth goals."),
    scalingStrategies: z
      .string()
      .describe("Strategies for scaling the business."),
  }),
});

// Export the schema in a way that matches the Vercel AI SDK's expectations
export const functionSchema = businessPlanSchema;
