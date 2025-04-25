
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Client } from "npm:basic-ftp@5.0.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization,x-client-info,apikey,content-type',
  'Content-Type': 'application/json'
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let body = {};
  try { 
    body = await req.json(); 
  } catch {
    return new Response(
      JSON.stringify({ success: false, message: "Bad JSON" }),
      { status: 400, headers: corsHeaders }
    );
  }

  const { host, port = 21, username, password, path } = body;
  if (!host || !username || !password || !path) {
    return new Response(
      JSON.stringify({ success: false, message: "Missing fields" }),
      { status: 400, headers: corsHeaders }
    );
  }

  console.log(`Attempting to download file from FTP: ${username}@${host}:${port}${path}`);
  
  const client = new Client();
  try {
    await client.access({ 
      host, 
      port, 
      user: username, 
      password, 
      secure: false 
    });

    // Create a temporary file for download
    const tempFilePath = await Deno.makeTempFile();
    
    try {
      // Download file to temp location
      await client.downloadTo(tempFilePath, path);
      
      // Read file content
      const bytes = await Deno.readFile(tempFilePath);
      
      // Encode content to base64
      const content = btoa(String.fromCharCode(...bytes));
      
      return new Response(
        JSON.stringify({ success: true, content }),
        { headers: corsHeaders }
      );
    } finally {
      // Clean up temp file
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
});
