import { NextRequest, NextResponse } from "next/server";
import { getAnswersForSession } from "@/lib/db-connection";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID required" },
        { status: 400 }
      );
    }

    // Get answers from database
    console.log(`🔍 [ANSWERS] Looking for answers for session: ${sessionId}`);
    
    const { data: answers, error: answersError } = await getAnswersForSession(sessionId);
    
    if (answersError) {
      // Check if it's an invalid UUID format error
      if (answersError.type === "INVALID_UUID") {
        console.error(`❌ [ANSWERS] Invalid session ID format: ${sessionId}`);
        return NextResponse.json(
          { error: "Invalid session ID format" },
          { status: 400 }
        );
      }
      
      console.error(`❌ [ANSWERS] Error fetching answers for session ${sessionId}:`, answersError);
      return NextResponse.json(
        { error: "Failed to fetch answers" },
        { status: 500 }
      );
    }
    
    const answersArray = answers || [];
    console.log(`✅ [ANSWERS] Answers fetched for session: ${sessionId}, Count: ${answersArray.length}`);
    console.log(`📊 [ANSWERS] Returning ${answersArray.length} answers for session: ${sessionId}`);
    
    return NextResponse.json(answersArray);
  } catch (error) {
    console.error("Error fetching answers:", error);
    return NextResponse.json(
      { error: "Failed to fetch answers" },
      { status: 500 }
    );
  }
}