import { NextResponse } from "next/server";
import { getAllSessions } from "@/lib/db-connection";

export async function GET() {
  try {
    console.log("📊 Fetching all sessions");

    const { data: sessions, error } = await getAllSessions();
    
    if (error || !sessions) {
      console.error("❌ Database error fetching sessions:", error);
      return NextResponse.json(
        { error: "Failed to fetch sessions" },
        { status: 500 }
      );
    }

    // Format sessions to match expected frontend structure  
    const formattedSessions = sessions.map((session: any) => ({
      id: session.id,
      title: session.title,
      status: session.status,
      current_index: session.current_index,
      created_at: session.created_at,
      updated_at: session.updated_at,
      stack: {
        slug: session.stacks.slug,
        title: session.stacks.title,
        questions: session.stacks.questions
      }
    }));

    console.log(`✅ Found ${formattedSessions.length} sessions`);
    return NextResponse.json(formattedSessions);

  } catch (error) {
    console.error("❌ Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}