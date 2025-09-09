import { NextResponse } from "next/server";
import { getUserCredits } from "@/lib/db/mutations";

interface CreditValidationResult {
  isValid: boolean;
  response?: NextResponse;
}

interface ToolConfig {
  paywall?: boolean;
  credits: number;
}

/**
 * Validates if a user has sufficient credits to use a service
 * @param userEmail - The email of the user
 * @param toolConfig - The tool configuration containing paywall and credit requirements
 * @param serviceName - Optional name of the service for better error messages
 * @returns Object with isValid boolean and optional error response
 */
export async function validateUserCredits(
  userEmail: string | undefined,
  toolConfig: ToolConfig,
  serviceName: string = "this service"
): Promise<CreditValidationResult> {
  // If paywall is not enabled, allow access
  if (!toolConfig.paywall || !userEmail) {
    return { isValid: true };
  }

  try {
    const userCredits = await getUserCredits(userEmail);
    
    if (userCredits === null || userCredits === undefined) {
      return {
        isValid: false,
        response: NextResponse.json(
          { error: "Unable to verify user credits" },
          { status: 400 }
        )
      };
    }

    if (userCredits < toolConfig.credits) {
      return {
        isValid: false,
        response: NextResponse.json(
          { 
            error: "Insufficient credits", 
            message: `You have ${userCredits} credits but need ${toolConfig.credits} credits to use ${serviceName}.`,
            creditsRequired: toolConfig.credits,
            creditsAvailable: userCredits
          },
          { status: 402 } // Payment Required
        )
      };
    }

    return { isValid: true };
  } catch (error) {
    console.error("Error validating user credits:", error);
    return {
      isValid: false,
      response: NextResponse.json(
        { error: "Error validating credits. Please try again." },
        { status: 500 }
      )
    };
  }
}