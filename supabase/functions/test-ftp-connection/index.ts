
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
    const { server, port, user, password } = await req.json();
    
    if (!server || !user || !password) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing required connection details" }),
        { headers: corsHeaders, status: 400 }
      );
    }

    // Create an FTP client
    const client = new Client();
    client.ftp.verbose = false; // Set to true for debugging
    
    try {
      // Set connection timeout to 10 seconds
      await client.access({
        host: server,
        port: port || 21,
        user,
        password,
        secure: false,
        secureOptions: { rejectUnauthorized: false }
      });
      
      // If we made it here, connection was successful
      await client.close();
      
      return new Response(
        JSON.stringify({ success: true, message: "Connection successful" }),
        { headers: corsHeaders, status: 200 }
      );
    } catch (ftpError: any) {
      console.error("[test-ftp-connection] FTP error:", ftpError);
      await client.close();
      
      return new Response(
        JSON.stringify({ success: false, message: `FTP connection error: ${ftpError.message}` }),
        { headers: corsHeaders, status: 200 } // Send 200 even for failed connections
      );
    }
  } catch (err: any) {
    console.error("[test-ftp-connection] Error:", err);
    
    return new Response(
      JSON.stringify({ success: false, message: `Server error: ${err.message}` }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
