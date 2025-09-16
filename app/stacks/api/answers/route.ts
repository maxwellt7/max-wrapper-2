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
    console.log(`🔍 [ANSWERS] Looking for session: ${sessionId}, Total sessions: ${sessions.size}`);
    console.log(`📋 [ANSWERS] Available sessions:`, Array.from(sessions.keys()));
    const session = sessions.get(sessionId);
    
    if (!session) {
      console.error(`❌ [ANSWERS] Session not found: ${sessionId}`);
      console.error(`💾 [ANSWERS] Storage state - Total sessions: ${sessions.size}`);
      console.error(`🗂️  [ANSWERS] Available sessions:`, Array.from(sessions.keys()));
      // Return empty array for non-existent sessions to avoid errors
      return NextResponse.json([]);
    }
    
    console.log(`✅ [ANSWERS] Session found: ${sessionId}, Answers count: ${session.answers?.length || 0}`);

    // Return answers from session, sorted by question index
    const answers = (session.answers || []).sort((a: any, b: any) => a.question_index - b.question_index);
    console.log(`📊 [ANSWERS] Returning ${answers.length} answers for session: ${sessionId}`);
    
    return NextResponse.json(answers);
  } catch (error) {
    console.error("Error fetching answers:", error);
    return NextResponse.json(
      { error: "Failed to fetch answers" },
      { status: 500 }
    );
  }
}