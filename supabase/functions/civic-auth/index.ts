import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.2.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LoginRequest {
  access_code: string;
  password: string;
}

interface ValidateRequest {
  session_token: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'login';

    if (action === 'login') {
      const { access_code, password }: LoginRequest = await req.json();

      if (!access_code || !password) {
        return new Response(
          JSON.stringify({ error: 'Access code and password are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Fetch organization by access code
      const { data: org, error: orgError } = await supabase
        .from('civic_organizations')
        .select('id, name, password_hash, is_active')
        .eq('access_code', access_code)
        .single();

      if (orgError || !org) {
        console.error('Organization fetch error:', orgError);
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!org.is_active) {
        return new Response(
          JSON.stringify({ error: 'Organization is not active' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify password using bcrypt
      const passwordMatch = await bcrypt.compare(password, org.password_hash);

      if (!passwordMatch) {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate secure session token
      const sessionToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour session

      // Store session in database
      const { error: sessionError } = await supabase
        .from('civic_org_sessions')
        .insert({
          civic_org_id: org.id,
          session_token: sessionToken,
          expires_at: expiresAt.toISOString(),
        });

      if (sessionError) {
        console.error('Session creation error:', sessionError);
        return new Response(
          JSON.stringify({ error: 'Failed to create session' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          session_token: sessionToken,
          org_id: org.id,
          org_name: org.name,
          expires_at: expiresAt.toISOString(),
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'validate') {
      const { session_token }: ValidateRequest = await req.json();

      if (!session_token) {
        return new Response(
          JSON.stringify({ error: 'Session token is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate session using security definer function
      const { data: orgId, error: validateError } = await supabase
        .rpc('get_current_civic_org', { session_token });

      if (validateError || !orgId) {
        return new Response(
          JSON.stringify({ error: 'Invalid or expired session' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Fetch organization details
      const { data: org, error: orgError } = await supabase
        .from('civic_organizations')
        .select('id, name, is_active')
        .eq('id', orgId)
        .single();

      if (orgError || !org || !org.is_active) {
        return new Response(
          JSON.stringify({ error: 'Organization not found or inactive' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          valid: true,
          org_id: org.id,
          org_name: org.name,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'logout') {
      const { session_token }: ValidateRequest = await req.json();

      if (!session_token) {
        return new Response(
          JSON.stringify({ error: 'Session token is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Delete session
      const { error: deleteError } = await supabase
        .from('civic_org_sessions')
        .delete()
        .eq('session_token', session_token);

      if (deleteError) {
        console.error('Logout error:', deleteError);
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Civic auth function error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
