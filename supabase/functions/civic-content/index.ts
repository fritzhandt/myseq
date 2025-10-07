import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-session-token',
};

// Validation schemas
const announcementSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(5000),
  photos: z.array(z.string().url()).optional().default([]),
});

const newsletterSchema = z.object({
  title: z.string().min(1).max(200),
  file_path: z.string().min(1),
});

const leadershipSchema = z.object({
  name: z.string().min(1).max(100),
  title: z.string().min(1).max(100),
  photo_url: z.string().url().optional(),
  contact_info: z.record(z.unknown()).optional().default({}),
  order_index: z.number().int().optional().default(0),
});

const linkSchema = z.object({
  title: z.string().min(1).max(100),
  url: z.string().url(),
  description: z.string().max(500).optional(),
  is_active: z.boolean().default(true),
  order_index: z.number().int().optional().default(0),
});

const gallerySchema = z.object({
  photo_url: z.string().url(),
  title: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  order_index: z.number().int().optional().default(0),
});

const generalSettingsSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  coverage_area: z.string().min(1).max(200),
  organization_type: z.string().min(1),
  meeting_info: z.string().max(1000).optional(),
  meeting_address: z.string().max(300).optional(),
  contact_info: z.record(z.unknown()).optional().default({}),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get session token from header
    const sessionToken = req.headers.get('x-session-token');
    if (!sessionToken) {
      return new Response(
        JSON.stringify({ error: 'Session token required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate session and get org ID
    const { data: orgId, error: validateError } = await supabase
      .rpc('get_current_civic_org', { session_token: sessionToken });

    if (validateError || !orgId) {
      console.error('Session validation error:', validateError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const contentType = url.searchParams.get('type'); // announcements, newsletters, leadership, links, gallery, general
    const action = url.searchParams.get('action') || 'list'; // list, create, update, delete
    const itemId = url.searchParams.get('id');

    console.log(`Civic content request: type=${contentType}, action=${action}, orgId=${orgId}`);

    // Route to appropriate handler
    switch (contentType) {
      case 'announcements':
        return await handleAnnouncements(supabase, orgId, action, itemId, req);
      case 'newsletters':
        return await handleNewsletters(supabase, orgId, action, itemId, req);
      case 'leadership':
        return await handleLeadership(supabase, orgId, action, itemId, req);
      case 'links':
        return await handleLinks(supabase, orgId, action, itemId, req);
      case 'gallery':
        return await handleGallery(supabase, orgId, action, itemId, req);
      case 'general':
        return await handleGeneralSettings(supabase, orgId, req);
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid content type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Civic content error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleAnnouncements(supabase: any, orgId: string, action: string, itemId: string | null, req: Request) {
  const table = 'civic_announcements';
  
  if (action === 'list') {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('civic_org_id', orgId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (action === 'create') {
    const body = await req.json();
    const validated = announcementSchema.parse(body);
    
    const { data, error } = await supabase
      .from(table)
      .insert({ ...validated, civic_org_id: orgId })
      .select()
      .single();
    
    if (error) throw error;
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (action === 'update' && itemId) {
    const body = await req.json();
    const validated = announcementSchema.parse(body);
    
    const { data, error } = await supabase
      .from(table)
      .update(validated)
      .eq('id', itemId)
      .eq('civic_org_id', orgId)
      .select()
      .single();
    
    if (error) throw error;
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (action === 'delete' && itemId) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', itemId)
      .eq('civic_org_id', orgId);
    
    if (error) throw error;
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  throw new Error('Invalid action or missing parameters');
}

async function handleNewsletters(supabase: any, orgId: string, action: string, itemId: string | null, req: Request) {
  const table = 'civic_newsletters';
  
  if (action === 'list') {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('civic_org_id', orgId)
      .order('upload_date', { ascending: false });
    
    if (error) throw error;
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (action === 'create') {
    const body = await req.json();
    const validated = newsletterSchema.parse(body);
    
    const { data, error } = await supabase
      .from(table)
      .insert({ ...validated, civic_org_id: orgId })
      .select()
      .single();
    
    if (error) throw error;
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (action === 'delete' && itemId) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', itemId)
      .eq('civic_org_id', orgId);
    
    if (error) throw error;
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  throw new Error('Invalid action or missing parameters');
}

async function handleLeadership(supabase: any, orgId: string, action: string, itemId: string | null, req: Request) {
  const table = 'civic_leadership';
  
  if (action === 'list') {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('civic_org_id', orgId)
      .order('order_index', { ascending: true });
    
    if (error) throw error;
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (action === 'create') {
    const body = await req.json();
    const validated = leadershipSchema.parse(body);
    
    const { data, error } = await supabase
      .from(table)
      .insert({ ...validated, civic_org_id: orgId })
      .select()
      .single();
    
    if (error) throw error;
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (action === 'update' && itemId) {
    const body = await req.json();
    const validated = leadershipSchema.parse(body);
    
    const { data, error } = await supabase
      .from(table)
      .update(validated)
      .eq('id', itemId)
      .eq('civic_org_id', orgId)
      .select()
      .single();
    
    if (error) throw error;
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (action === 'delete' && itemId) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', itemId)
      .eq('civic_org_id', orgId);
    
    if (error) throw error;
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  throw new Error('Invalid action or missing parameters');
}

async function handleLinks(supabase: any, orgId: string, action: string, itemId: string | null, req: Request) {
  const table = 'civic_important_links';
  
  if (action === 'list') {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('civic_org_id', orgId)
      .order('order_index', { ascending: true });
    
    if (error) throw error;
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (action === 'create') {
    const body = await req.json();
    const validated = linkSchema.parse(body);
    
    const { data, error } = await supabase
      .from(table)
      .insert({ ...validated, civic_org_id: orgId })
      .select()
      .single();
    
    if (error) throw error;
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (action === 'update' && itemId) {
    const body = await req.json();
    const validated = linkSchema.parse(body);
    
    const { data, error } = await supabase
      .from(table)
      .update(validated)
      .eq('id', itemId)
      .eq('civic_org_id', orgId)
      .select()
      .single();
    
    if (error) throw error;
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (action === 'delete' && itemId) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', itemId)
      .eq('civic_org_id', orgId);
    
    if (error) throw error;
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  throw new Error('Invalid action or missing parameters');
}

async function handleGallery(supabase: any, orgId: string, action: string, itemId: string | null, req: Request) {
  const table = 'civic_gallery';
  
  if (action === 'list') {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('civic_org_id', orgId)
      .order('order_index', { ascending: true });
    
    if (error) throw error;
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (action === 'create') {
    const body = await req.json();
    const validated = gallerySchema.parse(body);
    
    const { data, error } = await supabase
      .from(table)
      .insert({ ...validated, civic_org_id: orgId })
      .select()
      .single();
    
    if (error) throw error;
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (action === 'update' && itemId) {
    const body = await req.json();
    const validated = gallerySchema.parse(body);
    
    const { data, error } = await supabase
      .from(table)
      .update(validated)
      .eq('id', itemId)
      .eq('civic_org_id', orgId)
      .select()
      .single();
    
    if (error) throw error;
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (action === 'delete' && itemId) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', itemId)
      .eq('civic_org_id', orgId);
    
    if (error) throw error;
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  throw new Error('Invalid action or missing parameters');
}

async function handleGeneralSettings(supabase: any, orgId: string, req: Request) {
  const body = await req.json();
  const validated = generalSettingsSchema.parse(body);
  
  const { data, error } = await supabase
    .from('civic_organizations')
    .update(validated)
    .eq('id', orgId)
    .select()
    .single();
  
  if (error) throw error;
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
