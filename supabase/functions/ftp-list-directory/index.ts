
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Client } from "npm:basic-ftp@5.0.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { host, port = 21, username, password, path = "/" } = await req.json();

    if (!host || !username || !password) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Missing required fields: host, username, or password" 
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`Attempting to list FTP directory for ${username}@${host}:${port}${path}`);

    const client = new Client();
    try {
      await client.access({
        host,
        port,
        user: username,
        password,
        secure: false
      });

      const list = await client.list(path);
      const files = list.map(item => ({
        name: item.name,
        size: item.size,
        modified: item.date,
        type: item.isDirectory ? "directory" : "file",
        isDirectory: item.isDirectory
      }));

      return new Response(
        JSON.stringify({ success: true, files }),
        { headers: corsHeaders }
      );
    } catch (error) {
      console.error('FTP listing error:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: error.message || "Failed to list directory contents" 
        }),
        { status: 400, headers: corsHeaders }
      );
    } finally {
      client.close();
    }
  } catch (error) {
    console.error('Request processing error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "Invalid request format" 
      }),
      { status: 400, headers: corsHeaders }
    );
  }
});
