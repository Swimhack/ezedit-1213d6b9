
// Netlify serverless function for FTP connection testing
const Client = require('ssh2-sftp-client');

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
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ success: false, message: 'Invalid JSON in request body' })
      };
    }
    
    const { server, port, user, password } = body;

    // Validate required parameters
    if (!server || !user || !password) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ success: false, message: 'Missing required connection details' })
      };
    }

    console.log(`Testing connection to ${server}:${port || 21} with user ${user}`);

    // Create SFTP client
    const client = new Client();

    try {
      // Use async/await with proper error handling
      await client.connect({
        host: server,
        port: port || 21,
        username: user,
        password,
        retries: 1,
        timeout: 10000
      });

      console.log("FTP connection successful");

      // Ensure we explicitly set the Content-Type header to application/json
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ success: true, message: 'Connection successful' })
      };
    } catch (ftpError) {
      console.error("FTP connection error:", ftpError.message);

      // Ensure we explicitly set the Content-Type header to application/json
      return {
        statusCode: 200, // Still return 200 but with success: false
        headers: corsHeaders,
        body: JSON.stringify({ 
          success: false, 
          message: `FTP connection failed: ${ftpError.message}` 
        })
      };
    } finally {
      // Always ensure client is closed properly
      try {
        await client.end();
        console.log("FTP client closed");
      } catch (closeError) {
        console.error("Error closing client:", closeError.message);
      }
    }
  } catch (error) {
    console.error("Error in test-ftp function:", error);

    // Ensure we explicitly set the Content-Type header to application/json
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        success: false, 
        message: `Server error: ${error.message}` 
      })
    };
  }
};
