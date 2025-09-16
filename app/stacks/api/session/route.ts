import { NextRequest, NextResponse } from "next/server";
import { sessions, getStackData } from "@/lib/session-storage";

export async function POST(request: NextRequest) {
  try {
    const { stackSlug, title } = await request.json();

    if (!stackSlug || !title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find the stack by slug
    const stack = getStackData(stackSlug);
    if (!stack) {
      console.error("Stack not found for slug:", stackSlug);
      return NextResponse.json(
        { error: "Stack not found" },
        { status: 404 }
      );
    }

    // Create new session with unique ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session = {
      id: sessionId,
      stack_id: stack.id,
      user_id: null, // Support anonymous sessions
      title,
      status: 'in_progress',
      current_index: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      answers: [],
      stack: {
        slug: stack.slug,
        title: stack.title,
        questions: stack.questions
      }
    };

    // Store session in memory
    sessions.set(sessionId, session);

    return NextResponse.json(session);
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (sessionId) {
      // Get specific session from memory
      const session = sessions.get(sessionId);
      
      if (!session) {
        console.error("Session not found:", sessionId);
        return NextResponse.json(
          { error: "Session not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(session);
    }

    // Get all sessions (for demo purposes, return all stored sessions)
    const allSessions = Array.from(sessions.values());
    
    return NextResponse.json(allSessions);
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}