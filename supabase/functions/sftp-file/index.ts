
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
    // Parse request body for parameters
    const body = await req.json();
    const { siteId, path } = body;
    
    if (!path || !siteId) {
      return new Response(
        JSON.stringify({ error: "Missing path or siteId parameter" }),
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`[SFTP] Attempting to get file: ${path}`);
    console.log(`[SFTP] Using siteId: ${siteId}, path: ${path}`);
    
    // In a real app, we would fetch connection details from a database
    // Here we're using environment variables for simplicity
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
      
      // Make sure path doesn't have a leading slash if using a root directory
      const cleanPath = path.startsWith('/') && path !== '/' ? path.substring(1) : path;
      console.log(`[SFTP] Accessing path: ${cleanPath}`);
      
      const data = await sftp.get(cleanPath);
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
