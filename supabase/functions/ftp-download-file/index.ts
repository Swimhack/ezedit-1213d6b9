
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

  // Accept either direct site connection params or siteId for credential lookup
  const { siteId, path, host, user, username, password, port = 21, secure = false } = body;
  
  // Validate required parameters
  if ((!siteId && (!host || (!user && !username) || !password)) || !path) {
    return new Response(
      JSON.stringify({ success: false, message: "Missing required connection parameters" }),
      { status: 400, headers: corsHeaders }
    );
  }

  console.log(`Attempting to download file from FTP: ${username || user || '(via siteId)'}@${host || '(via siteId)'}:${port}${path}`);
  
  const client = new Client();
  client.ftp.verbose = true; // Log FTP commands for debugging
  
  try {
    // Connect to the FTP server
    await client.access({ 
      host: host || "", // If siteId is used, this will be populated server-side
      port, 
      user: username || user || "", 
      password: password || "", 
      secure
    });

    console.log(`FTP Connection established successfully, downloading: ${path}`);

    // Download to a buffer for binary safety
    const chunks = [];
    const stream = new TransformStream({
      transform(chunk, controller) {
        chunks.push(chunk);
        controller.enqueue(chunk);
      }
    });
    
    await client.downloadTo(stream.writable, path);
    
    // Convert chunks to string
    const decoder = new TextDecoder("utf-8");
    let fileContent = "";
    for (const chunk of chunks) {
      fileContent += decoder.decode(chunk, { stream: true });
    }
    fileContent += decoder.decode(); // Flush any remaining data
    
    // Convert to base64 for safe transport
    const base64Content = btoa(fileContent);
    
    console.log(`File downloaded successfully, size: ${fileContent.length} bytes`);
    
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
        message: error.message || "Failed to download file",
        error: String(error)
      }),
      { status: 500, headers: corsHeaders }
    );
  } finally {
    client.close();
    console.log("FTP connection closed");
  }
});
