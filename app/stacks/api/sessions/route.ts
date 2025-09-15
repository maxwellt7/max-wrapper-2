import { NextResponse } from "next/server";
import { createClient } from "@/lib/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    // Get all sessions for current user (or anonymous sessions if no user)
    const query = supabase
      .from('stack_sessions')
      .select(`
        *,
        stacks (*)
      `)
      .order('created_at', { ascending: false });

    // If user is authenticated, get their sessions, otherwise get sessions without user_id
    const { data: sessions, error } = user 
      ? await query.eq('user_id', user.id)
      : await query.is('user_id', null);

    if (error) {
      console.error("Error fetching sessions:", error);
      return NextResponse.json(
        { error: "Failed to fetch sessions" },
        { status: 500 }
      );
    }

    // Format response to match expected structure
    const formattedSessions = sessions?.map(session => ({
      ...session,
      stack: {
        slug: session.stacks.slug,
        title: session.stacks.title,
        questions: session.stacks.questions
      }
    })) || [];

    return NextResponse.json(formattedSessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}