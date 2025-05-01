
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import SftpClient from "npm:ssh2-sftp-client@9.1.0";
import { getFtpCreds } from "../_shared/creds.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
  'Surrogate-Control': 'no-store'
};

// Helper function to add delay between retries
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body for parameters
    const body = await req.json();
    const { siteId, path, timestamp } = body;
    
    if (!path || !siteId) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing path or siteId parameter" }),
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`[SFTP] Attempting to get file: ${path}`);
    console.log(`[SFTP] Using siteId: ${siteId}`);
    if (timestamp) {
      console.log(`[SFTP] Cache busting timestamp: ${timestamp}`);
    }
    
    // Get credentials from database
    const creds = await getFtpCreds(siteId);
    if (!creds) {
      console.error(`[SFTP] No credentials found for siteId: ${siteId}`);
      return new Response(
        JSON.stringify({ success: false, message: "Server configuration missing" }),
        { status: 500, headers: corsHeaders }
      );
    }
    
    const { host, user, password, port } = creds;
    
    if (!host || !user || !password) {
      console.error("[SFTP] Missing configuration");
      return new Response(
        JSON.stringify({ success: false, message: "Server configuration missing" }),
        { status: 500, headers: corsHeaders }
      );
    }

    try {
      const sftp = new SftpClient();
      
      await sftp.connect({
        host,
        port,
        username: user,
        password
      });
      console.log(`[SFTP] Connected successfully`);
      
      // Make sure path doesn't have a leading slash if using a root directory
      const cleanPath = path.startsWith('/') && path !== '/' ? path.substring(1) : path;
      console.log(`[SFTP] Accessing path: ${cleanPath}`);
      
      const data = await sftp.get(cleanPath);
      console.log(`[SFTP] File retrieved successfully, size: ${data.length || 0} bytes`);
      
      let contentString = '';
      
      if (Buffer.isBuffer(data)) {
        contentString = data.toString('utf8');
      } else if (typeof data === 'string') {
        contentString = data;
      } else {
        contentString = JSON.stringify(data);
      }
      
      await sftp.end();
      
      // If content is empty or invalid, wait and retry
      if (!contentString || contentString.trim().length === 0) {
        console.warn("[SFTP] First attempt returned empty content, waiting 2 seconds before retry");
        await sleep(2000);
        
        // Retry
        const retryClient = new SftpClient();
        await retryClient.connect({
          host,
          port,
          username: user,
          password
        });
        
        const retryData = await retryClient.get(cleanPath);
        await retryClient.end();
        
        if (Buffer.isBuffer(retryData)) {
          contentString = retryData.toString('utf8');
        } else if (typeof retryData === 'string') {
          contentString = retryData;
        } else {
          contentString = JSON.stringify(retryData);
        }
        
        if (!contentString || contentString.trim().length === 0) {
          throw new Error("File content still empty after retry");
        }
        
        console.log(`[SFTP] Retry successful, size: ${contentString.length} bytes`);
      }
      
      return new Response(
        JSON.stringify({ 
          success: true,
          content: contentString,
          timestamp: Date.now() // Include timestamp for cache verification
        }),
        { headers: corsHeaders }
      );
    } catch (e) {
      console.error("[SFTP] Error:", e);
      
      // Wait 2 seconds and retry on error
      console.log("[SFTP] Waiting 2 seconds before retry...");
      await sleep(2000);
      
      try {
        console.log("[SFTP] Retrying after error...");
        const retryClient = new SftpClient();
        await retryClient.connect({
          host,
          port,
          username: user,
          password
        });
        
        const cleanPath = path.startsWith('/') && path !== '/' ? path.substring(1) : path;
        const retryData = await retryClient.get(cleanPath);
        await retryClient.end();
        
        let contentString = '';
        if (Buffer.isBuffer(retryData)) {
          contentString = retryData.toString('utf8');
        } else if (typeof retryData === 'string') {
          contentString = retryData;
        } else {
          contentString = JSON.stringify(retryData);
        }
        
        if (!contentString || contentString.trim().length === 0) {
          throw new Error("File content still empty after error retry");
        }
        
        console.log(`[SFTP] Error retry successful, size: ${contentString.length} bytes`);
        
        return new Response(
          JSON.stringify({ 
            success: true,
            content: contentString,
            timestamp: Date.now(),
            retried: true
          }),
          { headers: corsHeaders }
        );
      } catch (retryError) {
        const msg = retryError.message || "Unknown error";
        const status = /No such file/i.test(msg) ? 404 
                    : /All configured/i.test(msg) ? 401 
                    : 500;
        
        console.error("[SFTP] Retry also failed:", retryError);
        
        return new Response(
          JSON.stringify({ success: false, message: msg }),
          { status, headers: corsHeaders }
        );
      }
    }
  } catch (error) {
    console.error("[SFTP] Request processing error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Internal server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
