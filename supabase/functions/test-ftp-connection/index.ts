
// Import required modules
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { connect } from "https://deno.land/x/ftpc/mod.ts";
import { supabase as adminClient } from "../_shared/supabaseClient.ts";

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
    // Verify JWT token from Authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Missing authorization header" 
        }),
        { headers: corsHeaders, status: 401 }
      );
    }

    // Extract and verify the JWT token
    const token = authHeader.replace('Bearer ', '');
    try {
      // Verify the JWT token using admin client
      const { data: { user }, error: authError } = await adminClient.auth.getUser(token);
      
      if (authError || !user) {
        console.error("JWT verification failed:", authError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: "Invalid authorization token" 
          }),
          { headers: corsHeaders, status: 401 }
        );
      }
      
      console.log("Authenticated user:", user.id);
    } catch (authError) {
      console.error("Error verifying JWT:", authError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Invalid or expired JWT token" 
        }),
        { headers: corsHeaders, status: 401 }
      );
    }

    const { server, port, user, password } = await req.json();
    
    if (!server || !user || !password) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing required connection details" }),
        { headers: corsHeaders, status: 400 }
      );
    }

    console.log(`Testing connection to ${server}:${port || 21} with user ${user}`);
    
    try {
      // Use Deno's FTP client to test connection
      const client = await connect({
        host: server,
        port: port || 21,
        user: user,
        password: password,
        secure: false,
      });
      
      // Test connection with a basic ls command
      await client.list();
      
      // Close the connection properly
      await client.close();
      
      console.log("FTP connection successful");
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Connection successful" 
        }),
        { headers: corsHeaders }
      );
    } catch (ftpError) {
      console.error("FTP connection error:", ftpError.message);
      
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
