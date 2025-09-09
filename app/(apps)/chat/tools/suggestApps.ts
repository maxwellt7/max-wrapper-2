import { z } from 'zod';
import { generateObject } from "ai";
import { generateUUID } from "@/lib/ai/chat";
import { customModel } from "@/lib/ai/ai-utils";
import { apps as demoApps } from "@/lib/ai/apps"; // Assuming demoApps structure is suitable
import { AppAnalysisSchema, ToolDefinition } from "./types";

// Define the schema for the suggestApps tool parameters
const suggestAppsSchema = z.object({
  query: z
    .string()
    .describe("The user's requirements or use case for which to suggest apps."),
  tags: z
    .array(z.string())
    .optional()
    .describe(
      "Specific technologies or features requested by the user (e.g., 'React', 'AI')."
    ),
});

// Type for the parameters expected by the execute function
type SuggestAppsParams = z.infer<typeof suggestAppsSchema>;

/**
 * Factory function for the App Suggestion Tool
 * Creates a ToolDefinition for suggesting relevant demo applications based on user query.
 *
 * @param streamWriter - Optional DataStreamWriter for UI updates (e.g., status messages).
 * @returns A ToolDefinition object for the suggestApps tool.
 */
export function suggestAppsToolFactory(): ToolDefinition {
  return {
    description:
      "Suggest relevant demo applications based on user requirements or use case query.",
    inputSchema: suggestAppsSchema,
    execute: async (params: SuggestAppsParams): Promise<any> => {
      const { query, tags } = params;
      const toolCallId = generateUUID();
      console.log(
        "Executing suggestApps tool with query:",
        query,
        "Tags:",
        tags
      );

      try {
        // Skip all pre-filtering and directly use all demo apps
        console.log(
          "Processing query, using all available demo apps for LLM analysis."
        );

        // Prepare data from ALL demo apps for LLM analysis
        const appsDataForLLM = demoApps.map((app) => ({
          id: app.shortTitle,
          title: app.title,
          shortDesc: app.shortDesc,
          tags: app.tags || [],
          primaryUseCases: app.useCases || [],
          keyFeatures: app.features || [],
        }));

        // Status updates handled by v5 architecture

        // Get LLM Analysis for Relevance and Workflow
        const { object: analysis } = await generateObject({
          model: customModel("gpt-4o-mini"),
          output: "object",
          schema: AppAnalysisSchema,
          system: `You are an expert system for matching user software requirements to demo application capabilities.
                   Analyze the user's query and any specified tags against the provided list of available apps.
                   Prioritize suggesting a single app if it fully meets the core requirements.
                   Only suggest combining apps if essential capabilities are split across multiple apps.
                   Focus on matching core functionality, not just keyword occurrences.
                   If the user asks for all demo apps, or provides a very generic query, list all available apps with brief relevance notes.
                   Provide a relevance score (0-1) and reasoning for each match.
                   Indicate if multiple apps are needed and suggest a potential workflow if so.
                   ALWAYS return relevant demo applications if any potentially match, even imperfectly.`,
          prompt: JSON.stringify({
            userQuery: query,
            requiredTags: tags || [],
            availableApps: appsDataForLLM,
          }),
        });

        // Map Analysis Back to Full App Data and Sort
        const relevantApps = analysis.matches
          .map((match) => {
            const app = demoApps.find((a) => a.shortTitle === match.id);
            if (!app) {
              console.warn(
                `LLM suggested app ID ${match.id} not found in demoApps list.`
              );
              return null;
            }
            return {
              ...app,
              _analysis: {
                relevanceScore: match.relevanceScore,
                reasoningText: match.reasoningText,
                isStandaloneMatch: match.isStandaloneMatch,
                requiredCapabilities: match.requiredCapabilities,
              },
            };
          })
          .filter((app): app is NonNullable<typeof app> => app !== null)
          .sort(
            (a, b) =>
              (b._analysis?.relevanceScore ?? 0) -
              (a._analysis?.relevanceScore ?? 0)
          );

        // Return structured result
        return {
          toolCallId,
          apps: relevantApps,
          total: relevantApps.length,
          metadata: {
            needsCombination: analysis.needsCombination,
            analysisSummary: analysis.summary,
            recommendedWorkflow: analysis.recommendedWorkflow,
          },
        };
      } catch (error) {
        console.error("Error in suggestApps tool execution:", error);
        return {
          toolCallId,
          apps: [],
          total: 0,
          error: `Failed to analyze and suggest apps: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        };
      }
    },
  };
}
