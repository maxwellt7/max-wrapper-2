import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { manifestoData } = await request.json();
    const supabase = await createClient();

    // For now, use a simple session-based approach
    // In a real app, you'd use proper user authentication
    const sessionId = request.headers.get('session-id') || 'anonymous';

    const { data, error } = await supabase
      .from('user_manifestos')
      .upsert({
        user_id: sessionId,
        manifesto_data: manifestoData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving manifesto:', error);
      return NextResponse.json({ error: 'Failed to save manifesto' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in manifesto POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.headers.get('session-id') || 'anonymous';
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('user_manifestos')
      .select('manifesto_data')
      .eq('user_id', sessionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No manifesto found
        return NextResponse.json({ manifesto: null });
      }
      console.error('Error fetching manifesto:', error);
      return NextResponse.json({ error: 'Failed to fetch manifesto' }, { status: 500 });
    }

    return NextResponse.json({ manifesto: data?.manifesto_data || null });
  } catch (error) {
    console.error('Error in manifesto GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}