
import { supabase } from "@/integrations/supabase/client";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * API endpoint to read a file from FTP
 * Supports both GET (legacy) and POST (recommended) methods
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const path = url.searchParams.get('path');
    
    if (!path) {
      return new NextResponse("Path parameter is required", { status: 400 });
    }
    
    // Split the path to get connectionId and filepath
    const [connectionId, ...pathParts] = path.split(':');
    const filepath = pathParts.join(':');
    
    console.log(`[API readFile GET] Reading file: ${filepath} for connection: ${connectionId}`);
    
    // Use AbortController to implement timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      // Call the Edge Function to get the file
      const { data, error } = await supabase.functions.invoke("ftp-get-file", {
        body: { id: connectionId, filepath },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (error) {
        console.error("[API readFile GET] Edge Function error:", error);
        return new NextResponse(
          `Live server connection failed. Please retry Refresh Files or check your Site settings. (${error.message})`, 
          { status: 500 }
        );
      }
      
      if (!data || !data.content) {
        return new NextResponse("File not found or empty", { status: 404 });
      }
      
      return new NextResponse(data.content, {
        status: 200,
        headers: { "Content-Type": "text/plain" }
      });
    } catch (err: any) {
      clearTimeout(timeoutId);
      
      if (err.name === 'AbortError') {
        console.error("[API readFile GET] Request timed out after 30 seconds");
        return new NextResponse("Request timed out after 30 seconds", { status: 408 });
      }
      
      console.error("[API readFile GET] Error fetching file:", err);
      return new NextResponse(
        `Live server connection failed. Please retry Refresh Files or check your Site settings. (${err.message})`, 
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error("[API readFile GET] Unexpected error:", err);
    return new NextResponse(err.message || "Unknown error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { path, site } = await req.json();
    
    if (!path) {
      return NextResponse.json({ error: "Path parameter is required" }, { status: 400 });
    }
    
    if (!site || !site.host || !site.user || !site.password) {
      return NextResponse.json({ error: "Valid site connection details are required" }, { status: 400 });
    }
    
    console.log(`[API readFile POST] Reading file: ${path} from host: ${site.host}`);
    
    // Use AbortController to implement timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      // Call the Edge Function with direct connection details
      const { data, error } = await supabase.functions.invoke("ftp-download-file", {
        body: { 
          site: {
            host: site.host,
            user: site.user, 
            password: site.password,
            port: site.port || 21,
            secure: site.secure || false
          },
          path 
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (error) {
        console.error("[API readFile POST] Edge Function error:", error);
        return NextResponse.json(
          { error: `Live server connection failed. Please retry or check your Site settings. (${error.message})` }, 
          { status: 500 }
        );
      }
      
      if (!data || !data.content) {
        return NextResponse.json({ error: "File not found or empty" }, { status: 404 });
      }
      
      // Return file content directly
      return new NextResponse(data.content, {
        status: 200,
        headers: { "Content-Type": "text/plain" }
      });
    } catch (err: any) {
      clearTimeout(timeoutId);
      
      if (err.name === 'AbortError') {
        console.error("[API readFile POST] Request timed out after 30 seconds");
        return NextResponse.json({ error: "Request timed out after 30 seconds" }, { status: 408 });
      }
      
      console.error("[API readFile POST] Error fetching file:", err);
      return NextResponse.json(
        { error: `Live server connection failed. Please retry or check your Site settings. (${err.message})` },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error("[API readFile POST] Unexpected error:", err);
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
}
