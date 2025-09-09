import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // Check if Supabase is properly configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('dummy') || supabaseAnonKey.includes('dummy') || !supabaseUrl.startsWith('http')) {
    // Return a mock client for browser environment
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        signInWithPassword: async () => ({ data: { user: null, session: null }, error: new Error('Supabase not configured') }),
        signInWithOAuth: async () => ({ data: { url: null }, error: new Error('Supabase not configured - please add your Supabase credentials to enable authentication') }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({ data: [], error: null }),
        insert: () => ({ data: null, error: { message: 'Supabase not configured' } }),
        update: () => ({ data: null, error: { message: 'Supabase not configured' } }),
        delete: () => ({ data: null, error: { message: 'Supabase not configured' } }),
      }),
    } as any;
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  );
}
