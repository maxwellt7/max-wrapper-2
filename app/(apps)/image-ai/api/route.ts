import { NextRequest, NextResponse } from "next/server";
import { experimental_generateImage as generateImage } from "ai";
import { replicate } from "@ai-sdk/replicate";
import { authMiddleware } from "@/lib/middleware/authMiddleware";
import { uploadFile } from "@/lib/hooks/useFileUpload";
import { uploadToSupabase, reduceUserCredits } from "@/lib/db/mutations";
import { revalidateTag } from "next/cache";
import { toolConfig } from "@/app/(apps)/image-ai/toolConfig";
import { imageGenerationRequestSchema } from "@/lib/ai/image-ai";
import { z } from "zod/v3";
import { validateUserCredits } from "@/lib/utils/creditValidation";

const TIMEOUT_MILLIS = 55 * 1000;
const DEFAULT_IMAGE_SIZE = "1024x1024";
const UPLOAD_PATH = "images/ai-generated";

const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMillis: number
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), timeoutMillis)
    ),
  ]);
};

/**
 * API Route: Generates images using various Replicate models and handles the response.
 *
 * **Process:**
 * 1. Authenticates the user.
 * 2. Validates and parses the request body using Zod schema.
 * 3. Validates user has sufficient credits before processing.
 * 4. Runs the specified model on Replicate to generate an image.
 * 5. Uploads the generated image to cloud storage using `uploadFile`.
 * 6. Stores metadata in Supabase.
 * 7. Reduces user credits if paywall is enabled.
 * 8. Revalidates the cache for this user's generations.
 * 9. Returns the image URL and database record ID to the client.
 */
export async function POST(req: NextRequest) {
  // Authenticate the user and get user data
  const authResponse = await authMiddleware(req);
  if (authResponse.status === 401) return authResponse;

  // Get user from the middleware-enhanced request
  const user = (req as any).user;
  const requestId = Math.random().toString(36).substring(7);

  try {
    // Parse and validate request body with Zod
    const body = await req.json();
    const validationResult = imageGenerationRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request parameters",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { prompt, modelId } = validationResult.data;

    // Validate user credits before processing
    const creditValidation = await validateUserCredits(
      user.email,
      toolConfig,
      "generate an image"
    );
    if (!creditValidation.isValid) {
      return creditValidation.response!;
    }

    console.log(
      `Starting image generation [requestId=${requestId}, model=${modelId}, user=${user.email}]`
    );

    const startstamp = performance.now();
    const generatePromise = generateImage({
      model: replicate.image(modelId),
      prompt,
      size: DEFAULT_IMAGE_SIZE,
      seed: Math.floor(Math.random() * 1000000),
    });

    const { image, warnings } = await withTimeout(
      generatePromise,
      TIMEOUT_MILLIS
    );

    if (warnings?.length > 0) {
      console.warn(
        `Warnings [requestId=${requestId}, model=${modelId}]: `,
        warnings
      );
    }

    if (!image || (!image.base64 && !image.uint8Array)) {
      throw new Error("No valid image data received from the model");
    }

    // Get base64 data (removing data URL prefix if present)
    const base64Data = image.base64.includes("base64,")
      ? image.base64.split(",")[1]
      : image.base64;

    // Create buffer from base64
    const imageBuffer = Buffer.from(base64Data, "base64");

    // Upload the image to cloud storage using the buffer
    const { url: uploadedImageUrl } = await uploadFile({
      file: {
        arrayBuffer: async () => imageBuffer.buffer as ArrayBuffer,
        type: "image/png",
        name: `ai-generated-${Date.now()}.png`,
      },
      uploadPath: UPLOAD_PATH,
      skipMetadata: false,
      userId: user.id,
    });

    // Store the response in Supabase with user email
    const supabaseResponse = await uploadToSupabase(
      {
        prompt,
        modelId,
        email: user.email,
      },
      uploadedImageUrl,
      "image-ai",
      modelId
    );

    // Reduce user credits only after successful generation
    if (toolConfig.paywall) {
      await reduceUserCredits(user.email, toolConfig.credits);
    }

    // Revalidate the cache for this user's generations
    revalidateTag(`user_${user.email}_generations`);

    console.log(
      `Completed image request [requestId=${requestId}, model=${modelId}, user=${
        user.email
      }, elapsed=${((performance.now() - startstamp) / 1000).toFixed(1)}s].`
    );

    return NextResponse.json({
      id: supabaseResponse[0].id,
      imageUrl: uploadedImageUrl,
      image: base64Data, // Return the clean base64 string without data URL prefix
    });
  } catch (error) {
    console.error(`Error generating image [requestId=${requestId}]: `, error);

    // Check if it's a Zod validation error
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to generate image. Please try again later.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
