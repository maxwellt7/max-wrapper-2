import { NextRequest, NextResponse } from "next/server";
import { getStackBySlug, createSession, getSessionWithStack, getAllSessions, getAnswersForSession } from "@/lib/db-connection";

export async function POST(request: NextRequest) {
  try {
    const { stackSlug, title } = await request.json();

    if (!stackSlug || !title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find the stack by slug in the database
    const { data: stack, error: stackError } = await getStackBySlug(stackSlug);
    
    if (stackError || !stack) {
      console.error("Stack not found for slug:", stackSlug, stackError);
      return NextResponse.json(
        { error: "Stack not found" },
        { status: 404 }
      );
    }

    // Create new session in the database
    const { data: session, error: sessionError } = await createSession(stack.id, title, null);

    if (sessionError || !session) {
      console.error("Failed to create session:", sessionError);
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: 500 }
      );
    }

    // Build response with stack data included
    const sessionResponse = {
      id: session.id,
      stack_id: session.stack_id,
      user_id: session.user_id,
      title: session.title,
      status: session.status,
      current_index: session.current_index,
      created_at: session.created_at,
      updated_at: session.updated_at,
      answers: [], // Will be populated by the answers API
      stack: {
        slug: stack.slug,
        title: stack.title,
        questions: stack.questions
      }
    };

    console.log(`✅ Session created: ${session.id}, Stack: ${stackSlug}`);
    console.log(`📝 Session details:`, { id: session.id, title, stackSlug, questionsCount: stack.questions.length });

    return NextResponse.json(sessionResponse);
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
      // Get specific session from database
      console.log(`🔍 Looking for session: ${sessionId}`);
      
      const { data: sessionRow, error: sessionError } = await getSessionWithStack(sessionId);
      
      if (sessionError || !sessionRow) {
        // Check if it's an invalid UUID format error
        if (sessionError && sessionError.type === "INVALID_UUID") {
          console.error(`❌ Invalid session ID format: ${sessionId}`);
          return NextResponse.json(
            { error: "Invalid session ID format" },
            { status: 400 }
          );
        }
        
        console.error(`❌ Session not found: ${sessionId}`, sessionError);
        return NextResponse.json(
          { error: "Session not found" },
          { status: 404 }
        );
      }
      
      // Get answers for this session
      const { data: answersData, error: answersError } = await getAnswersForSession(sessionId);
      
      if (answersError) {
        // UUID validation was already handled above, so this is likely a different error
        console.error(`⚠️ Error fetching answers for session ${sessionId}:`, answersError);
      }
      
      // Build session response
      const session = {
        id: sessionRow.id,
        stack_id: sessionRow.stack_id,
        user_id: sessionRow.user_id,
        title: sessionRow.title,
        status: sessionRow.status,
        current_index: sessionRow.current_index,
        created_at: sessionRow.created_at,
        updated_at: sessionRow.updated_at,
        answers: answersData || [],
        stack: {
          slug: sessionRow.stacks.slug,
          title: sessionRow.stacks.title,
          questions: sessionRow.stacks.questions
        }
      };
      
      console.log(`✅ Session found: ${sessionId}`);
      return NextResponse.json(session);
    }

    // Get all sessions from database
    console.log(`📊 Fetching all sessions`);
    
    const { data: allSessionsData, error: allSessionsError } = await getAllSessions();
    
    if (allSessionsError) {
      console.error("Error fetching all sessions:", allSessionsError);
      return NextResponse.json(
        { error: "Failed to fetch sessions" },
        { status: 500 }
      );
    }
    
    // Build sessions array with answers
    const sessions = [];
    for (const sessionRow of allSessionsData || []) {
      // Get answers for each session
      const { data: answersData } = await getAnswersForSession(sessionRow.id);
      
      sessions.push({
        id: sessionRow.id,
        stack_id: sessionRow.stack_id,
        user_id: sessionRow.user_id,
        title: sessionRow.title,
        status: sessionRow.status,
        current_index: sessionRow.current_index,
        created_at: sessionRow.created_at,
        updated_at: sessionRow.updated_at,
        answers: answersData || [],
        stack: {
          slug: sessionRow.stacks.slug,
          title: sessionRow.stacks.title,
          questions: sessionRow.stacks.questions
        }
      });
    }
    
    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}