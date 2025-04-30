
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!openAIApiKey) {
    return new Response(
      JSON.stringify({ error: "OpenAI API key is not configured" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { fileContent, prompt, filePath } = await req.json();
    
    if (!fileContent || !prompt) {
      return new Response(
        JSON.stringify({ error: "File content and prompt are required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine the file type based on the path
    const fileExtension = filePath?.split('.').pop()?.toLowerCase() || '';
    const fileType = 
      /html?|htm/.test(fileExtension) ? 'HTML' :
      /css/.test(fileExtension) ? 'CSS' :
      /js/.test(fileExtension) ? 'JavaScript' :
      /php/.test(fileExtension) ? 'PHP' :
      'text';

    console.log(`[editFileAI] Processing ${fileType} file with prompt: ${prompt}`);
    
    const systemPrompt = `You are an expert web developer assistant that helps modify ${fileType} code according to the user's instructions.
Focus on making the exact changes requested without adding commentary.
Only output the modified code with no explanations.
Preserve all existing functionality while making the requested changes.`;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Here is the current file content:\n\n\`\`\`\n${fileContent}\n\`\`\`\n\nPlease ${prompt}` }
        ],
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const modifiedContent = data.choices[0].message.content.trim();
    
    // Sometimes the AI includes the code block markers, so remove them if present
    const cleanedContent = modifiedContent
      .replace(/^```(?:html|css|javascript|js|php)?\n/i, '')
      .replace(/```$/i, '');
    
    console.log(`[editFileAI] Successfully processed. Original length: ${fileContent.length}, New length: ${cleanedContent.length}`);

    return new Response(
      JSON.stringify({ modifiedContent: cleanedContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[editFileAI] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
