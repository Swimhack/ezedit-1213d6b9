
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CLINE_API_KEY = Deno.env.get('KLEIN_API_KEY'); // Keep using existing env variable
const CLINE_API_URL = 'https://api.klein.ai/v1/chat'; // Keep using Klein API but refer to it as Cline

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, filePath, fileContent } = await req.json();

    const response = await fetch(CLINE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLINE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: `You are a helpful AI assistant analyzing code. The current file being discussed is: ${filePath}\n\nHere is the file content:\n${fileContent}`
          },
          {
            role: 'user',
            content: message
          }
        ]
      })
    });

    const data = await response.json();
    
    return new Response(
      JSON.stringify({ response: data.choices[0].message.content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Cline chat error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
