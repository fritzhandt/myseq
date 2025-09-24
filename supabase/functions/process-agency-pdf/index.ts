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

    console.log('Processing PDF:', fileName, 'from URL:', fileUrl);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Download the PDF file
    const pdfResponse = await fetch(fileUrl);
    if (!pdfResponse.ok) {
      throw new Error(`Failed to download PDF: ${pdfResponse.statusText}`);
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();
    console.log('PDF downloaded, size:', pdfBuffer.byteLength);

    // Use OpenAI to extract agency information from the PDF
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Convert PDF to base64 for OpenAI
    const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));

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
            content: `You are an expert at extracting government agency information from documents. 
            
            Analyze the provided PDF and extract all government agencies mentioned. For each agency, provide:
            1. Name (official name)
            2. Description (what they do/handle)
            3. Level (city, state, or federal)
            4. Website URL (if mentioned)
            5. Keywords (array of relevant terms people might search for)

            Return the results as a JSON array with this structure:
            {
              "agencies": [
                {
                  "name": "Agency Name",
                  "description": "What this agency handles or does",
                  "level": "city|state|federal", 
                  "website": "https://website.com or null if not found",
                  "keywords": ["keyword1", "keyword2", "keyword3"]
                }
              ]
            }

            Focus on extracting practical information that would help someone find the right agency for their issue.
            Include common search terms in keywords (like "license plate", "parking", "housing", etc.).`
          },
          {
            role: 'user',
            content: `Please extract government agency information from this PDF document: ${fileName}. 
                     The PDF is provided as base64 data. Extract all agencies, their descriptions, contact information, 
                     and any website URLs mentioned in the document.`
          }
        ],
        max_tokens: 2000,
        temperature: 0.1
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const aiResult = await openaiResponse.json();
    const aiContent = aiResult.choices?.[0]?.message?.content;
    
    console.log('AI Response:', aiContent);

    if (!aiContent) {
      throw new Error('No response from AI analysis');
    }

    // Parse the AI response
    let extractedData;
    try {
      extractedData = JSON.parse(aiContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Try to extract JSON from the response if it's wrapped in markdown
      const jsonMatch = aiContent.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Failed to parse AI response as JSON');
      }
    }

    if (!extractedData.agencies || !Array.isArray(extractedData.agencies)) {
      throw new Error('Invalid response format from AI');
    }

    console.log('Extracted agencies:', extractedData.agencies.length);

    // Insert/update agencies in the database
    let processedCount = 0;
    const errors = [];

    for (const agency of extractedData.agencies) {
      try {
        // Check if agency already exists by name
        const { data: existingAgency } = await supabase
          .from('government_agencies')
          .select('id')
          .eq('name', agency.name)
          .single();

        if (existingAgency) {
          // Update existing agency
          const { error: updateError } = await supabase
            .from('government_agencies')
            .update({
              description: agency.description,
              level: agency.level,
              website: agency.website || '',
              keywords: agency.keywords || [],
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
              website: agency.website || '',
              keywords: agency.keywords || []
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
      message: `PDF processed successfully. ${processedCount} agencies processed.`,
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