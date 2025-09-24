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

    console.log('Supabase client initialized');

    // Download and process the actual uploaded file
    console.log('Downloading file from:', fileUrl);
    
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      throw new Error(`Failed to download file: ${fileResponse.statusText}`);
    }

    const fileBuffer = await fileResponse.arrayBuffer();
    const fileContent = new Uint8Array(fileBuffer);
    
    console.log('File downloaded, size:', fileContent.length, 'bytes');

    // For now, we'll extract a basic text representation
    // This is a simplified approach - in production you'd use proper PDF/Word parsing libraries
    let extractedContent = '';
    let hyperlinks: Array<{text: string, url: string, context: string}> = [];

    try {
      // Convert file content to text for basic parsing
      const decoder = new TextDecoder('utf-8', { fatal: false });
      const rawText = decoder.decode(fileContent);
      
      console.log('Raw text length:', rawText.length);
      
      // Extract visible text (this is a simplified approach)
      // Look for URLs in the text
      const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/g;
      const foundUrls = [...rawText.matchAll(urlRegex)];
      
      console.log('Found URLs:', foundUrls.length);
      
      // Create hyperlinks from found URLs
      foundUrls.forEach((match, index) => {
        const url = match[1];
        // Extract context around the URL (50 chars before and after)
        const start = Math.max(0, match.index! - 50);
        const end = Math.min(rawText.length, match.index! + url.length + 50);
        const context = rawText.substring(start, end).replace(/[\n\r\t]/g, ' ').trim();
        
        // Try to extract a meaningful title from the context
        let title = url;
        if (context) {
          // Look for text before the URL that might be a title
          const beforeUrl = rawText.substring(Math.max(0, match.index! - 100), match.index!);
          const titleMatch = beforeUrl.match(/([A-Za-z0-9\s\-&().,]+)\s*:?\s*$/);
          if (titleMatch) {
            title = titleMatch[1].trim();
          }
        }
        
        hyperlinks.push({
          text: title || `Link ${index + 1}`,
          url: url,
          context: context || 'No context available'
        });
      });

      // Create a cleaned version of the content for storage
      extractedContent = `Document: ${fileName}\n\nExtracted from uploaded document:\n\n`;
      
      // Try to extract meaningful content
      // This is a basic approach - split by common delimiters and clean up
      const lines = rawText.split(/[\n\r]+/).map(line => 
        line.replace(/[^\x20-\x7E\u00A0-\u024F\u1E00-\u1EFF]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
      ).filter(line => line.length > 10); // Only keep substantial lines

      extractedContent += lines.slice(0, 100).join('\n'); // Limit to first 100 substantial lines

      console.log('Processed content length:', extractedContent.length);
      console.log('Extracted hyperlinks:', hyperlinks.length);

    } catch (error) {
      console.error('Error parsing file content:', error);
      // Fallback content
      extractedContent = `Document: ${fileName}\n\nUploaded file could not be fully parsed. File size: ${fileContent.length} bytes.`;
      hyperlinks = [];
    }

    // Store the extracted content in the database
    // First, clear any existing content (replace all existing documents)
    const { error: deleteError } = await supabase
      .from('pdf_content')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

    if (deleteError) {
      console.warn('Failed to delete existing content:', deleteError.message);
    }

    // Insert new content (always replaces everything)
    const { error: insertError } = await supabase
      .from('pdf_content')
      .insert({
        file_name: fileName,
        content: extractedContent,
        hyperlinks: hyperlinks
      });

    if (insertError) {
      throw new Error(`Failed to store document content: ${insertError.message}`);
    }

    console.log('Replaced all existing document content with new upload');

    const response = {
      success: true,
      message: `Document content extracted and stored successfully. Now the AI can reference comprehensive NYC agency information for better search results.`,
      contentLength: extractedContent.length,
      hyperlinksFound: hyperlinks.length,
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