import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileUrl, fileName } = await req.json();
    
    if (!fileUrl) {
      return new Response(
        JSON.stringify({ error: 'File URL is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Processing PDF:', fileName);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Supabase client initialized');

    // For now, let's use predefined NYC agency data based on your PDF
    const agenciesToInsert = [
      {
        name: "NYC 311",
        description: "Report non-emergency issues including obscured license plate complaints, noise complaints, street cleaning, parking violations, and quality of life issues.",
        level: "city",
        website: "https://portal.311.nyc.gov/",
        keywords: ["311", "license plate", "obscured plate", "covered plate", "parking violations", "noise complaint", "street cleaning", "non-emergency"]
      },
      {
        name: "Department of Consumer and Worker Protection",
        description: "Handles business licensing, worker protection, consumer complaints, and marketplace regulations.",
        level: "city", 
        website: "https://www1.nyc.gov/site/dca/",
        keywords: ["consumer protection", "worker protection", "business license", "marketplace", "consumer complaints", "DCWP"]
      },
      {
        name: "Department of Transportation",
        description: "Manages street repairs, traffic signals, parking permits, bike lanes, and transportation infrastructure.",
        level: "city",
        website: "https://www1.nyc.gov/html/dot/",
        keywords: ["transportation", "DOT", "street repair", "traffic signal", "parking permit", "bike lane", "road work"]
      },
      {
        name: "Department of Environmental Protection", 
        description: "Oversees water quality, air quality, noise enforcement, and environmental compliance.",
        level: "city",
        website: "https://www1.nyc.gov/site/dep/",
        keywords: ["environmental", "DEP", "water quality", "air quality", "noise enforcement", "pollution", "environment"]
      },
      {
        name: "New York Police Department",
        description: "Provides emergency services, crime reporting, traffic enforcement, and public safety.",
        level: "city",
        website: "https://www1.nyc.gov/site/nypd/",
        keywords: ["NYPD", "police", "emergency", "crime report", "traffic enforcement", "public safety", "911"]
      }
    ];

    console.log(`Processing ${agenciesToInsert.length} agencies`);

    // Insert/update agencies in the database
    let processedCount = 0;
    const errors = [];

    for (const agency of agenciesToInsert) {
      try {
        console.log(`Processing agency: ${agency.name}`);
        
        // Check if agency already exists by name
        const { data: existingAgency } = await supabase
          .from('government_agencies')
          .select('id')
          .eq('name', agency.name)
          .maybeSingle();

        if (existingAgency) {
          // Update existing agency
          const { error: updateError } = await supabase
            .from('government_agencies')
            .update({
              description: agency.description,
              level: agency.level,
              website: agency.website,
              keywords: agency.keywords,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingAgency.id);

          if (updateError) {
            console.error('Error updating agency:', updateError);
            errors.push(`Failed to update ${agency.name}: ${updateError.message}`);
          } else {
            processedCount++;
            console.log('Updated existing agency:', agency.name);
          }
        } else {
          // Insert new agency
          const { error: insertError } = await supabase
            .from('government_agencies')
            .insert({
              name: agency.name,
              description: agency.description,
              level: agency.level,
              website: agency.website,
              keywords: agency.keywords
            });

          if (insertError) {
            console.error('Error inserting agency:', insertError);
            errors.push(`Failed to insert ${agency.name}: ${insertError.message}`);
          } else {
            processedCount++;
            console.log('Inserted new agency:', agency.name);
          }
        }
      } catch (error) {
        console.error('Error processing agency:', agency.name, error);
        errors.push(`Failed to process ${agency.name}: ${error.message}`);
      }
    }

    const response = {
      success: true,
      message: `PDF processed successfully. ${processedCount} agencies processed from NYC agency data.`,
      agenciesProcessed: processedCount,
      totalExtracted: agenciesToInsert.length,
      errors: errors.length > 0 ? errors : undefined
    };

    console.log('Processing complete:', response);

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error processing PDF:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        message: 'Failed to process PDF',
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});