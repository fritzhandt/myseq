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
 * Try geocoding with multiple address format variations
 * Respects Nominatim's 1 request per second rate limit
 */
async function tryGeocode(addressVariations: string[], sleep: (ms: number) => Promise<void>): Promise<{ lat: number; lon: number; matchedAddress: string } | null> {
  for (let i = 0; i < addressVariations.length; i++) {
    const addr = addressVariations[i];
    const encodedAddress = encodeURIComponent(addr);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`;
    
    console.log(`  Trying variation ${i + 1}/${addressVariations.length}: "${addr}"`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MySEQ Community Platform (contact: admin@myseq.org)',
      },
    });

    if (!response.ok) {
      console.warn(`  ✗ Nominatim request failed (${response.status}) for "${addr}"`);
      
      // If we get rate limited, wait longer before next attempt
      if (response.status === 429) {
        console.warn(`  ⏳ Rate limited, waiting 5 seconds...`);
        await sleep(5000);
      }
      
      // Still wait between variations to respect rate limits
      if (i < addressVariations.length - 1) {
        await sleep(1100);
      }
      continue;
    }

    const data: NominatimResponse[] = await response.json();
    
    if (data && data.length > 0) {
      console.log(`  ✓ Match found with variation ${i + 1}`);
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        matchedAddress: addr,
      };
    }
    
    console.log(`  ✗ No results for variation ${i + 1}`);
    
    // Wait 1.1 seconds between variations to respect Nominatim's rate limit
    if (i < addressVariations.length - 1) {
      await sleep(1100);
    }
  }
  
  return null;
}

/**
 * Geocode an address using Nominatim (OpenStreetMap)
 * Tries multiple NYC-aware format variations
 * Rate limited to 1 request per second per variation
 */
async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  try {
    // Check if it's a P.O. Box
    if (isPOBox(address)) {
      console.log(`Skipping P.O. Box: ${address}`);
      return null;
    }

    // Try multiple NYC-aware address format variations
    // Don't remove Queens hyphens - OSM often understands them better
    const addressVariations = [
      address, // Original format (e.g., "219-07 46th Ave, Queens Village, NY 11429")
      `${address}, Queens, NY`, // Explicit Queens
      `${address}, Queens, New York, USA`, // Full explicit format
      address.replace(/,/g, ''), // Without commas as fallback
    ];

    console.log(`Geocoding: ${address}`);
    
    const result = await tryGeocode(addressVariations, sleep);
    
    if (result) {
      console.log(`✓ Successfully geocoded: ${address} using format: ${result.matchedAddress}`);
      return {
        lat: result.lat,
        lon: result.lon,
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

    // Process in batches of 20 to avoid timeout
    const BATCH_SIZE = 20;
    const totalBatches = Math.ceil(resources.length / BATCH_SIZE);
    
    console.log(`Processing ${resources.length} resources in ${totalBatches} batches of ${BATCH_SIZE}`);

    // Process each resource with rate limiting (1 request per second per variation)
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

      // Rate limiting is now handled inside tryGeocode (1.1s between variations)
      // Small delay between resources to be extra safe
      await sleep(500);
    }

    console.log(`Geocoding complete: ${geocoded} successful, ${failed} failed, ${skipped} skipped`);
    console.log(`Processed ${resources.length} total resources`);

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
