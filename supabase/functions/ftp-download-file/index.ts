
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
    const { site, path } = await req.json();
    
    if (!site || !path) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing site or path parameter" }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!site.host || !site.user || !site.password) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing required site connection details" }),
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`[FTP-DOWNLOAD-FILE] Attempting to download: "${path}" from ${site.host}`);

    const client = new Client();
    client.ftp.verbose = true; // Enable verbose logging
    
    try {
      console.log(`[FTP-DOWNLOAD-FILE] Connecting to ${site.host}:${site.port || 21}`);
      
      await client.access({
        host: site.host,
        port: site.port || 21,
        user: site.user,
        password: site.password,
        secure: site.secure || false
      });
      
      console.log(`[FTP-DOWNLOAD-FILE] Connected successfully. Downloading file: "${path}"`);
      
      // Download file contents to memory
      let content = "";
      const chunks: Uint8Array[] = [];
      
      try {
        await client.downloadTo(
          new WritableStream({
            write(chunk) {
              chunks.push(new Uint8Array(chunk));
            }
          }),
          path
        );
        
        // Concatenate chunks and convert to string
        const allBytes = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
        let offset = 0;
        for (const chunk of chunks) {
          allBytes.set(chunk, offset);
          offset += chunk.length;
        }
        
        content = new TextDecoder().decode(allBytes);
        console.log(`[FTP-DOWNLOAD-FILE] File downloaded successfully: ${path}, size: ${content.length} bytes`);
        
        return new Response(
          JSON.stringify({ 
            success: true,
            content: content,
            size: content.length
          }),
          { headers: corsHeaders }
        );
      } catch (downloadError) {
        console.error(`[FTP-DOWNLOAD-FILE] Error downloading file: ${downloadError.message}`);
        throw downloadError; // Rethrow to be caught by the outer try-catch
      }
    } catch (error) {
      console.error(`[FTP-DOWNLOAD-FILE] Error: ${error.message}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Failed to download file: ${error.message}` 
        }),
        { status: 500, headers: corsHeaders }
      );
    } finally {
      client.close();
      console.log(`[FTP-DOWNLOAD-FILE] FTP connection closed`);
    }
  } catch (error) {
    console.error(`[FTP-DOWNLOAD-FILE] Request processing error: ${error.message}`);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: `Invalid request format: ${error.message}` 
      }),
      { status: 400, headers: corsHeaders }
    );
  }
});
