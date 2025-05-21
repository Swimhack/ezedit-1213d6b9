
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Client } from "npm:basic-ftp@5.0.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse JSON body with error handling
    let requestBody;
    try {
      requestBody = await req.json();
      console.log("Request body received:", JSON.stringify(requestBody));
    } catch (error) {
      console.error("Error parsing request JSON:", error);
      return new Response(
        JSON.stringify({ success: false, message: "Invalid JSON in request body" }),
        { headers: corsHeaders }
      );
    }
    
    // Extract credentials - support multiple parameter name formats for compatibility
    const host = requestBody.host || requestBody.server || requestBody.server_url;
    const port = Number(requestBody.port) || 21;
    const username = requestBody.username || requestBody.user;
    const password = requestBody.password || requestBody.encrypted_password || '';
    const directory = requestBody.directory || requestBody.root_directory || '/';
    
    // Validate required fields
    if (!host || !username) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Missing required fields: host or username",
          helpfulMessage: "Please provide both the server address and username to test the connection."
        }),
        { headers: corsHeaders }
      );
    }
    
    console.log(`Attempting FTP connection to: ${host}:${port} as ${username}`);
    
    const client = new Client();
    client.ftp.verbose = true;
    
    try {
      // Connect with exact parameters as specified for compatibility
      await client.access({
        host,
        port,
        user: username,
        password,
        secure: false
      });
      
      // Try to change directory if needed
      if (directory && directory !== '/') {
        try {
          await client.cd(directory);
          console.log(`Successfully changed to directory: ${directory}`);
        } catch (dirError) {
          console.warn(`Warning: Could not change to directory ${directory}: ${dirError.message}`);
          // Continue anyway - don't fail just because directory doesn't exist
        }
      }
      
      // Test a simple list command to verify full connectivity
      try {
        await client.list();
        console.log("Directory listing successful");
      } catch (listError) {
        console.warn(`Warning: Directory listing failed: ${listError.message}`);
        // Continue anyway - connection was established even if listing failed
      }
      
      console.log("FTP connection successful");
      
      // Close connection after successful test
      await client.close();
      
      return new Response(
        JSON.stringify({ success: true, message: 'Connection successful' }),
        { headers: corsHeaders }
      );
    } catch (error) {
      // Always ensure connection is closed
      try {
        await client.close();
      } catch (closeError) {
        console.error("Error closing client:", closeError);
      }
      
      console.error("FTP connection error:", error.message);
      
      // Improve user-friendly error messages
      let errorMessage = error.message;
      let helpfulMessage = null;
      
      if (error.message.includes("530")) {
        errorMessage = "530 Login authentication failed.";
        helpfulMessage = "Login failed. Double-check your FTP username and password. You may need to contact your hosting provider.";
        console.log("Authentication error detected. Full error:", error.message);
      } else if (error.message.includes("connection timeout") || error.message.includes("ETIMEDOUT")) {
        errorMessage = "Connection timed out. The server may be down or unreachable.";
        helpfulMessage = "The server is not responding. Please check if the server is online and accessible, or if there are any network restrictions.";
      } else if (error.message.includes("ENOTFOUND")) {
        errorMessage = "Server hostname not found. Please check your server address.";
        helpfulMessage = "The server address could not be resolved. Please verify the hostname is correct and your DNS is working properly.";
      } else if (error.message.includes("ECONNREFUSED")) {
        errorMessage = "Connection refused. Please verify the server address and port.";
        helpfulMessage = "The server actively refused the connection. This usually means the FTP service is not running or the port is incorrect.";
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: errorMessage,
          helpfulMessage: helpfulMessage,
          originalError: error.message // Include original error for debugging
        }),
        { headers: corsHeaders }
      );
    }
  } catch (error) {
    console.error("Unhandled error:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message || "An unexpected error occurred",
        helpfulMessage: "An unexpected error occurred while communicating with the FTP server. Please try again later."
      }),
      { headers: corsHeaders }
    );
  }
})
