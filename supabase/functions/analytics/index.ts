import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyticsEvent {
  event_type: 'page_view' | 'tab_view' | 'content_click' | 'language_change' | 'ai_search' | 'ai_general_answer' | 'ai_page_redirect' | 'ai_search_failure';
  page_path?: string;
  civic_org_id?: string;
  tab_name?: string;
  content_type?: 'link' | 'photo' | 'announcement' | 'newsletter';
  content_id?: string;
  language?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const event: AnalyticsEvent = await req.json();

    // Insert the analytics event
    const { error } = await supabase
      .from('analytics_events')
      .insert([event]);

    if (error) {
      console.error('Error inserting analytics event:', error);
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Analytics error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
