
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Client } from "npm:basic-ftp@5.0.4";
import * as SFTP from "npm:ssh2-sftp-client@9.1.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

// Initialize Supabase client for auth checking
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Verify token and get user info
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Check if user has premium tier
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .single();
    
    if (subscriptionError || !subscription || subscription.status !== 'active') {
      return new Response(
        JSON.stringify({ error: "Premium subscription required to save files" }),
        { status: 403, headers: corsHeaders }
      );
    }

    const { host, user: ftpUser, pass, path, content, port = 21, sftp = false, encoding = 'utf-8' } = await req.json();
    
    if (!host || !ftpUser || !pass || !path) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`Saving file ${path} to ${host}${sftp ? " via SFTP" : ""}`);
    
    let contentData;
    
    // Convert content based on encoding
    if (encoding === 'base64') {
      contentData = Uint8Array.from(atob(content), c => c.charCodeAt(0));
    } else {
      contentData = content;
    }
    
    if (sftp) {
      // Use SFTP client
      const sftpClient = new SFTP.default();
      
      try {
        await sftpClient.connect({
          host,
          port: Number(port),
          username: ftpUser,
          password: pass,
        });
        
        // Create parent directories if needed
        const pathParts = path.split('/');
        pathParts.pop(); // Remove filename
        
        if (pathParts.length > 1) {
          const directories = [];
          let currentPath = '';
          
          // Build paths for each directory level
          for (const part of pathParts) {
            if (!part) continue;
            currentPath += '/' + part;
            directories.push(currentPath);
          }
          
          // Create each directory if it doesn't exist
          for (const dir of directories) {
            try {
              const stat = await sftpClient.stat(dir);
              if (!stat || stat.type !== 'd') {
                await sftpClient.mkdir(dir);
              }
            } catch (e) {
              await sftpClient.mkdir(dir);
            }
          }
        }
        
        // Save the file
        if (encoding === 'base64') {
          await sftpClient.put(contentData, path);
        } else {
          await sftpClient.put(Buffer.from(contentData), path);
        }
        
        await sftpClient.end();
      } catch (error) {
        console.error("SFTP error:", error);
        throw error;
      }
    } else {
      // Use FTP client
      const client = new Client();
      client.ftp.verbose = true;
      
      try {
        await client.access({
          host,
          port: Number(port),
          user: ftpUser,
          password: pass,
          secure: false
        });
        
        // Create parent directories if needed
        const pathParts = path.split('/');
        pathParts.pop(); // Remove filename
        
        if (pathParts.length > 1) {
          try {
            // Try to create all directories in the path
            let currentPath = '';
            for (const part of pathParts) {
              if (!part) continue;
              currentPath += '/' + part;
              try {
                await client.ensureDir(currentPath);
              } catch (e) {
                // Ignore errors if directory already exists
              }
            }
          } catch (e) {
            console.warn("Error ensuring directory exists:", e);
          }
        }
        
        // Convert content to a readable stream
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            if (encoding === 'base64') {
              controller.enqueue(contentData);
            } else {
              controller.enqueue(encoder.encode(contentData));
            }
            controller.close();
          }
        });
        
        // Upload file
        await client.uploadFrom(stream, path);
        client.close();
      } catch (error) {
        console.error("FTP error:", error);
        throw error;
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "File saved successfully",
        path: path
      }),
      { headers: corsHeaders }
    );
    
  } catch (error) {
    console.error("Error in saveFtpFile:", error.message);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to save file" 
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
