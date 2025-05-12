
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Client } from "npm:basic-ftp@5.0.4";
import { getFtpCreds } from "../_shared/creds.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { connectionId, filePath } = await req.json();
    
    if (!connectionId || !filePath) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing connectionId or filePath" }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    console.log(`[getFtpFile] Getting file: ${filePath} for connection: ${connectionId}`);
    
    // Get FTP credentials
    const creds = await getFtpCreds(connectionId);
    if (!creds) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid connection ID" }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    // Create a temporary file to store the downloaded content
    const tempFile = await Deno.makeTempFile();
    
    try {
      // Create FTP client
      const client = new Client();
      client.ftp.verbose = true;
      
      try {
        await client.access({
          host: creds.host,
          user: creds.user,
          password: creds.password,
          port: creds.port || 21,
          secure: false
        });
        
        console.log(`[getFtpFile] Connected to FTP server. Downloading file: "${filePath}"`);
        
        // Download the file to a temporary location
        await client.downloadTo(tempFile, filePath);
        
        // Read the file content
        const content = await Deno.readTextFile(tempFile);
        
        console.log(`[getFtpFile] File downloaded successfully. Content length: ${content.length} bytes`);
        
        // Close the FTP connection
        client.close();
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            content: content
          }),
          { headers: corsHeaders }
        );
      } catch (error) {
        console.error("[getFtpFile] FTP error:", error);
        if (client) client.close();
        return new Response(
          JSON.stringify({ success: false, message: error.message || "Failed to get file" }),
          { status: 500, headers: corsHeaders }
        );
      }
    } catch (error) {
      console.error("[getFtpFile] Error:", error);
      return new Response(
        JSON.stringify({ success: false, message: error.message || "Failed to process file" }),
        { status: 500, headers: corsHeaders }
      );
    } finally {
      // Clean up the temporary file
      try {
        await Deno.remove(tempFile);
      } catch (e) {
        console.error("[getFtpFile] Error removing temporary file:", e);
      }
    }
  } catch (error) {
    console.error("[getFtpFile] Request processing error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Invalid request" }),
      { status: 400, headers: corsHeaders }
    );
  }
});
