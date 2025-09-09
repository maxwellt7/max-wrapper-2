import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/utils/supabase/server";
import { redirectToModal } from "@/config";
import { revalidateTag } from "next/cache";

/**
 * Handles Google OAuth authentication requests
 * 
 * @param request NextRequest containing redirect URL
 * @returns JSON response with OAuth URL or error
 * 
 * Flow:
 * 1. Gets current session (if any) to invalidate its cache
 * 2. Initiates Google OAuth process
 * 3. Invalidates relevant cache entries
 * 4. Returns OAuth URL for client redirect
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { next } = await request.json();

  try {
    // Get current session to handle cache invalidation for user switching
    const { data: { session: oldSession } } = await supabase.auth.getSession();
    
    // Initiate OAuth sign in process
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectToModal(next),
      },
    });

    if (error) throw error;

    if (data.url) {
      // Invalidate generic session tag for backwards compatibility
      revalidateTag("session");
      
      // If there was a previous session, invalidate its specific cache
      // This prevents stale data when switching between accounts
      if (oldSession?.user?.id) {
        const cacheKey = `session_${oldSession.user.id}_${oldSession.access_token.slice(-10)}`;
        revalidateTag(cacheKey);
      }

      return NextResponse.json({
        status: "Success",
        url: data.url,
      });
    } else {
      throw new Error("No URL returned from Supabase");
    }
  } catch (error) {
    // Handle known errors with specific messages
    if (error instanceof Error) {
      return NextResponse.json(
        { status: "Error", message: error.message },
        { status: 500 }
      );
    } else {
      // Handle unknown errors with generic message
      return NextResponse.json(
        { status: "Error", message: "An unknown error occurred" },
        { status: 500 }
      );
    }
  }
}