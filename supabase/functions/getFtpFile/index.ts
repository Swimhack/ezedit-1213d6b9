
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Client } from "npm:basic-ftp@5.0.4";
import * as SFTP from "npm:ssh2-sftp-client@9.1.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

// Helper function to detect if a file is binary
function isBinaryFile(buffer: Uint8Array): boolean {
  // Check for null bytes which are common in binary files
  for (let i = 0; i < Math.min(buffer.length, 1024); i++) {
    if (buffer[i] === 0) return true;
  }
  
  // Check for non-text characters
  const nonTextChars = buffer.filter(byte => (byte < 32 || byte > 127) && ![9, 10, 13].includes(byte));
  const ratio = nonTextChars.length / Math.min(buffer.length, 1024);
  
  return ratio > 0.3; // If more than 30% are non-text, consider it binary
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { host, user, pass, path, port = 21, sftp = false } = await req.json();
    
    if (!host || !user || !pass || !path) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`Fetching file ${path} from ${host}${sftp ? " via SFTP" : ""}`);
    
    let fileData;
    let isBinary = false;
    
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
        
        // Get file as buffer
        const buffer = await sftpClient.get(path);
        
        // Detect if binary and convert accordingly
        if (buffer instanceof Uint8Array) {
          isBinary = isBinaryFile(buffer);
          if (isBinary) {
            fileData = btoa(String.fromCharCode(...new Uint8Array(buffer)));
          } else {
            fileData = new TextDecoder().decode(buffer);
          }
        } else {
          fileData = buffer.toString();
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
          user,
          password: pass,
          secure: false
        });
        
        // Create a writable stream
        const chunks: Uint8Array[] = [];
        const writable = new WritableStream({
          write(chunk) {
            chunks.push(chunk);
          }
        });
        
        // Download file to the stream
        await client.downloadTo(writable, path);
        
        // Convert chunks to a single buffer
        const buffer = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
        let offset = 0;
        for (const chunk of chunks) {
          buffer.set(chunk, offset);
          offset += chunk.length;
        }
        
        // Detect if binary and convert accordingly
        isBinary = isBinaryFile(buffer);
        if (isBinary) {
          fileData = btoa(String.fromCharCode(...buffer));
        } else {
          fileData = new TextDecoder().decode(buffer);
        }
        
        client.close();
      } catch (error) {
        console.error("FTP error:", error);
        throw error;
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        content: fileData,
        isBinary: isBinary,
        encoding: isBinary ? 'base64' : 'utf-8',
        path: path
      }),
      { headers: corsHeaders }
    );
    
  } catch (error) {
    console.error("Error in getFtpFile:", error.message);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to get file" 
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});
