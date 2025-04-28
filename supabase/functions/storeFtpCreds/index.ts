
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
    
    const { host, port, user, password, label } = await req.json();
    const secret = Deno.env.get("KMS_SECRET")!;
    const enc = new TextEncoder();
    
    const jwe = await new jose.CompactEncrypt(enc.encode(password))
      .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
      .encrypt(enc.encode(secret));

    const { data, error } = await supabase.from("ftp_connections")
      .insert({ host, port, user, pw_enc: jwe, label }).select().single();

    if (error) {
      console.error("[storeFtpCreds] Error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: corsHeaders, status: 400 }
      );
    }
    
    return new Response(
      JSON.stringify({ id: data.id }),
      { headers: corsHeaders, status: 200 }
    );
  } catch (err) {
    console.error("[storeFtpCreds] Exception:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
