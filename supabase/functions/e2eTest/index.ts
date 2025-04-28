
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Client } from "https://esm.sh/basic-ftp@5.0.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", 
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json"
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { host, port = 21, user, password } = await req.json();
    
    if (!host || !user || !password) {
      return new Response(
        JSON.stringify({ error: "Host, user, and password are required" }),
        { headers: corsHeaders, status: 400 }
      );
    }

    const tests = [
      { name: "connect", status: "pending", details: null },
      { name: "list", status: "pending", details: null },
      { name: "upload", status: "pending", details: null },
      { name: "download", status: "pending", details: null },
      { name: "delete", status: "pending", details: null }
    ];
    
    const testFileName = `test-${Date.now()}.txt`;
    const testContent = "Hello from ezEdit test!";
    
    // Connect to FTP
    const client = new Client();
    try {
      // Test 1: Connect
      try {
        await client.access({
          host,
          port,
          user,
          password,
          secure: false
        });
        tests[0].status = "pass";
        tests[0].details = { message: "Connection successful" };
      } catch (err) {
        tests[0].status = "fail";
        tests[0].details = { message: err.message };
        throw err; // Stop other tests if connection fails
      }
      
      // Test 2: List
      try {
        const list = await client.list();
        tests[1].status = "pass";
        tests[1].details = { count: list.length };
      } catch (err) {
        tests[1].status = "fail";
        tests[1].details = { message: err.message };
      }
      
      // Test 3: Upload
      try {
        const encoder = new TextEncoder();
        const contentBuffer = encoder.encode(testContent);
        
        await client.uploadFrom(
          new ReadableStream({
            start(controller) {
              controller.enqueue(contentBuffer);
              controller.close();
            }
          }),
          testFileName
        );
        
        tests[2].status = "pass";
        tests[2].details = { file: testFileName };
      } catch (err) {
        tests[2].status = "fail";
        tests[2].details = { message: err.message };
        // Don't abort the tests if we can't upload
      }
      
      // Test 4: Download
      try {
        let content = "";
        const chunks = [];
        
        await client.downloadTo(
          new WritableStream({
            write(chunk) {
              chunks.push(chunk);
            }
          }),
          testFileName
        );
        
        content = new TextDecoder().decode(new Uint8Array(await new Response(new Blob(chunks)).arrayBuffer()));
        
        tests[3].status = "pass";
        tests[3].details = { 
          file: testFileName, 
          content,
          matches: content === testContent
        };
      } catch (err) {
        tests[3].status = "fail";
        tests[3].details = { message: err.message };
      }
      
      // Test 5: Delete
      try {
        await client.remove(testFileName);
        tests[4].status = "pass";
        tests[4].details = { file: testFileName };
      } catch (err) {
        tests[4].status = "fail";
        tests[4].details = { message: err.message };
      }
      
      return new Response(
        JSON.stringify({
          success: tests.every(test => test.status === "pass"),
          tests
        }),
        { headers: corsHeaders, status: 200 }
      );
    } finally {
      client.close();
    }
  } catch (err) {
    console.error("[e2eTest] Exception:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
