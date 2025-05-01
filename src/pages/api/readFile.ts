
import { supabase } from "@/integrations/supabase/client";

/**
 * API endpoint to read a file from FTP
 * Supports both GET (legacy) and POST (recommended) methods
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const path = url.searchParams.get('path');
    
    if (!path) {
      return new Response("Path parameter is required", { status: 400 });
    }
    
    // Split the path to get connectionId and filepath
    const [connectionId, ...pathParts] = path.split(':');
    const filepath = pathParts.join(':');
    
    console.log(`[API readFile GET] Reading file: ${filepath} for connection: ${connectionId}`);
    
    // Use AbortController to implement timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timed out after 30 seconds")), 30000);
    });
    
    try {
      // Call the Edge Function to get the file
      const fetchPromise = supabase.functions.invoke("ftp-get-file", {
        body: { id: connectionId, filepath }
      });
      
      // Race between fetch and timeout
      const { data, error } = await Promise.race([
        fetchPromise,
        timeoutPromise.then(() => {
          throw new Error("Request timed out after 30 seconds");
        })
      ]) as any;
      
      if (error) {
        console.error("[API readFile GET] Edge Function error:", error);
        return new Response(
          `Live server connection failed. Please retry Refresh Files or check your Site settings. (${error.message})`, 
          { status: 500 }
        );
      }
      
      if (!data || !data.content) {
        return new Response("File not found or empty", { status: 404 });
      }
      
      return new Response(data.content, {
        status: 200,
        headers: { "Content-Type": "text/plain" }
      });
    } catch (err: any) {
      if (err.message === "Request timed out after 30 seconds") {
        console.error("[API readFile GET] Request timed out after 30 seconds");
        return new Response("Request timed out after 30 seconds", { status: 408 });
      }
      
      console.error("[API readFile GET] Error fetching file:", err);
      return new Response(
        `Live server connection failed. Please retry Refresh Files or check your Site settings. (${err.message})`, 
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error("[API readFile GET] Unexpected error:", err);
    return new Response(err.message || "Unknown error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { path, site } = await req.json();
    
    if (!path) {
      return new Response(JSON.stringify({ error: "Path parameter is required" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    if (!site || !site.host || !site.user || !site.password) {
      return new Response(JSON.stringify({ error: "Valid site connection details are required" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    console.log(`[API readFile POST] Reading file: ${path} from host: ${site.host}`);
    
    // Use Promise with timeout instead of AbortController
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timed out after 30 seconds")), 30000);
    });
    
    try {
      // Call the Edge Function with direct connection details
      const fetchPromise = supabase.functions.invoke("ftp-download-file", {
        body: { 
          site: {
            host: site.host,
            user: site.user, 
            password: site.password,
            port: site.port || 21,
            secure: site.secure || false
          },
          path 
        }
      });
      
      // Race between fetch and timeout
      const { data, error } = await Promise.race([
        fetchPromise,
        timeoutPromise.then(() => {
          throw new Error("Request timed out after 30 seconds");
        })
      ]) as any;
      
      if (error) {
        console.error("[API readFile POST] Edge Function error:", error);
        return new Response(
          JSON.stringify({ error: `Live server connection failed. Please retry or check your Site settings. (${error.message})` }), 
          { 
            status: 500,
            headers: { "Content-Type": "application/json" } 
          }
        );
      }
      
      if (!data || !data.content) {
        return new Response(
          JSON.stringify({ error: "File not found or empty" }), 
          { 
            status: 404,
            headers: { "Content-Type": "application/json" } 
          }
        );
      }
      
      // Return file content directly
      return new Response(data.content, {
        status: 200,
        headers: { "Content-Type": "text/plain" }
      });
    } catch (err: any) {
      if (err.message === "Request timed out after 30 seconds") {
        console.error("[API readFile POST] Request timed out after 30 seconds");
        return new Response(
          JSON.stringify({ error: "Request timed out after 30 seconds" }), 
          { 
            status: 408,
            headers: { "Content-Type": "application/json" } 
          }
        );
      }
      
      console.error("[API readFile POST] Error fetching file:", err);
      return new Response(
        JSON.stringify({ error: `Live server connection failed. Please retry or check your Site settings. (${err.message})` }),
        { 
          status: 500,
          headers: { "Content-Type": "application/json" } 
        }
      );
    }
  } catch (err: any) {
    console.error("[API readFile POST] Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Unknown error" }), 
      { 
        status: 500,
        headers: { "Content-Type": "application/json" } 
      }
    );
  }
}
