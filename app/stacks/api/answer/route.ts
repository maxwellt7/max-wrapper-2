import { NextRequest, NextResponse } from "next/server";
import { sessions } from "@/lib/session-storage";

export async function POST(request: NextRequest) {
  try {
    const { sessionId, questionIndex, answer } = await request.json();

    if (!sessionId || questionIndex === undefined || !answer) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get session from memory storage
    const session = sessions.get(sessionId);
    
    if (!session) {
      console.error("Session not found:", sessionId);
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Get current question from stack
    const questions = session.stack.questions;
    const question = questions[questionIndex];
    
    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Initialize answers array if it doesn't exist
    if (!session.answers) {
      session.answers = [];
    }

    // Save answer to session
    const answerData = {
      session_id: sessionId,
      question_index: questionIndex,
      question_key: question.key,
      question_text: question.text,
      answer_text: answer,
      created_at: new Date().toISOString()
    };

    // Remove any existing answer for this question and add the new one
    session.answers = session.answers.filter((a: any) => a.question_index !== questionIndex);
    session.answers.push(answerData);

    // Update session progress
    const nextIndex = questionIndex + 1;
    const isCompleted = nextIndex >= questions.length;
    
    session.current_index = nextIndex;
    session.status = isCompleted ? 'completed' : 'in_progress';
    session.updated_at = new Date().toISOString();

    // Update the session in memory
    sessions.set(sessionId, session);

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