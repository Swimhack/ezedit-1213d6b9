
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
      JSON.stringify({ success: false, message: "Missing required fields" }),
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

    // Download to a string buffer
    let fileContent = "";
    
    // Use a different approach that works with Deno
    const chunks = [];
    const stream = new TransformStream({
      transform(chunk, controller) {
        chunks.push(chunk);
        controller.enqueue(chunk);
      }
    });
    
    await client.downloadTo(stream.writable, path);
    
    // Convert chunks to string
    const decoder = new TextDecoder();
    for (const chunk of chunks) {
      fileContent += decoder.decode(chunk, { stream: true });
    }
    fileContent += decoder.decode(); // Flush any remaining data
    
    // Convert to base64 for safe transport
    const base64Content = btoa(fileContent);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        content: base64Content 
      }),
      { headers: corsHeaders }
    );
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
