
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
    client.ftp.verbose = true; // For debugging, can be turned off in production
    
    try {
      // Use async/await with proper error handling instead of event emitters
      await client.access({
        host: server,
        port: port || 21,
        user,
        password,
        secure: false
      });
      
      console.log("FTP connection successful");
      
      // Close the connection properly
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
      
      // Ensure client is closed on error
      try {
        await client.close();
      } catch (closeError) {
        console.error("Error closing client:", closeError.message);
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
