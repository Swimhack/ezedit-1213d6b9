
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Client } from "npm:basic-ftp@5.0.4";
import * as SFTP from "npm:ssh2-sftp-client@9.1.0";
import { getFtpCreds } from "../_shared/creds.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Handle connection via connectionId
    if (body.connectionId) {
      const connectionId = body.connectionId;
      const path = body.path || "/";
      
      const creds = await getFtpCreds(connectionId);
      if (!creds) {
        return new Response(
          JSON.stringify({ success: false, message: "Invalid connection ID" }),
          { status: 400, headers: corsHeaders }
        );
      }
      
      console.log(`Listing directory ${path} on ${creds.host}`);
      
      const client = new Client();
      client.ftp.verbose = true;
      
      try {
        await client.access({
          host: creds.host,
          port: Number(creds.port),
          user: creds.user,
          password: creds.password,
          secure: false
        });
        
        const listing = await client.list(path);
        
        const files = listing.map(item => ({
          name: item.name,
          type: item.isDirectory ? 'directory' : 'file',
          size: item.size,
          modified: item.date || null,
          path: `${path === '/' ? '' : path}/${item.name}`.replace(/\/\//g, '/'),
          isDirectory: item.isDirectory
        }));
        
        client.close();
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            files: files,
            directory: path
          }),
          { headers: corsHeaders }
        );
      } catch (error) {
        console.error("FTP error:", error);
        if (client) client.close();
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: error.message || "Failed to list files" 
          }),
          { status: 500, headers: corsHeaders }
        );
      }
    }
    
    // Handle direct connection parameters
    const { host, user, pass, dir = "/", port = 21, sftp = false } = body;
    
    if (!host || !user || !pass) {
      return new Response(
        JSON.stringify({ error: "Missing required connection parameters" }),
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`Listing directory ${dir} on ${host}${sftp ? " via SFTP" : ""}`);
    
    let files = [];
    
    if (sftp) {
      // Use SFTP client
      const sftpClient = new SFTP.default();
      
      try {
        await sftpClient.connect({
          host,
          port: Number(port),
          username: user,
          password: pass,
        });
        
        const listing = await sftpClient.list(dir);
        
        files = listing.map(item => ({
          name: item.name,
          type: item.type === 'd' ? 'directory' : 'file',
          size: item.size,
          modified: item.modifyTime || null,
          path: `${dir === '/' ? '' : dir}/${item.name}`.replace(/\/\//g, '/'),
          isDirectory: item.type === 'd'
        }));
        
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
          user,
          password: pass,
          secure: false
        });
        
        const listing = await client.list(dir);
        
        files = listing.map(item => ({
          name: item.name,
          type: item.isDirectory ? 'directory' : 'file',
          size: item.size,
          modified: item.date || null,
          path: `${dir === '/' ? '' : dir}/${item.name}`.replace(/\/\//g, '/'),
          isDirectory: item.isDirectory
        }));
        
        client.close();
      } catch (error) {
        console.error("FTP error:", error);
        throw error;
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        files: files,
        directory: dir
      }),
      { headers: corsHeaders }
    );
    
  } catch (error) {
    console.error("Error in listFtpFiles:", error.message);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to list files" 
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
