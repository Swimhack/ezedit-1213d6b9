
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, htmlContent } = await req.json();
    
    // For a full implementation, you would integrate with an AI API
    // Here's a simple implementation for demonstration
    let processedHtml = htmlContent;
    
    // Very basic example of modifications (in real implementation, use an AI API)
    if (message.toLowerCase().includes('center')) {
      processedHtml = processedHtml.replace(/<div/g, '<div style="text-align:center"');
    }
    
    if (message.toLowerCase().includes('blue') && message.toLowerCase().includes('h2')) {
      processedHtml = processedHtml.replace(/<h2/g, '<h2 style="color:blue"');
    }
    
    if (message.toLowerCase().includes('responsive')) {
      processedHtml = `<div class="container mx-auto px-4">${processedHtml}</div>`;
    }
    
    return new Response(
      JSON.stringify({ 
        result: processedHtml 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing HTML modification:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process the HTML modification request' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
