import { NextRequest, NextResponse } from "next/server";
import { sessions } from "@/lib/session-storage";

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

    // Get session from memory storage
    const session = sessions.get(sessionId);
    
    if (!session) {
      console.error("Session not found:", sessionId);
      // Return empty array for non-existent sessions to avoid errors
      return NextResponse.json([]);
    }

    // Return answers from session, sorted by question index
    const answers = (session.answers || []).sort((a: any, b: any) => a.question_index - b.question_index);
    
    return NextResponse.json(answers);
  } catch (error) {
    console.error("Error fetching answers:", error);
    return NextResponse.json(
      { error: "Failed to fetch answers" },
      { status: 500 }
    );
  }
}