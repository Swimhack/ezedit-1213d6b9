
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Client } from "npm:basic-ftp@5.0.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
};

const MAX_FILE_SIZE = 1024 * 1024; // 1MB

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { host, port = 21, username, password, path } = await req.json();

    if (!host || !username || !password || !path) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Missing required fields" 
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`Attempting to download file from FTP: ${username}@${host}:${port}${path}`);

    const client = new Client();
    let content = '';

    try {
      await client.access({
        host,
        port,
        user: username,
        password,
        secure: false
      });

      // Check file size first
      const size = await client.size(path);
      if (size > MAX_FILE_SIZE) {
        throw new Error("File exceeds maximum size limit of 1MB");
      }

      // Create a temporary file to store the download
      const tempFilePath = await Deno.makeTempFile();
      
      try {
        // Download the file to the temporary location
        await client.downloadTo(tempFilePath, path);
        
        // Read the file content
        const fileContent = await Deno.readTextFile(tempFilePath);
        
        // Encode the content to base64
        content = btoa(fileContent);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            content 
          }),
          { headers: corsHeaders }
        );
      } finally {
        // Clean up the temporary file
        try {
          await Deno.remove(tempFilePath);
        } catch (cleanupError) {
          console.error('Error removing temp file:', cleanupError);
        }
      }
    } catch (error) {
      console.error('FTP download error:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: error.message || "Failed to download file" 
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
