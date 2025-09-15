import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { stackSlug, title } = await request.json();

    if (!stackSlug || !title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Find the stack by slug
    const { data: stack, error: stackError } = await supabase
      .from('stacks')
      .select('*')
      .eq('slug', stackSlug)
      .single();

    if (stackError || !stack) {
      console.error("Stack not found:", stackError);
      return NextResponse.json(
        { error: "Stack not found" },
        { status: 404 }
      );
    }

    // Get current user (if authenticated)
    const { data: { user } } = await supabase.auth.getUser();

    // Create new session
    const { data: session, error: sessionError } = await supabase
      .from('stack_sessions')
      .insert({
        stack_id: stack.id,
        user_id: user?.id || null, // Support anonymous sessions
        title,
        status: 'in_progress',
        current_index: 0
      })
      .select('*, stacks(*)')
      .single();

    if (sessionError) {
      console.error("Error creating session:", sessionError);
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: 500 }
      );
    }

    // Format response to include stack information
    const response = {
      ...session,
      stack: {
        slug: stack.slug,
        title: stack.title,
        questions: stack.questions
      }
    };

    return NextResponse.json(response);
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
    
    const supabase = await createClient();

    if (sessionId) {
      // Get specific session with stack data
      const { data: session, error } = await supabase
        .from('stack_sessions')
        .select(`
          *,
          stacks (*)
        `)
        .eq('id', sessionId)
        .single();

      if (error || !session) {
        console.error("Session not found:", error);
        return NextResponse.json(
          { error: "Session not found" },
          { status: 404 }
        );
      }

      // Format response to match expected structure
      const response = {
        ...session,
        stack: {
          slug: session.stacks.slug,
          title: session.stacks.title,
          questions: session.stacks.questions
        }
      };

      return NextResponse.json(response);
    }

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

    // Format response
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
    console.error("Error fetching session:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}