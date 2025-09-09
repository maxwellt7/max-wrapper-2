import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { NextResponse, NextRequest } from "next/server";
import { uploadToSupabase, reduceUserCredits } from "@/lib/db/mutations";
import { authMiddleware } from "@/lib/middleware/authMiddleware";
import { generatePrompt } from "@/app/(apps)/claude/prompt";
import { businessPlanSchema } from "@/app/(apps)/claude/schema";
import { toolConfig } from "@/app/(apps)/claude/toolConfig";
import { validateUserCredits } from "@/lib/utils/creditValidation";

/**
 * API Route: Handles AI interactions using Anthropic's Claude model via Vercel AI SDK.
 *
 * **Features:**
 * - Uses Claude for high-quality, context-aware responses
 * - Supports structured output based on function schemas
 * - Handles dynamic tool configurations and prompts
 * - Stores generation history in Supabase
 * - Integrates with credit system for paywall management
 *
 * **Process:**
 * 1. Authenticates the user
 * 2. Loads dynamic tool configurations
 * 3. Generates structured response using Claude
 * 4. Stores the response in database
 * 5. Manages user credits if paywall is enabled
 *
 * @param {NextRequest} request - The incoming request with toolPath and parameters
 * @returns {Promise<NextResponse>} JSON response containing the generation ID
 */
export async function POST(request: NextRequest) {
  // Authenticate user
  const authResponse = await authMiddleware(request);
  if (authResponse.status === 401) return authResponse;

  // Get user from the middleware-enhanced request
  const user = (request as any).user;

  try {
    const requestBody = await request.json();

    // Validate user credits before processing
    const creditValidation = await validateUserCredits(user.email, toolConfig, "use Claude AI");
    if (!creditValidation.isValid) {
      return creditValidation.response!;
    }

    // Generate response using Claude through Vercel AI SDK
    const { object: responseData } = await generateObject({
      model: anthropic(toolConfig.aiModel),
      schema: businessPlanSchema,
      system: toolConfig.systemMessage,
      prompt: generatePrompt(requestBody),
    });

    // Store generation in database
    const supabaseResponse = await uploadToSupabase(
      requestBody,
      responseData,
      toolConfig.toolPath,
      toolConfig.aiModel
    );

    // Handle paywall credits
    if (toolConfig.paywall) {
      await reduceUserCredits(user.email, toolConfig.credits);
    }

    return new NextResponse(
      JSON.stringify({
        slug: supabaseResponse[0].slug,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in Claude route:", error);
    return new NextResponse(
      JSON.stringify({
        status: "Error",
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      }),
      { status: 500 }
    );
  }
}
