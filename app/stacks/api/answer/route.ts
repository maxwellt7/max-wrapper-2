import { NextRequest, NextResponse } from "next/server";
import { getSessionWithStack, upsertAnswer, updateSessionProgress } from "@/lib/db-connection";

export async function POST(request: NextRequest) {
  try {
    const { sessionId, questionIndex, answer } = await request.json();

    if (!sessionId || questionIndex === undefined || !answer) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get session from database with stack information
    console.log(`🔍 [ANSWER] Looking for session: ${sessionId}`);
    
    const { data: session, error: sessionError } = await getSessionWithStack(sessionId);
    
    if (sessionError || !session) {
      console.error(`❌ [ANSWER] Session not found: ${sessionId}`, sessionError);
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }
    
    console.log(`✅ [ANSWER] Session found: ${sessionId}`);

    // Get current question from stack
    const questions = session.stacks.questions;
    const question = questions[questionIndex];
    
    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Save answer using upsert function
    const { data: answerData, error: answerError } = await upsertAnswer(
      sessionId,
      questionIndex,
      question.key,
      question.text,
      answer
    );
    
    if (answerError) {
      console.error(`❌ [ANSWER] Failed to save answer:`, answerError);
      return NextResponse.json(
        { error: "Failed to save answer" },
        { status: 500 }
      );
    }

    // Update session progress
    const nextIndex = questionIndex + 1;
    const isCompleted = nextIndex >= questions.length;
    
    const { error: updateError } = await updateSessionProgress(
      sessionId,
      nextIndex,
      isCompleted ? 'completed' : 'in_progress'
    );
    
    if (updateError) {
      console.error(`⚠️ [ANSWER] Failed to update session progress:`, updateError);
      // Don't fail the request as answer was saved successfully
    }

    console.log(`✅ [ANSWER] Answer saved for session: ${sessionId}, Question: ${questionIndex}, Current progress: ${nextIndex}/${questions.length}`);

    return NextResponse.json({
      success: true,
      current_index: nextIndex,
      completed: isCompleted
    });
  } catch (error) {
    console.error("Error saving answer:", error);
    return NextResponse.json(
      { error: "Failed to save answer" },
      { status: 500 }
    );
  }
}