
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const KLEIN_API_KEY = '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';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, filePath, fileContent, previousMessages } = await req.json();
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KLEIN_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ezedit.co',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are Cline AI explaining code. The current file being discussed is: ${filePath}\n\nHere is the file content:\n${fileContent}`
          },
          ...(previousMessages || []).map(m => ({
            role: m.role,
            content: m.content
          })),
          { role: 'user', content: message }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${errorData}`);
    }

    const data = await response.json();
    return new Response(
      JSON.stringify({ response: data.choices[0].message.content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Cline chat error:', error);
    return new Response(
      JSON.stringify({ 
        response: `⚠️ Error: ${error.message || 'Something went wrong. Please try again.'}`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 // Still return 200 to handle the error in the UI
      }
    );
  }
});
