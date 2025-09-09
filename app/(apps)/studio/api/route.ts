/**
 * OpenAI Image Generation API Route
 *
 * Purpose:
 * This API route generates images using OpenAI's API based on a text prompt.
 * It supports three operation modes: generation, editing, and inpainting.
 *
 * How it works:
 * 1. Receives a request with a text prompt and optionally multiple images/mask
 * 2. Authenticates the user making the request
 * 3. Determines the operation mode based on provided inputs
 * 4. For edit/inpaint modes, creates temporary files from uploaded images
 * 5. Calls the OpenAI API with appropriate parameters based on operation mode
 * 6. Uploads the generated image to Cloudflare R2
 * 7. Stores the file record in Supabase
 * 8. Returns both the preview data and the public URL
 *
 * Operation modes:
 * - generate: Creates an image from text prompt only
 * - edit: Modifies up to 4 input images based on the prompt
 * - inpaint: Edits portions of an image defined by a mask
 *
 * Input parameters:
 * - prompt: Text description for the image to generate
 * - images: (Optional) Image files to use as input for editing/inpainting
 * - mask: (Optional) Mask image for inpainting
 *
 * Response:
 * - Success: Returns the generated image as both a data URL (preview) and a public URL
 * - Error: Returns appropriate error message and status code
 */

import { NextResponse, NextRequest } from "next/server";
import OpenAI, { toFile } from "openai";
import { openai } from "@/lib/clients/openai";
import fs from "fs";
import { authMiddleware } from "@/lib/middleware/authMiddleware";
import { uploadFile } from "@/lib/hooks/useFileUpload";
import { uploadToSupabase, reduceUserCredits, getUserCredits } from "@/lib/db/mutations";
import { toolConfig } from "@/app/(apps)/dalle/toolConfig";

// Define operation modes
type OperationMode = "generate" | "edit" | "inpaint";

