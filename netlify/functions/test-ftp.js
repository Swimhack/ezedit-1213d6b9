
// Netlify serverless function for FTP connection testing
const { Client } = require('basic-ftp');

exports.handler = async function(event, context) {
  // Set CORS headers for browser compatibility
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: ''
    };
  }

  // Only allow POST method
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    };
  }

  try {
    // Parse the request body
    let body;
    try {
      body = JSON.parse(event.body);
      console.log("Request body received:", JSON.stringify(body));
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return {
        statusCode: 200, // Return 200 to avoid CORS issues
        headers: corsHeaders,
        body: JSON.stringify({ success: false, message: 'Invalid JSON in request body' })
      };
    }
    
    const { server, port, user, password, directory } = body;

    // Validate required parameters
    if (!server || !user) {
      return {
        statusCode: 200, // Return 200 to avoid CORS issues
        headers: corsHeaders,
        body: JSON.stringify({ success: false, message: 'Missing required connection details' })
      };
    }

    console.log(`Testing connection to ${server}:${port || 21} with user ${user}`);

    // Create FTP client
    const client = new Client();
    client.ftp.verbose = true;
    
    try {
      // Connect with legacy compatibility options
      await client.access({
        host: server,
        port: port || 21,
        user: user,
        password: password || '',
        secure: false,
        // Legacy compatibility options
        connTimeout: 30000,      // Longer timeout for slow connections
        pasvTimeout: 30000,
        forcePasv: true,         // Force passive mode for compatibility
      });

      // Try to change directory if specified
      if (directory) {
        try {
          await client.cd(directory);
          console.log(`Successfully changed to directory: ${directory}`);
        } catch (dirError) {
          console.warn(`Warning: Could not change to directory ${directory}: ${dirError.message}`);
          // Continue anyway - don't fail the connection test just because directory doesn't exist
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
      
      // Test complete - close connection
      await client.close();
      console.log("FTP connection successful");
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ 
          success: true, 
          message: 'Connection successful' 
        })
      };
    } catch (ftpError) {
      await client.close().catch(e => console.error("Error closing client:", e));
      console.error("FTP connection error:", ftpError.message);
      
      // Format error message for better user feedback
      let errorMessage = ftpError.message;
      if (errorMessage.includes('530')) {
        errorMessage = "530 Login authentication failed. Please verify your username and password.";
        console.log("Authentication error detected. Full error:", ftpError.message);
      } else if (errorMessage.includes('timeout')) {
        errorMessage = "Connection timed out. The server may be down or unreachable.";
      } else if (errorMessage.includes('ENOTFOUND')) {
        errorMessage = "Server hostname not found. Please check your server address.";
      } else if (errorMessage.includes('ECONNREFUSED')) {
        errorMessage = "Connection refused. Please verify the server address and port.";
      }
      
      return {
        statusCode: 200, // Return 200 for client-side error handling
        headers: corsHeaders,
        body: JSON.stringify({ 
          success: false, 
          message: errorMessage,
          originalError: ftpError.message // Include original error for debugging
        })
      };
    }
  } catch (error) {
    console.error("General error:", error);
    
    return {
      statusCode: 200, // Use 200 status with error flag for cleaner client handling
      headers: corsHeaders,
      body: JSON.stringify({ 
        success: false, 
        message: `Error: ${error.message}` 
      })
    };
  }
};
