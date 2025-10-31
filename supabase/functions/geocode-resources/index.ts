import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Resource {
  id: string;
  address: string;
  organization_name: string;
}

interface NominatimResponse {
  lat: string;
  lon: string;
  display_name: string;
}

/**
 * Check if an address is a P.O. Box (cannot be geocoded)
 */
function isPOBox(address: string): boolean {
  const poBoxPattern = /\b(P\.?\s*O\.?\s*BOX|POST\s+OFFICE\s+BOX)\b/i;
  return poBoxPattern.test(address);
}

/**
 * Geocode an address using Nominatim (OpenStreetMap)
 * Rate limited to 1 request per second
 */
async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  try {
    // Check if it's a P.O. Box
    if (isPOBox(address)) {
      console.log(`Skipping P.O. Box: ${address}`);
      return null;
    }

    // Pass address as-is since they already contain complete city/state/ZIP
    const encodedAddress = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MySEQ Community Platform (contact: admin@myseq.org)',
      },
    });

    if (!response.ok) {
      console.error(`Nominatim API error: ${response.status} for address: ${address}`);
      return null;
    }

    const data: NominatimResponse[] = await response.json();
    
    if (data && data.length > 0) {
      console.log(`✓ Successfully geocoded: ${address} -> ${data[0].display_name}`);
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      };
    }
    
    console.warn(`No results found for address: ${address}`);
    return null;
  } catch (error) {
    console.error(`Geocoding error for address "${address}":`, error);
    return null;
  }
}

/**
 * Sleep utility for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all resources that have addresses but no coordinates
    const { data: resources, error: fetchError } = await supabase
      .from('resources')
      .select('id, address, organization_name')
      .not('address', 'is', null)
      .is('latitude', null);

    if (fetchError) {
      throw new Error(`Failed to fetch resources: ${fetchError.message}`);
    }

    if (!resources || resources.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'All resources already geocoded',
          geocoded: 0,
          failed: 0,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting geocoding for ${resources.length} resources...`);

    let geocoded = 0;
    let failed = 0;
    let skipped = 0;
    const failedResources: { id: string; name: string; address: string; reason?: string }[] = [];

    // Process each resource with rate limiting (1 request per second)
    for (const resource of resources as Resource[]) {
      console.log(`Geocoding: ${resource.organization_name} - ${resource.address}`);
      
      // Check if it's a P.O. Box first
      if (isPOBox(resource.address)) {
        console.log(`Skipping P.O. Box for ${resource.organization_name}`);
        skipped++;
        failedResources.push({
          id: resource.id,
          name: resource.organization_name,
          address: resource.address,
          reason: 'P.O. Box (no physical location)',
        });
        continue;
      }

      const coordinates = await geocodeAddress(resource.address);
      
      if (coordinates) {
        const { error: updateError } = await supabase
          .from('resources')
          .update({
            latitude: coordinates.lat,
            longitude: coordinates.lon,
          })
          .eq('id', resource.id);

        if (updateError) {
          console.error(`Failed to update ${resource.organization_name}:`, updateError);
          failed++;
          failedResources.push({
            id: resource.id,
            name: resource.organization_name,
            address: resource.address,
            reason: 'Database update failed',
          });
        } else {
          console.log(`✓ Geocoded: ${resource.organization_name}`);
          geocoded++;
        }
      } else {
        console.warn(`✗ Failed to geocode: ${resource.organization_name} - ${resource.address}`);
        failed++;
        failedResources.push({
          id: resource.id,
          name: resource.organization_name,
          address: resource.address,
          reason: 'Address not found',
        });
      }

      // Rate limiting: wait 1 second between requests
      await sleep(1000);
    }

    console.log(`Geocoding complete: ${geocoded} successful, ${failed} failed, ${skipped} skipped`);

    return new Response(
      JSON.stringify({
        success: true,
        geocoded,
        failed,
        skipped,
        failedResources: failedResources.length > 0 ? failedResources : undefined,
        message: `Geocoded ${geocoded} resources. ${failed} failed. ${skipped} skipped (P.O. Boxes).`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in geocode-resources function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false,
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
