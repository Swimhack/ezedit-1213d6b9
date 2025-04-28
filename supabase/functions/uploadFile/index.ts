
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Client } from "https://esm.sh/basic-ftp@5.0.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", 
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json"
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Handle multipart form data
    const formData = await req.formData();
    const id = formData.get("id")?.toString();
    const path = formData.get("path")?.toString() || "/";
    const file = formData.get("file") as File;
    
    if (!id || !file) {
      return new Response(
        JSON.stringify({ error: "Connection ID and file are required" }),
        { headers: corsHeaders, status: 400 }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    
    // Get credentials
    const { data: credsData, error: credsError } = await supabase.functions.invoke("getFtpCreds", { 
      body: { id } 
    });

    if (credsError) {
      console.error("[uploadFile] Credentials error:", credsError);
      return new Response(
        JSON.stringify({ error: credsError }),
        { headers: corsHeaders, status: 400 }
      );
    }
    
    // Connect to FTP and upload file
    const client = new Client();
    try {
      await client.access({
        host: credsData.host,
        port: credsData.port,
        user: credsData.user,
        password: credsData.password,
        secure: false
      });
      
      const fileBuffer = new Uint8Array(await file.arrayBuffer());
      const filePath = path.endsWith("/") ? path + file.name : path + "/" + file.name;
      
      await client.uploadFrom(
        new ReadableStream({
          start(controller) {
            controller.enqueue(fileBuffer);
            controller.close();
          }
        }),
        filePath
      );
      
      // Update file record
      await supabase.from("ftp_files").upsert({
        connection_id: id,
        path: filePath,
        size: file.size,
        last_modified: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      // Broadcast event via Realtime
      await supabase.channel(`ftp_logs:${id}`).send({
        type: 'broadcast',
        event: 'file_uploaded',
        payload: { filepath: filePath, size: file.size }
      });
      
      return new Response(
        JSON.stringify({ success: true, filepath: filePath }),
        { headers: corsHeaders, status: 200 }
      );
    } finally {
      client.close();
    }
  } catch (err) {
    console.error("[uploadFile] Exception:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
