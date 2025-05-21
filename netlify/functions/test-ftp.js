
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
      // Connect with basic settings first
      await client.access({
        host: server,
        port: port || 21,
        user: user,
        password: password || '',
        secure: false,
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
      // Always ensure connection is closed
      try {
        await client.close();
      } catch (closeError) {
        console.error("Error closing client:", closeError);
      }
      
      console.error("FTP connection error:", ftpError.message);
      
      // Improve user-friendly error messages
      let errorMessage = ftpError.message;
      let helpfulMessage = null;
      
      if (errorMessage.includes('530')) {
        errorMessage = "530 Login authentication failed.";
        helpfulMessage = "Login failed. Double-check your FTP username and password. You may need to contact your hosting provider.";
      } else if (errorMessage.includes('timeout')) {
        errorMessage = "Connection timed out. The server may be down or unreachable.";
        helpfulMessage = "The server is not responding. Please check if the server is online and accessible, or if there are any network restrictions.";
      } else if (errorMessage.includes('ENOTFOUND')) {
        errorMessage = "Server hostname not found. Please check your server address.";
        helpfulMessage = "The server address could not be resolved. Please verify the hostname is correct and your DNS is working properly.";
      } else if (errorMessage.includes('ECONNREFUSED')) {
        errorMessage = "Connection refused. Please verify the server address and port.";
        helpfulMessage = "The server actively refused the connection. This usually means the FTP service is not running or the port is incorrect.";
      }
      
      return {
        statusCode: 200, // Return 200 for client-side error handling
        headers: corsHeaders,
        body: JSON.stringify({ 
          success: false, 
          message: errorMessage,
          helpfulMessage: helpfulMessage,
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
        message: `Error: ${error.message}`,
        helpfulMessage: "An unexpected error occurred while communicating with the FTP server. Please try again later."
      })
    };
  }
};
