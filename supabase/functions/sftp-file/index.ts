
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import SftpClient from "npm:ssh2-sftp-client@9.1.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.searchParams.get("path");
    const id = url.searchParams.get("connectionId");
    
    if (!path || !id) {
      return new Response(
        JSON.stringify({ error: "Missing path or connectionId parameter" }),
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`[SFTP] Attempting to get file: ${path}`);
    
    const config = {
      host: Deno.env.get("SFTP_HOST"),
      port: Number(Deno.env.get("SFTP_PORT") || "22"),
      username: Deno.env.get("SFTP_USER"),
      password: Deno.env.get("SFTP_PASS")
    };

    const sftp = new SftpClient();
    
    try {
      await sftp.connect(config);
      console.log(`[SFTP] Connected successfully`);
      
      const data = await sftp.get(path);
      console.log(`[SFTP] File retrieved successfully, size: ${data.length} bytes`);
      
      return new Response(
        JSON.stringify({ 
          success: true,
          content: data.toString("utf8")
        }),
        { headers: corsHeaders }
      );
    } catch (e) {
      console.error("[SFTP] Error:", e);
      const msg = e.message;
      const status = /No such file/i.test(msg) ? 404 
                  : /All configured/i.test(msg) ? 401 
                  : 500;
      
      return new Response(
        JSON.stringify({ error: msg }),
        { status, headers: corsHeaders }
      );
    } finally {
      await sftp.end();
    }
  } catch (error) {
    console.error("[SFTP] Request processing error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
