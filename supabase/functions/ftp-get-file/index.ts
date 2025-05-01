
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Client } from "https://esm.sh/basic-ftp@5.0.3";

// Helper function to add delay between retries
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "Pragma": "no-cache",
  "Expires": "0",
  "Surrogate-Control": "no-store"
};

// Function to handle FTP connection and file download with retry logic
async function downloadFileFromFtp(host: string, port: number, user: string, password: string, path: string): Promise<string> {
  const client = new Client();
  try {
    await client.access({
      host,
      port,
      user,
      password,
      secure: false
    });
    
    // Download file content to memory
    const chunks = [];
    await client.downloadTo(
      new WritableStream({
        write(chunk) {
          chunks.push(chunk);
        }
      }),
      path
    );
    
    const content = new TextDecoder().decode(new Uint8Array(await new Response(new Blob(chunks)).arrayBuffer()));
    return content;
  } finally {
    client.close();
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    
    const { siteId, path, timestamp } = await req.json();
    
    if (!siteId || !path) {
      return new Response(
        JSON.stringify({ success: false, message: "Connection ID and filepath are required" }),
        { headers: corsHeaders, status: 400 }
      );
    }

    // Log if cache busting is being used
    if (timestamp) {
      console.log(`[FTP-GET-FILE] Cache busting timestamp: ${timestamp}`);
    }

    // Get credentials
    const { data: credsData, error: credsError } = await supabase.functions.invoke("getFtpCreds", { 
      body: { id: siteId } 
    });

    if (credsError) {
      console.error("[getFile] Credentials error:", credsError);
      return new Response(
        JSON.stringify({ success: false, message: credsError }),
        { headers: corsHeaders, status: 400 }
      );
    }
    
    // First attempt to download the file
    try {
      const content = await downloadFileFromFtp(
        credsData.host,
        credsData.port,
        credsData.user,
        credsData.password,
        path
      );
      
      // Validate content
      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        console.warn("[FTP-GET-FILE] First attempt returned empty or invalid content, retrying in 2 seconds...");
        await sleep(2000); // 2-second delay before retry
        
        // Second attempt after delay
        console.log("[FTP-GET-FILE] Retrying file download...");
        const retryContent = await downloadFileFromFtp(
          credsData.host,
          credsData.port,
          credsData.user,
          credsData.password,
          path
        );
        
        if (!retryContent || typeof retryContent !== 'string' || retryContent.trim().length === 0) {
          throw new Error("Failed to download valid file content after retry");
        }
        
        // Broadcast event via Realtime
        await supabase.channel(`ftp_logs:${siteId}`).send({
          type: 'broadcast',
          event: 'file_accessed',
          payload: { path, retrySuccess: true }
        });
        
        return new Response(
          JSON.stringify({ 
            success: true,
            content: retryContent,
            retryUsed: true,
            timestamp: Date.now(),
            checksum: await crypto.subtle.digest("SHA-256", new TextEncoder().encode(retryContent))
              .then(hash => Array.from(new Uint8Array(hash))
              .map(b => b.toString(16).padStart(2, "0"))
              .join(""))
          }),
          { headers: corsHeaders, status: 200 }
        );
      }
      
      // Broadcast event via Realtime
      await supabase.channel(`ftp_logs:${siteId}`).send({
        type: 'broadcast',
        event: 'file_accessed',
        payload: { path }
      });
      
      return new Response(
        JSON.stringify({ 
          success: true,
          content,
          retryUsed: false,
          timestamp: Date.now(),
          checksum: await crypto.subtle.digest("SHA-256", new TextEncoder().encode(content))
            .then(hash => Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, "0"))
            .join(""))
        }),
        { headers: corsHeaders, status: 200 }
      );
      
    } catch (ftpError) {
      console.error("[FTP-GET-FILE] Error during download:", ftpError);
      console.log("[FTP-GET-FILE] Waiting 2 seconds before retry...");
      
      // Wait 2 seconds and retry on error
      await sleep(2000);
      
      try {
        console.log("[FTP-GET-FILE] Retrying after error...");
        const content = await downloadFileFromFtp(
          credsData.host,
          credsData.port,
          credsData.user,
          credsData.password,
          path
        );
        
        if (!content || content.trim().length === 0) {
          throw new Error("Empty file content on retry");
        }
        
        // Broadcast event via Realtime
        await supabase.channel(`ftp_logs:${siteId}`).send({
          type: 'broadcast',
          event: 'file_accessed',
          payload: { path, errorRetrySuccess: true }
        });
        
        return new Response(
          JSON.stringify({ 
            success: true,
            content,
            errorRetryUsed: true,
            timestamp: Date.now(),
            checksum: await crypto.subtle.digest("SHA-256", new TextEncoder().encode(content))
              .then(hash => Array.from(new Uint8Array(hash))
              .map(b => b.toString(16).padStart(2, "0"))
              .join(""))
          }),
          { headers: corsHeaders, status: 200 }
        );
      } catch (retryError) {
        console.error("[FTP-GET-FILE] Retry also failed:", retryError);
        throw new Error(`Failed after retry: ${retryError.message || retryError}`);
      }
    }
    
  } catch (err) {
    console.error("[getFile] Exception:", err);
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
