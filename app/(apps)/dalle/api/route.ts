import { generateImageResponse } from "@/lib/services/openai/dalle";
import { NextResponse, NextRequest } from "next/server";
import { uploadToSupabase, reduceUserCredits } from "@/lib/db/mutations";
import { authMiddleware } from "@/lib/middleware/authMiddleware";
import { uploadFile } from "@/lib/hooks/useFileUpload";
import { toolConfig } from "@/app/(apps)/dalle/toolConfig";
import { generatePrompt } from "@/app/(apps)/dalle/prompt";
import { validateUserCredits } from "@/lib/utils/creditValidation";

/**
 * API Route: Generates images using OpenAI's DALL·E and handles the response.
 *
 * **Process:**
 * 1. Authenticates the user.
 * 2. Parses the request body to extract prompts and parameters.
 * 3. Generates an image using the OpenAI DALL·E API.
 * 4. Uploads the generated image to cloud storage using `uploadFile`.
 * 5. Stores metadata in Supabase.
 * 6. Reduces user credits if paywall is enabled.
 * 7. Returns the image URL and database record ID to the client.
 *
 * @param {NextRequest} request - The incoming request object.
 * @returns {Promise<NextResponse>} JSON response containing the image URL and ID.
 */
export async function POST(request: NextRequest) {
  // Authenticate the user and get user data
  const authResponse = await authMiddleware(request);
  if (authResponse.status === 401) return authResponse;

  // Get user from the middleware-enhanced request
  const user = (request as any).user;

  try {
    const requestBody = await request.json();

    // Validate user credits before processing
    const creditValidation = await validateUserCredits(user.email, toolConfig, "generate an image");
    if (!creditValidation.isValid) {
      return creditValidation.response!;
    }

    // Generate the prompt
    const prompt = generatePrompt(requestBody);

    // Generate image using OpenAI DALL·E
    const responseData = await generateImageResponse(
      prompt,
      toolConfig.aiModel
    );

    // Check if response has valid data
    if (!responseData.data || responseData.data.length === 0) {
      throw new Error("No image data received from OpenAI");
    }

    // Get the image URL from the OpenAI response
    const imageUrl = responseData.data[0]?.url;
    if (typeof imageUrl !== "string") {
      throw new Error("Invalid image URL received from OpenAI");
    }

    // Upload the image to cloud storage using `uploadFile`
    const { url: uploadedImageUrl } = await uploadFile({
      imageUrl,
      uploadPath: toolConfig.upload?.path || "/dalle-logo",
      skipMetadata: false,
      userId: user.id,
    });

    // Store the response in Supabase
    const supabaseResponse = await uploadToSupabase(
      requestBody,
      uploadedImageUrl,
      toolConfig.toolPath,
      toolConfig.aiModel
    );

    // Reduce user credits if paywall is enabled
    if (toolConfig.paywall === true) {
      await reduceUserCredits(requestBody.email, toolConfig.credits);
    }

    // Return the ID and image URL to the client
    return NextResponse.json(
      {
        id: supabaseResponse[0].id,
        imageUrl: uploadedImageUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in DALL·E route:", error);
    return NextResponse.json(
      {
        status: "Error",
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
