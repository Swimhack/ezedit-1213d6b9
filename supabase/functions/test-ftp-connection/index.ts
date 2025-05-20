
// Import required modules
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

    console.log(`Testing connection to ${server}:${port || 21} with user ${user}`);
    
    // Create FTP client
    const client = new Client();
    client.ftp.verbose = true;
    
    try {
      // Set a timeout for the connection
      const connectionPromise = new Promise(async (resolve, reject) => {
        try {
          await client.access({
            host: server,
            port: port || 21,
            user,
            password,
            secure: false
          });
          resolve({ success: true });
        } catch (err) {
          reject(err);
        }
      });
      
      // Set a timeout for the connection
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Connection timed out after 10 seconds")), 10000)
      );
      
      // Race the connection against the timeout
      await Promise.race([connectionPromise, timeout]);
      
      // If we reached here, the connection was successful
      await client.close();
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Connection successful" 
        }),
        { headers: corsHeaders }
      );
    } catch (ftpError) {
      console.error("FTP connection error:", ftpError.message);
      
      // Make sure the client is closed
      try {
        client.close();
      } catch (e) {
        console.error("Error closing FTP client:", e.message);
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `FTP connection failed: ${ftpError.message}` 
        }),
        { headers: corsHeaders }
      );
    }
  } catch (error) {
    console.error("Error in test-ftp-connection function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: `Server error: ${error.message}` 
      }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
