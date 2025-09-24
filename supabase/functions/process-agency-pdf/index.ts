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
      
      // Extract visible text and URLs from Word document
      // Word documents contain URLs in multiple formats
      const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`[\]()]+)/gi;
      const foundUrls = [...rawText.matchAll(urlRegex)];
      
      // Enhanced pattern for complaint titles with URLs (like the user's example)
      const complaintUrlPattern = /([^•\n]+?)\s+(https?:\/\/[^\s<>"{}|\\^`[\]()]+)/gi;
      const complaintMatches = [...rawText.matchAll(complaintUrlPattern)];
      
      // Also look for Word hyperlink patterns (they often contain URLs in XML-like format)
      const wordHyperlinkRegex = /HYPERLINK\s+"([^"]+)"/gi;
      const wordHyperlinks = [...rawText.matchAll(wordHyperlinkRegex)];
      
      // Look for 311.nyc.gov URLs specifically (common pattern in NYC documents)
      const nyc311Regex = /(portal\.311\.nyc\.gov[^\s<>"{}|\\^`[\]()]*)/gi;
      const nyc311Links = [...rawText.matchAll(nyc311Regex)];
      
      console.log('Found regular URLs:', foundUrls.length);
      console.log('Found complaint URLs with titles:', complaintMatches.length);
      console.log('Found Word hyperlinks:', wordHyperlinks.length);
      console.log('Found NYC 311 links:', nyc311Links.length);
      
      // Combine all found URLs with better context
      const allUrls = new Map(); // Use Map to store URL -> context mapping
      
      // Add complaint URLs with their titles
      complaintMatches.forEach(match => {
        const title = match[1].trim().replace(/^[•\-\s]+/, ''); // Remove bullet points and dashes
        const url = match[2].trim();
        allUrls.set(url, { title, context: `NYC 311 service: ${title}` });
      });
      
      // Add regular URLs
      foundUrls.forEach(match => {
        const url = match[1].trim();
        if (!allUrls.has(url)) {
          allUrls.set(url, { title: url, context: 'NYC agency service' });
        }
      });
      
      // Add Word hyperlinks  
      wordHyperlinks.forEach(match => {
        const url = match[1].trim();
        if (url.startsWith('http') && !allUrls.has(url)) {
          allUrls.set(url, { title: url, context: 'NYC agency service' });
        }
      });
      
      // Add NYC 311 links (add https:// if missing)
      nyc311Links.forEach(match => {
        const url = match[1].startsWith('http') ? match[1] : `https://${match[1]}`;
        if (!allUrls.has(url)) {
          allUrls.set(url, { title: 'NYC 311 Service', context: 'NYC 311 service portal' });
        }
      });
      
      console.log('Total unique URLs found:', allUrls.size);
      
      // Create hyperlinks from found URLs with better context
      allUrls.forEach((urlData, url) => {
        hyperlinks.push({
          text: urlData.title || url,
          url: url,
          context: urlData.context || 'NYC agency service'
        });
      });

      // Create a cleaned version of the content for storage
      extractedContent = `Document: ${fileName}\n\nExtracted content from uploaded NYC agencies document:\n\n`;
      
      // Clean up the raw text and extract meaningful content
      const lines = rawText
        .replace(/[\x00-\x1F\x7F]/g, ' ') // Remove control characters
        .split(/[\n\r]+/)
        .map(line => line.replace(/\s+/g, ' ').trim())
        .filter(line => line.length > 15 && !line.match(/^[^a-zA-Z]*$/)) // Keep substantial, meaningful lines
        .slice(0, 200); // Limit to first 200 good lines

      extractedContent += lines.join('\n');
      
      // If we found specific URLs, add them to the content description
      if (allUrls.size > 0) {
        extractedContent += `\n\nThis document contains ${allUrls.size} specific service links for NYC agencies.`;
      }

      console.log('Final processed content length:', extractedContent.length);
      console.log('Final extracted hyperlinks:', hyperlinks.length);

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