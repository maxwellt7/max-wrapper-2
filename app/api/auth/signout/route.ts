import { createClient } from "@/lib/utils/supabase/server";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

/**
 * Handles user sign out requests
 * 
 * @returns Redirect response to auth page
 * 
 * Flow:
 * 1. Gets current session before signing out
 * 2. Signs out from Supabase
 * 3. Invalidates three types of cached data:
 *    - Session data (from getSession)
 *    - User profile data (from getUser)
 *    - User credits data (from getUserCredits)
 * 4. Redirects to auth page
 */
export async function POST() {
  const supabase = await createClient();
  
  // Get current session before signing out
  // This is necessary to access session data for cache invalidation
  const { data: { session } } = await supabase.auth.getSession();
  
  // Sign out from Supabase auth
  await supabase.auth.signOut();
  
  // If there was an active session, invalidate all related caches
  if (session) {
    // Invalidate session cache (used by getSession)
    const cacheKey = `session_${session.user.id}_${session.access_token.slice(-10)}`;
    revalidateTag(cacheKey);
    
    // Invalidate user-specific caches if user data exists
    if (session.user) {
      // Invalidate user profile cache (used by getUser)
      revalidateTag(`user_${session.user.email}`);
      // Invalidate user credits cache (used by getUserCredits)
      revalidateTag(`user_${session.user.id}_credits`);
    }
  }
  
  // Use absolute URL for redirect to ensure correct routing
  const url = new URL("/auth", process.env.PRODUCTION_URL || "http://localhost:3000");
  return NextResponse.redirect(url.toString());
}