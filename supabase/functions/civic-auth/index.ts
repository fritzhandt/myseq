import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Password hashing utilities using Deno's native crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const passwordBuffer = encoder.encode(password);
  
  const key = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    key,
    256
  );
  
  const hashArray = new Uint8Array(hashBuffer);
  const saltBase64 = btoa(String.fromCharCode(...salt));
  const hashBase64 = btoa(String.fromCharCode(...hashArray));
  
  return `${saltBase64}:${hashBase64}`;
}

async function verifyPassword(password: string, storedHash: string): Promise<{ success: boolean; needsReset?: boolean }> {
  // Check if this is a bcrypt hash (legacy format)
  if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$')) {
    return { success: false, needsReset: true };
  }
  
  // Handle PBKDF2 format (new format)
  try {
    const encoder = new TextEncoder();
    const [saltBase64, hashBase64] = storedHash.split(':');
    
    if (!saltBase64 || !hashBase64) {
      console.error('Invalid password hash format');
      return { success: false };
    }
    
    const salt = Uint8Array.from(atob(saltBase64), c => c.charCodeAt(0));
    const storedHashArray = Uint8Array.from(atob(hashBase64), c => c.charCodeAt(0));
    
    const passwordBuffer = encoder.encode(password);
    
    const key = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    
    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      key,
      256
    );
    
    const computedHashArray = new Uint8Array(hashBuffer);
    
    // Constant-time comparison
    if (computedHashArray.length !== storedHashArray.length) {
      return { success: false };
    }
    
    let result = 0;
    for (let i = 0; i < computedHashArray.length; i++) {
      result |= computedHashArray[i] ^ storedHashArray[i];
    }
    
    return { success: result === 0 };
  } catch (error) {
    console.error('Password verification error:', error);
    return { success: false };
  }
}

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

      console.log('Login attempt for access code:', access_code);

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

      console.log('Organization found:', org.name, 'Active:', org.is_active);

      if (!org.is_active) {
        return new Response(
          JSON.stringify({ error: 'Organization is not active' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify password using native crypto
      const verificationResult = await verifyPassword(password, org.password_hash);

      console.log('Password verification result:', verificationResult);

      if (verificationResult.needsReset) {
        return new Response(
          JSON.stringify({ 
            error: 'PASSWORD_NEEDS_RESET',
            message: 'Your password format needs to be updated. Please contact the platform administrator to reset your password.' 
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!verificationResult.success) {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate secure session token
      const sessionToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour session

      console.log('Creating session for org:', org.id, 'Expires:', expiresAt);

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

      console.log('Session created successfully');

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

      console.log('Validating session token');

      if (!session_token) {
        console.error('No session token provided');
        return new Response(
          JSON.stringify({ error: 'Session token is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate session using security definer function
      const { data: orgId, error: validateError } = await supabase
        .rpc('get_current_civic_org', { session_token });

      console.log('RPC validation result - orgId:', orgId, 'error:', validateError);

      if (validateError || !orgId) {
        console.error('Session validation failed:', validateError);
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

      console.log('Organization fetch result:', org, 'error:', orgError);

      if (orgError || !org || !org.is_active) {
        console.error('Organization not found or inactive');
        return new Response(
          JSON.stringify({ error: 'Organization not found or inactive' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Session validated successfully for:', org.name);

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