export async function POST(request: NextRequest) {
  try {
    // Authenticate the user and get user data
    const authResponse = await authMiddleware(request);
    if (authResponse.status === 401) return authResponse;

    // Get user from the middleware-enhanced request
    const user = (request as any).user;

    // Parse request data
    let prompt: string = "";
    let inputImages: File[] = [];
    let maskImage: File | null = null;
    let operationMode: OperationMode = "generate"; // Default to generate

    if (request.headers.get("content-type")?.includes("multipart/form-data")) {
      const formData = await request.formData();
      prompt = formData.get("prompt") as string;

      const formImages = formData.getAll("images") as File[];
      // Use duck typing to check for File-like objects
      inputImages = formImages.filter(
        (item): item is File =>
          typeof item === "object" &&
          item !== null &&
          typeof item.name === "string" &&
          typeof item.arrayBuffer === "function"
      );

      const formMask = formData.get("mask");
      // Use duck typing to check for File-like objects
      if (
        typeof formMask === "object" &&
        formMask !== null &&
        typeof (formMask as File).name === "string" && // Type assertion needed here
        typeof (formMask as File).arrayBuffer === "function" // Type assertion needed here
      ) {
        maskImage = formMask as File; // Type assertion needed here
      }

      // Determine operation mode based on inputs
      if (inputImages.length > 0 && maskImage) {
        if (inputImages.length !== 1) {
          return NextResponse.json(
            {
              success: false,
              error:
                "Inpainting requires exactly one input image and one mask image.",
            },
            { status: 400 }
          );
        }
        operationMode = "inpaint";
        console.log("🟩 OpenAI Image API Start - Inpainting:", {
          prompt,
          imageName: inputImages[0].name,
          maskName: maskImage.name,
        });
      } else if (inputImages.length > 0) {
        if (inputImages.length > 4) {
          return NextResponse.json(
            {
              success: false,
              error: "Multi-image editing supports up to 4 input images.",
            },
            { status: 400 }
          );
        }
        operationMode = "edit";
        console.log("🟩 OpenAI Image API Start - Multi-Image Edit:", {
          prompt,
          imageCount: inputImages.length,
        });
      } else {
        operationMode = "generate";
        console.log("🟩 OpenAI Image API Start - Generate:", { prompt });
      }
    } else {
      // Handle JSON (text prompt only for generation)
      const body = await request.json();
      prompt = body.prompt;
      operationMode = "generate";
      console.log("🟩 OpenAI Image API Start - Generate (JSON):", { prompt });
    }

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "Prompt is required." },
        { status: 400 }
      );
    }

    // Check if paywall is enabled and validate user credits BEFORE processing
    if (toolConfig.paywall === true) {
      const userCredits = await getUserCredits(user.email);
      
      if (userCredits === null || userCredits === undefined) {
        return NextResponse.json(
          { success: false, error: "Unable to verify user credits" },
          { status: 400 }
        );
      }

      if (userCredits < toolConfig.credits) {
        return NextResponse.json(
          { 
            success: false,
            error: "Insufficient credits", 
            message: `You have ${userCredits} credits but need ${toolConfig.credits} credits to generate an image.`,
            creditsRequired: toolConfig.credits,
            creditsAvailable: userCredits
          },
          { status: 402 } // Payment Required
        );
      }
    }

    // --- OpenAI Image Generation/Editing Logic ---
    let resultB64Json: string | undefined;
    const tempFiles: string[] = []; // Keep track of temporary files

    try {
      if (operationMode === "generate") {
        console.log("🟨 Calling OpenAI images.generate...");
        const response = await openai.images.generate({
          model: "gpt-image-1",
          prompt: prompt,
          n: 1, // Generate one image
          size: "1024x1024", // Default size, adjust as needed
        });
        // Safely access the result
        if (response.data && response.data.length > 0) {
          resultB64Json = response.data[0].b64_json;
        }
        console.log("🟨 OpenAI images.generate response received.");
      } else if (operationMode === "edit") {
        console.log(
          "🟨 Preparing images for OpenAI images.edit (multi-image)..."
        );
        // Prepare images using temporary files and toFile
        const preparedImages = await Promise.all(
          inputImages.map(async (file) => {
            const tempFilePath = await createTempFile(file, tempFiles);
            // Ensure correct mimetype is passed to toFile
            return toFile(fs.createReadStream(tempFilePath), file.name, {
              type: file.type || "image/png", // Use original type or default
            });
          })
        );

        console.log("🟨 Calling OpenAI images.edit (multi-image)...");
        // The SDK should handle the array type based on documentation examples
        const response = await openai.images.edit({
          model: "gpt-image-1",
          // @ts-ignore - Suppress type error as SDK types might lag behind API capability
          image: preparedImages, // Pass the array of prepared files
          prompt: prompt,
          n: 1,
          size: "1024x1024",
        });
        // Safely access the result
        if (response.data && response.data.length > 0) {
          resultB64Json = response.data[0].b64_json;
        }
        console.log("🟨 OpenAI images.edit (multi-image) response received.");
      } else if (operationMode === "inpaint") {
        console.log(
          "🟨 Preparing image and mask for OpenAI images.edit (inpainting)..."
        );
        const imageFile = inputImages[0];
        const maskFile = maskImage as File; // Already validated it exists

        // Prepare image and mask using temporary files and toFile
        const tempImagePath = await createTempFile(imageFile, tempFiles);
        const preparedImage = await toFile(
          fs.createReadStream(tempImagePath),
          imageFile.name,
          // Ensure correct mimetype is passed to toFile
          { type: imageFile.type || "image/png" }
        );

        const tempMaskPath = await createTempFile(maskFile, tempFiles);
        const preparedMask = await toFile(
          fs.createReadStream(tempMaskPath),
          maskFile.name,
          // Ensure correct mimetype is passed to toFile
          { type: maskFile.type || "image/png" }
        );

        console.log("🟨 Calling OpenAI images.edit (inpainting)...");
        const response = await openai.images.edit({
          model: "gpt-image-1",
          image: preparedImage,
          mask: preparedMask,
          prompt: prompt,
          n: 1,
          size: "1024x1024",
        });
        // Safely access the result
        if (response.data && response.data.length > 0) {
          resultB64Json = response.data[0].b64_json;
        }
        console.log("🟨 OpenAI images.edit (inpainting) response received.");
      }
    } catch (apiError: any) {
      console.error("🟥 OpenAI API Error:", apiError);
      return NextResponse.json(
        {
          success: false,
          error: `OpenAI API request failed: ${
            apiError.message || "Unknown error"
          }`,
        },
        { status: 500 }
      );
    } finally {
      // Clean up temporary files
      cleanupTempFiles(tempFiles);
    }
    // --- End OpenAI Logic ---

    if (!resultB64Json) {
      return NextResponse.json(
        { success: false, error: "No image data received from OpenAI" },
        { status: 500 }
      );
    }

    // Construct the data URL for preview
    const imageDataUrl = `data:image/png;base64,${resultB64Json}`; // OpenAI returns PNG

    // Upload the generated image to Cloudflare R2
    const fileName = `openai-image-${Date.now()}.png`; // Use png extension
    const uploadResult = await uploadFile({
      imageUrl: imageDataUrl,
      uploadPath: "studio", // Keep using 'studio' path or change if needed
      fileName,
      skipMetadata: true, // Keep skipping R2 metadata if desired
    });

    console.log("🟦 Image uploaded to R2:", uploadResult);

    if (!uploadResult) {
      return NextResponse.json(
        { success: false, error: "Failed to upload image to storage" },
        { status: 500 }
      );
    }

    // Create request body for uploadToSupabase
    const requestBody = {
      prompt,
      email: user.email,
      operationMode,
      inputImageCount: inputImages.length,
      maskProvided: !!maskImage,
      model: "gpt-image-1",
    };

    // Store the response in Supabase using uploadToSupabase
    const supabaseResponse = await uploadToSupabase(
      requestBody,
      uploadResult.url,
      "studio", // toolPath
      "gpt-image-1" // aiModel
    );

    console.log("🟩 File record created:", supabaseResponse[0].id);

    // Reduce user credits (uncomment and adjust if paywall is enabled)
    if (toolConfig.paywall === true) {
      await reduceUserCredits(user.email, toolConfig.credits);
    }

    return NextResponse.json({
      success: true,
      output: {
        preview: imageDataUrl, // For immediate display in the UI
        publicUrl: uploadResult.url, // For permanent storage reference
      },
      fileId: supabaseResponse[0].id,
    });
  } catch (error: any) {
    console.error("🟥 OpenAI Image Route Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: `Failed to process request: ${
          error.message || "Internal server error"
        }`,
      },
      { status: 500 }
    );
  }
}

// --- Helper Functions ---

/**
 * Creates a temporary file from a File object's buffer.
 * @param file The File object.
 * @param tempFiles Array to track created temp file paths.
 * @returns The path to the temporary file.
 */
async function createTempFile(
  file: File,
  tempFiles: string[]
): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  // Use /tmp directory for serverless environments
  const tempFilePath = `/tmp/openai-upload-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 15)}.${file.name.split(".").pop() || "tmp"}`;
  // Explicitly use Uint8Array to satisfy stricter type checking
  fs.writeFileSync(tempFilePath, new Uint8Array(buffer));
  tempFiles.push(tempFilePath); // Track the file for cleanup
  console.log(`💾 Created temp file: ${tempFilePath} for ${file.name}`);
  return tempFilePath;
}

/**
 * Deletes all temporary files tracked in the array.
 * @param tempFiles Array of temporary file paths.
 */
function cleanupTempFiles(tempFiles: string[]): void {
  console.log(`🧹 Cleaning up ${tempFiles.length} temporary files...`);
  for (const tempFile of tempFiles) {
    try {
      if (fs.existsSync(tempFile)) {
        // Check if file exists before unlinking
        fs.unlinkSync(tempFile);
        console.log(`🗑️ Deleted temp file: ${tempFile}`);
      }
    } catch (e) {
      console.error(`🟥 Error deleting temp file ${tempFile}:`, e);
    }
  }
  // Clear the array after attempting cleanup
  tempFiles.length = 0;
}
