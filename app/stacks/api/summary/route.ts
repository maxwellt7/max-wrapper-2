import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get all answers for the session from database
    const { data: answers, error: answersError } = await supabase
      .from('stack_answers')
      .select('*')
      .eq('session_id', sessionId)
      .order('question_index', { ascending: true });
    
    if (answersError) {
      console.error("Error fetching answers:", answersError);
      return NextResponse.json(
        { error: "Failed to fetch answers" },
        { status: 500 }
      );
    }

    if (!answers || answers.length === 0) {
      return NextResponse.json(
        { error: "No answers found for session" },
        { status: 404 }
      );
    }

    // Create a structured summary (simplified for demo)
    const summaryText = generateSummary(answers);
    
    const summaryData = {
      session_id: sessionId,
      summary_text: summaryText,
      summary_json: {
        answers: answers.map(a => ({
          question: a.question_text,
          answer: a.answer_text,
          key: a.question_key
        }))
      }
    };

    // Save summary to database (upsert to handle cases where summary already exists)
    const { data: summary, error: summaryError } = await supabase
      .from('stack_summaries')
      .upsert(summaryData, { onConflict: 'session_id' })
      .select()
      .single();

    if (summaryError) {
      console.error("Error saving summary:", summaryError);
      return NextResponse.json(
        { error: "Failed to save summary" },
        { status: 500 }
      );
    }

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Error generating summary:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}

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

    const supabase = await createClient();

    // Get summary from database
    const { data: summary, error } = await supabase
      .from('stack_summaries')
      .select('*')
      .eq('session_id', sessionId)
      .single();
    
    if (error || !summary) {
      console.error("Summary not found:", error);
      return NextResponse.json(
        { error: "Summary not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Error fetching summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch summary" },
      { status: 500 }
    );
  }
}

function generateSummary(answers: any[]): string {
  // Simple summary generation - in a real app, this would use AI
  const answerMap = answers.reduce((acc, answer) => {
    acc[answer.question_key] = answer.answer_text;
    return acc;
  }, {});

  return `# Gratitude Stack Summary

**Session Title:** ${answerMap.title || 'Untitled'}

**Subject of Gratitude:** ${answerMap.subject || 'Not specified'}

**Domain:** ${answerMap.domain || 'Not specified'}

## Key Insights

**Gratitude Trigger:** ${answerMap.trigger || 'Not provided'}

**Your Story:** ${answerMap.story || 'Not provided'}

**Feelings:** ${answerMap.feelings || 'Not provided'}

**Facts vs. Story:** ${answerMap.facts || 'Not provided'}

## Future Focus

**What you want for yourself:** ${answerMap.want_for_self || 'Not provided'}

**What you want for ${answerMap.subject || 'them'}:** ${answerMap.want_for_other || 'Not provided'}

**What you want for both:** ${answerMap.want_for_both || 'Not provided'}

## Revelations

**Life Lesson:** ${answerMap.life_lesson || 'Not provided'}

**Key Revelation:** ${answerMap.revelation || 'Not provided'}

**Committed Actions:** ${answerMap.actions || 'Not provided'}

---

This gratitude practice has helped you reflect deeply on ${answerMap.subject || 'your subject'} and transform your perspective into one of appreciation and forward momentum.`;
}