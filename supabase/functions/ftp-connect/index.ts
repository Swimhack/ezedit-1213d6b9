
import { Client } from 'https://esm.sh/basic-ftp@5.0.4';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { host, username, password, port = 21, path = '/' } = await req.json();
    const client = new Client();

    try {
      await client.access({
        host,
        user: username,
        password,
        port,
        secure: false,
        passive: true,
      });

      // Navigate to the specified directory
      if (path && path !== '/') {
        await client.cd(path);
      }

      const list = await client.list();
      return new Response(
        JSON.stringify({ 
          success: true, 
          files: list.map(item => ({
            name: item.name,
            size: item.size,
            type: item.type,
            isDirectory: item.type === 2, // 2 is directory in FTP
            modifiedAt: item.date ? item.date.toISOString() : null
          }))
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (err) {
      console.error('FTP error:', err);
      return new Response(
        JSON.stringify({ success: false, error: err.message }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } finally {
      client.close();
    }
  } catch (error) {
    console.error('Request error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid request' }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
