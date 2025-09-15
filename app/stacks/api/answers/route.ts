import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/utils/supabase/server";

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

    // Get answers for session from database
    const { data: answers, error } = await supabase
      .from('stack_answers')
      .select('*')
      .eq('session_id', sessionId)
      .order('question_index', { ascending: true });

    if (error) {
      console.error("Error fetching answers:", error);
      return NextResponse.json(
        { error: "Failed to fetch answers" },
        { status: 500 }
      );
    }

    return NextResponse.json(answers || []);
  } catch (error) {
    console.error("Error fetching answers:", error);
    return NextResponse.json(
      { error: "Failed to fetch answers" },
      { status: 500 }
    );
  }
}