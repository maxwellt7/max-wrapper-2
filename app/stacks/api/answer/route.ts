import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { sessionId, questionIndex, answer } = await request.json();

    if (!sessionId || questionIndex === undefined || !answer) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get session with stack data to validate and get question info
    const { data: session, error: sessionError } = await supabase
      .from('stack_sessions')
      .select(`
        *,
        stacks (*)
      `)
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      console.error("Session not found:", sessionError);
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Get current question from stack
    const questions = session.stacks.questions;
    const question = questions[questionIndex];
    
    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Save answer to database
    const { error: answerError } = await supabase
      .from('stack_answers')
      .insert({
        session_id: sessionId,
        question_index: questionIndex,
        question_key: question.key,
        question_text: question.text,
        answer_text: answer
      });

    if (answerError) {
      console.error("Error saving answer:", answerError);
      return NextResponse.json(
        { error: "Failed to save answer" },
        { status: 500 }
      );
    }

    // Update session progress
    const nextIndex = questionIndex + 1;
    const isCompleted = nextIndex >= questions.length;
    
    const { error: updateError } = await supabase
      .from('stack_sessions')
      .update({
        current_index: nextIndex,
        status: isCompleted ? 'completed' : 'in_progress'
      })
      .eq('id', sessionId);

    if (updateError) {
      console.error("Error updating session:", updateError);
      return NextResponse.json(
        { error: "Failed to update session" },
        { status: 500 }
      );
    }

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