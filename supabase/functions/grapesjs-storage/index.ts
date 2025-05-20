
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { Client } from "npm:basic-ftp@5.0.4";

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Create a Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to get FTP credentials
async function getFtpCreds(siteId: string) {
  console.log(`[getFtpCreds] Fetching credentials for siteId: ${siteId}`);
  
  try {
    const { data: site, error } = await supabase
      .from('ftp_credentials')
      .select('*')
      .eq('id', siteId)
      .single();
      
    if (error) {
      console.error("[getFtpCreds] Error fetching credentials:", error);
      throw error;
    }
    
    if (!site) {
      console.error("[getFtpCreds] No site found with ID:", siteId);
      throw new Error("Site not found");
    }
    
    console.log(`[getFtpCreds] Successfully retrieved credentials for host: ${site.server_url}`);
    
    // Return credentials in the format expected by FTP client
    return {
      host: site.server_url,
      port: site.port || 21,
      user: site.username,
      password: site.encrypted_password, // In production, this should be decrypted if necessary
      secure: false // Default to non-secure FTP
    };
  } catch (error) {
    console.error("[getFtpCreds] Error:", error);
    throw error;
  }
}

Deno.serve(async (req) => {
  console.log(`[GrapesJS Storage] Received ${req.method} request to ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  
  try {
    const body = await req.json();
    const { operation, filename, connectionId, html, css } = body;
    
    console.log(`[GrapesJS Storage] Operation: ${operation}, File: ${filename || 'unnamed'}`);
    
    if (!connectionId) {
      console.error("[GrapesJS Storage] Missing connectionId");
      return new Response(
        JSON.stringify({ success: false, message: "Missing connectionId" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Handle different operations
    if (operation === 'load') {
      return await handleLoad(connectionId, filename);
    } else if (operation === 'save') {
      return await handleSave(connectionId, filename, html, css);
    } else {
      console.error(`[GrapesJS Storage] Unknown operation: ${operation}`);
      return new Response(
        JSON.stringify({ success: false, message: "Unknown operation" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
  } catch (err) {
    console.error("[GrapesJS Storage] Error processing request:", err);
    return new Response(
      JSON.stringify({ success: false, message: err.message || "Unknown error" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Handler for loading files from FTP
async function handleLoad(connectionId: string, filePath: string) {
  if (!filePath) {
    console.error("[GrapesJS Storage:Load] Missing filePath");
    return new Response(
      JSON.stringify({ html: '', css: '' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
  
  try {
    console.log(`[GrapesJS Storage:Load] Loading file: ${filePath} for connection: ${connectionId}`);
    
    // Get FTP credentials
    const creds = await getFtpCreds(connectionId);
    
    // Create FTP client
    const client = new Client();
    client.ftp.verbose = true;
    
    try {
      await client.access({
        host: creds.host,
        user: creds.user,
        password: creds.password,
        port: creds.port,
        secure: creds.secure
      });
      
      console.log(`[GrapesJS Storage:Load] Connected to FTP server. Downloading file: "${filePath}"`);
      
      // Create a temporary file to store the downloaded content
      const tempFile = await Deno.makeTempFile();
      
      try {
        // Download the file
        await client.downloadTo(tempFile, filePath);
        
        // Read the file content
        const content = await Deno.readTextFile(tempFile);
        
        console.log(`[GrapesJS Storage:Load] File downloaded successfully. Content length: ${content.length} bytes`);
        
        // Close the FTP connection
        client.close();
        
        // Return the content in GrapesJS format
        return new Response(
          JSON.stringify({ 
            html: content, 
            css: '' // CSS is typically embedded in HTML for most websites
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      } finally {
        // Clean up the temporary file
        try {
          await Deno.remove(tempFile);
        } catch (e) {
          console.error("[GrapesJS Storage:Load] Error removing temporary file:", e);
        }
      }
    } catch (ftpError) {
      console.error("[GrapesJS Storage:Load] FTP error:", ftpError);
      if (client) client.close();
      throw ftpError;
    }
  } catch (error) {
    console.error("[GrapesJS Storage:Load] Error:", error);
    return new Response(
      JSON.stringify({ 
        html: '', 
        css: '',
        error: error.message || "Unknown error"
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 } // Return 200 to avoid GrapesJS errors
    );
  }
}

// Handler for saving files to FTP
async function handleSave(connectionId: string, filePath: string, html: string, css: string) {
  if (!filePath || html === undefined) {
    console.error("[GrapesJS Storage:Save] Missing filePath or content");
    return new Response(
      JSON.stringify({ success: false, message: "Missing filePath or content" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
  
  try {
    console.log(`[GrapesJS Storage:Save] Saving file: ${filePath} for connection: ${connectionId}`);
    
    // Get FTP credentials
    const creds = await getFtpCreds(connectionId);
    
    // Create a temporary file to store the content
    const tempFile = await Deno.makeTempFile();
    
    try {
      // Write the content to the temporary file
      await Deno.writeTextFile(tempFile, html);
      
      // Create FTP client
      const client = new Client();
      client.ftp.verbose = true;
      
      try {
        await client.access({
          host: creds.host,
          user: creds.user,
          password: creds.password,
          port: creds.port,
          secure: creds.secure
        });
        
        console.log(`[GrapesJS Storage:Save] Connected to FTP server. Uploading file: "${filePath}"`);
        
        // Upload the file
        await client.uploadFrom(tempFile, filePath);
        
        console.log(`[GrapesJS Storage:Save] File uploaded successfully.`);
        
        // Close the FTP connection
        client.close();
        
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      } catch (ftpError) {
        console.error("[GrapesJS Storage:Save] FTP error:", ftpError);
        if (client) client.close();
        throw ftpError;
      }
    } finally {
      // Clean up the temporary file
      try {
        await Deno.remove(tempFile);
      } catch (e) {
        console.error("[GrapesJS Storage:Save] Error removing temporary file:", e);
      }
    }
  } catch (error) {
    console.error("[GrapesJS Storage:Save] Error:", error);
    return new Response(
      JSON.stringify({ success: false, message: error.message || "Unknown error" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}
