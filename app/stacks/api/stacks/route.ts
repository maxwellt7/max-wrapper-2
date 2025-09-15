import { NextResponse } from "next/server";
import { createClient } from "@/lib/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: stacks, error } = await supabase
      .from('stacks')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Database error fetching stacks:", error);
      return NextResponse.json(
        { error: "Failed to fetch stacks" },
        { status: 500 }
      );
    }

    return NextResponse.json(stacks || []);
  } catch (error) {
    console.error("Error fetching stacks:", error);
    return NextResponse.json(
      { error: "Failed to fetch stacks" },
      { status: 500 }
    );
  }
}