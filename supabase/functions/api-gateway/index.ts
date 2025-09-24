import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

// Rate limiting store (in-memory for this example)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathname = url.pathname;
    
    // Extract function name from path (e.g., /api-gateway/search-agencies -> search-agencies)
    const functionName = pathname.split('/').pop();
    
    if (!functionName || functionName === 'api-gateway') {
      return new Response(JSON.stringify({ error: 'Invalid function name' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate API key
    const apiKey = req.headers.get('x-api-key');
    const validApiKey = Deno.env.get('FRONTEND_API_KEY');
    
    if (!apiKey || apiKey !== validApiKey) {
      console.error('Invalid or missing API key');
      return new Response(JSON.stringify({ error: 'Unauthorized - Invalid API key' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Rate limiting (100 requests per minute per API key)
    const rateLimitKey = `${apiKey}:${functionName}`;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 100;

    const current = rateLimitStore.get(rateLimitKey);
    if (current && current.resetTime > now) {
      if (current.count >= maxRequests) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      current.count++;
    } else {
      rateLimitStore.set(rateLimitKey, { count: 1, resetTime: now + windowMs });
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request body if present
    let requestBody = null;
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      try {
        requestBody = await req.json();
      } catch (error) {
        console.error('Error parsing request body:', error);
        return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Log the request
    console.log(`API Gateway: ${req.method} ${functionName}`, {
      timestamp: new Date().toISOString(),
      apiKey: apiKey.substring(0, 8) + '...',
      body: requestBody ? Object.keys(requestBody) : null
    });

    // Route to appropriate function
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: requestBody,
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (error) {
      console.error(`Error calling ${functionName}:`, error);
      return new Response(JSON.stringify({ 
        error: 'Internal function error',
        details: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Return the function response
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('API Gateway error:', error);
    return new Response(JSON.stringify({ 
      error: 'Gateway error',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});