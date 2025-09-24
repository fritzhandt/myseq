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

    console.log('Processing document:', fileName);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Download the document
    console.log('Downloading document from:', fileUrl);
    const docResponse = await fetch(fileUrl);
    if (!docResponse.ok) {
      throw new Error(`Failed to download document: ${docResponse.statusText}`);
    }

    const docBytes = await docResponse.arrayBuffer();
    console.log('Document downloaded, size:', docBytes.byteLength, 'bytes');

    // Use OpenAI to extract text content and hyperlinks from the document
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Convert document to base64 for OpenAI
    const docBase64 = btoa(String.fromCharCode(...new Uint8Array(docBytes)));
    console.log('Document converted to base64');

    const fileType = fileName.toLowerCase().includes('.pdf') ? 'PDF' : 'Word';
    const mimeType = fileName.toLowerCase().includes('.pdf') ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

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
            content: `You are a document text extraction expert. Extract ALL text content and hyperlinks from the provided ${fileType} document.

            Return the results in this JSON format:
            {
              "content": "Full text content of the document with all agency names, descriptions, services, and complaint types preserved exactly as written",
              "hyperlinks": [
                {
                  "text": "Link text or agency name",
                  "url": "https://website.com", 
                  "context": "Brief context about what this link is for"
                }
              ]
            }

            IMPORTANT:
            - Extract ALL text content - don't summarize or parse it
            - Preserve exact agency names and service descriptions  
            - Extract all clickable hyperlinks with their URLs
            - Keep the original formatting and structure as much as possible
            - This content will be used by AI search to help people find the right agency`
          },
          {
            role: 'user',
            content: [
              {
                type: "text",
                text: `Extract all text content and hyperlinks from this NYC government agencies ${fileType} document: ${fileName}`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${docBase64}`
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
    
    console.log('AI Response received, extracting content...');

    if (!aiContent) {
      throw new Error('No response from AI text extraction');
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

    if (!extractedData.content) {
      throw new Error('No content extracted from PDF');
    }

    console.log('Extracted content length:', extractedData.content.length);
    console.log('Extracted hyperlinks:', extractedData.hyperlinks?.length || 0);

    // Store the extracted content in the database
    // First, check if we already have content for this file
    const { data: existingContent } = await supabase
      .from('pdf_content')
      .select('id')
      .eq('file_name', fileName)
      .maybeSingle();

    if (existingContent) {
      // Update existing content
      const { error: updateError } = await supabase
        .from('pdf_content')
        .update({
          content: extractedData.content,
          hyperlinks: extractedData.hyperlinks || [],
          updated_at: new Date().toISOString()
        })
        .eq('id', existingContent.id);

      if (updateError) {
        throw new Error(`Failed to update PDF content: ${updateError.message}`);
      }

      console.log('Updated existing PDF content');
    } else {
      // Insert new content
      const { error: insertError } = await supabase
        .from('pdf_content')
        .insert({
          file_name: fileName,
          content: extractedData.content,
          hyperlinks: extractedData.hyperlinks || []
        });

      if (insertError) {
        throw new Error(`Failed to store PDF content: ${insertError.message}`);
      }

      console.log('Stored new PDF content');
    }

    const response = {
      success: true,
      message: `Document content extracted and stored successfully.`,
      contentLength: extractedData.content.length,
      hyperlinksFound: extractedData.hyperlinks?.length || 0,
      fileName: fileName
    };

    console.log('Processing complete:', response);

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error processing document:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        message: 'Failed to process document',
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});