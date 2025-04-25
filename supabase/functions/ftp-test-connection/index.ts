
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Client } from "npm:basic-ftp@5.0.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Parse JSON body with error handling
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      console.error("Error parsing request JSON:", error);
      return new Response(
        JSON.stringify({ success: false, message: "Invalid JSON in request body" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    const { host, port, username, password } = requestBody;
    
    // Validate required fields
    if (!host || !username || !password) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Missing required fields: host, username, or password" 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    console.log(`Attempting FTP connection to: ${host}:${port || 21}`);
    
    const client = new Client();
    client.ftp.verbose = true;
    
    try {
      await client.access({
        host,
        port: port || 21,
        user: username,
        password,
        secure: false
      });
      
      console.log("FTP connection successful");
      
      return new Response(
        JSON.stringify({ success: true, message: 'Connection successful' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error("FTP connection error:", error.message);
      
      return new Response(
        JSON.stringify({ success: false, message: error.message }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } finally {
      client.close();
    }
  } catch (error) {
    console.error("Unhandled error:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})
