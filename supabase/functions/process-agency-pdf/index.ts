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

    // Download and process the actual PDF
    console.log('Downloading PDF from:', fileUrl);
    const pdfResponse = await fetch(fileUrl);
    if (!pdfResponse.ok) {
      throw new Error(`Failed to download PDF: ${pdfResponse.statusText}`);
    }

    const pdfBytes = await pdfResponse.bytes();
    console.log('PDF downloaded, size:', pdfBytes.length, 'bytes');

    // Use OpenAI to extract text and agency info from the PDF
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Convert PDF bytes to base64 in chunks to avoid stack overflow
    const chunkSize = 1000000; // 1MB chunks
    let base64String = '';
    
    for (let i = 0; i < pdfBytes.length; i += chunkSize) {
      const chunk = pdfBytes.slice(i, i + chunkSize);
      const chunkBase64 = btoa(String.fromCharCode.apply(null, Array.from(chunk)));
      base64String += chunkBase64;
    }

    console.log('PDF converted to base64, length:', base64String.length);

    // Use OpenAI to analyze the PDF
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert at extracting government agency information from PDF documents.

            Analyze the provided PDF document and extract ALL government agencies mentioned. For each agency, provide:
            1. Name (exact official name from document)
            2. Description (what services they provide)
            3. Level (city, state, or federal - default to city for NYC agencies)
            4. Website URL (if mentioned in document)
            5. Keywords (array of services, issues they handle)

            Return results as JSON:
            {
              "agencies": [
                {
                  "name": "Agency Name",
                  "description": "Services and responsibilities",
                  "level": "city|state|federal",
                  "website": "https://website.com or null",
                  "keywords": ["service1", "service2", "complaint_type"]
                }
              ]
            }

            Extract ALL agencies from the document - there should be dozens. Include specific complaint types and services as keywords.`
          },
          {
            role: 'user',
            content: [
              {
                type: "text",
                text: `Extract all government agencies from this NYC agencies PDF document. Make sure to get every single agency listed and their services.`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:application/pdf;base64,${base64String}`
                }
              }
            ]
          }
        ],
        max_tokens: 4000,
        temperature: 0.1
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const aiResult = await openaiResponse.json();
    const aiContent = aiResult.choices?.[0]?.message?.content;
    
    console.log('AI Response received, length:', aiContent?.length);

    if (!aiContent) {
      throw new Error('No response from AI analysis');
    }

    // Parse the AI response
    let extractedData;
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        extractedData = JSON.parse(aiContent);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw AI content:', aiContent);
      throw new Error('Failed to parse AI response as JSON');
    }

    if (!extractedData.agencies || !Array.isArray(extractedData.agencies)) {
      throw new Error('Invalid response format from AI - no agencies array found');
    }

    console.log('Extracted agencies from PDF:', extractedData.agencies.length);

    // Insert/update agencies in the database
    let processedCount = 0;
    const errors = [];

    for (const agency of extractedData.agencies) {
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
      totalExtracted: extractedData.agencies.length,
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