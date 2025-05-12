
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
    const { connectionId, filePath, content } = await req.json();
    
    if (!connectionId || !filePath || typeof content !== 'string') {
      return new Response(
        JSON.stringify({ success: false, message: "Missing or invalid parameters" }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    console.log(`[saveFtpFile] Saving file: ${filePath} for connection: ${connectionId}`);
    
    // Get FTP credentials
    const creds = await getFtpCreds(connectionId);
    if (!creds) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid connection ID" }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    // Create a temporary file to store the content
    const tempFile = await Deno.makeTempFile();
    
    try {
      // Write content to the temporary file
      await Deno.writeTextFile(tempFile, content);
      
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
        
        console.log(`[saveFtpFile] Connected to FTP server. Uploading file: "${filePath}"`);
        
        // Upload the file
        await client.uploadFrom(tempFile, filePath);
        
        console.log(`[saveFtpFile] File uploaded successfully.`);
        
        // Close the FTP connection
        client.close();
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "File saved successfully"
          }),
          { headers: corsHeaders }
        );
      } catch (error) {
        console.error("[saveFtpFile] FTP error:", error);
        if (client) client.close();
        return new Response(
          JSON.stringify({ success: false, message: error.message || "Failed to save file" }),
          { status: 500, headers: corsHeaders }
        );
      }
    } catch (error) {
      console.error("[saveFtpFile] Error:", error);
      return new Response(
        JSON.stringify({ success: false, message: error.message || "Failed to process file" }),
        { status: 500, headers: corsHeaders }
      );
    } finally {
      // Clean up the temporary file
      try {
        await Deno.remove(tempFile);
      } catch (e) {
        console.error("[saveFtpFile] Error removing temporary file:", e);
      }
    }
  } catch (error) {
    console.error("[saveFtpFile] Request processing error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Invalid request" }),
      { status: 400, headers: corsHeaders }
    );
  }
});
