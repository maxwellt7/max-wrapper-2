import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { NextResponse, NextRequest } from "next/server";
import { uploadToSupabase, reduceUserCredits, getUserCredits } from "@/lib/db/mutations";
import { authMiddleware } from "@/lib/middleware/authMiddleware";
import { generatePrompt } from "@/app/(apps)/gpt/prompt";
import { functionSchema } from "@/app/(apps)/gpt/schema";
import { toolConfig } from "@/app/(apps)/gpt/toolConfig";

/**
 * API Route: Handles AI interactions using OpenAI's GPT models.
 *
 * **Features:**
 * - Leverages OpenAI's GPT for advanced language processing
 * - Supports structured output based on function schemas
 * - Handles dynamic tool configurations and prompts
 * - Stores generation history in Supabase
 * - Integrates with credit system for paywall management
 *
 * **Process:**
 * 1. Authenticates the user
 * 2. Loads dynamic tool configurations
 * 3. Generates structured response using GPT
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

    // Check if paywall is enabled and validate user credits BEFORE processing
    if (toolConfig.paywall) {
      const userCredits = await getUserCredits(user.email);
      
      if (userCredits === null || userCredits === undefined) {
        return NextResponse.json(
          { error: "Unable to verify user credits" },
          { status: 400 }
        );
      }

      if (userCredits < toolConfig.credits) {
        return NextResponse.json(
          { 
            error: "Insufficient credits", 
            message: `You have ${userCredits} credits but need ${toolConfig.credits} credits to use this service.`,
            creditsRequired: toolConfig.credits,
            creditsAvailable: userCredits
          },
          { status: 402 } // Payment Required
        );
      }
    }

    // Generate response using GPT through Vercel AI SDK
    const { object: responseData } = await generateObject({
      model: openai(toolConfig.aiModel),
      schema: functionSchema,
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
    console.error("Error in GPT route:", error);
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
