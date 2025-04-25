
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Client } from "npm:basic-ftp@5.0.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { host, port, username, password } = await req.json()
    
    const client = new Client()
    client.ftp.verbose = true
    
    try {
      await client.access({
        host,
        port,
        user: username,
        password,
        secure: false
      })
      
      return new Response(
        JSON.stringify({ success: true, message: 'Connection successful' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (error) {
      return new Response(
        JSON.stringify({ success: false, message: error.message }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    } finally {
      client.close()
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
