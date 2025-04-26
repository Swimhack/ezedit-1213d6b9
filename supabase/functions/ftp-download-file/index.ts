
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

    // Use memory buffer instead of temp file
    const chunks: Uint8Array[] = [];
    
    // Set up a tracker to collect the file data
    await client.downloadTo(new WritableStream({
      write(chunk) {
        chunks.push(chunk);
        return Promise.resolve();
      }
    }), path);
    
    // Combine all chunks
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const fileContent = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      fileContent.set(chunk, offset);
      offset += chunk.length;
    }
    
    // Convert to base64
    const base64Content = btoa(
      new TextDecoder().decode(fileContent)
    );
    
    return new Response(
      JSON.stringify({ success: true, content: base64Content }),
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
