
import { NextResponse } from "next/server";
import { listDir } from "@/lib/ftp";

export async function POST(req: Request) {
  try {
    const { connectionId, path } = await req.json();
    
    if (!connectionId || !path) {
      return NextResponse.json(
        { error: "Missing connection ID or path" }, 
        { status: 400 }
      );
    }
    
    console.log(`[API refreshFromServer] Refreshing files for connection ${connectionId}, path: ${path}`);
    
    try {
      const result = await listDir(connectionId, path);
      
      if (result && result.data && result.data.files) {
        console.log(`[API refreshFromServer] Success, received ${result.data.files.length} files`);
        return NextResponse.json({
          success: true,
          data: {
            files: result.data.files,
            path
          }
        }, { status: 200 });
      } else {
        throw new Error("Invalid response format from FTP service");
      }
    } catch (err: any) {
      console.error("[API refreshFromServer] Error:", err);
      return NextResponse.json(
        { 
          success: false,
          error: err.message || "Failed to refresh directory listing" 
        }, 
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error("[API refreshFromServer] Unexpected error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected error" }, 
      { status: 500 }
    );
  }
}
