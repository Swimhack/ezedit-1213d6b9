
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as jose from "https://deno.land/x/jose@v5.1.2/index.ts";

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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    
    const { id } = await req.json();
    
    if (!id) {
      return new Response(
        JSON.stringify({ error: "Connection ID is required" }),
        { headers: corsHeaders, status: 400 }
      );
    }

    const { data, error } = await supabase.from("ftp_connections")
      .select("host, port, user, pw_enc")
      .eq("id", id)
      .single();

    if (error) {
      console.error("[getFtpCreds] Error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: corsHeaders, status: 400 }
      );
    }
    
    // Decrypt password
    const secret = Deno.env.get("KMS_SECRET")!;
    const enc = new TextEncoder();
    const dec = new TextDecoder();
    
    const jwe = await jose.compactDecrypt(data.pw_enc, enc.encode(secret));
    const password = dec.decode(jwe.plaintext);
    
    return new Response(
      JSON.stringify({
        host: data.host,
        port: data.port,
        user: data.user,
        password: password
      }),
      { headers: corsHeaders, status: 200 }
    );
  } catch (err) {
    console.error("[getFtpCreds] Exception:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
