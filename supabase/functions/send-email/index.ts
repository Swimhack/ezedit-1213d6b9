
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { supabase } from "../_shared/supabaseClient.ts"

const MAILGUN_API_KEY = Deno.env.get('MAILGUN_API_KEY')
const MAILGUN_DOMAIN = Deno.env.get('MAILGUN_DOMAIN')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { to, subject, text, html } = await req.json() as EmailRequest

    console.log(`Sending email to ${to} with subject: ${subject}`)

    // Check if we have the required environment variables
    if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
      console.error("Missing Mailgun credentials")
      throw new Error("Server configuration error: Missing email provider credentials")
    }

    // First check if this email is already in our subscribers list
    const { data: subscribers, error: dbError } = await supabase
      .from('email_subscribers')
      .select('*')
      .eq('email', to)
      .eq('status', 'sent')
      .maybeSingle()
    
    if (dbError) {
      console.error("Database query error:", dbError)
    }

    // If we've already sent an email to this address, don't send it again
    if (subscribers) {
      console.log(`Email already sent to ${to}, skipping duplicate send`)
      return new Response(JSON.stringify({ 
        message: "Email previously sent to this address",
        success: true 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const formData = new FormData()
    formData.append('from', `EzEdit <noreply@${MAILGUN_DOMAIN}>`)
    formData.append('to', to)
    formData.append('subject', subject)
    formData.append('text', text)
    if (html) formData.append('html', html)

    console.log(`Making API request to Mailgun for ${to}`)

    const response = await fetch(
      `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${btoa(`api:${MAILGUN_API_KEY}`)}`,
        },
        body: formData,
      }
    )

    const responseText = await response.text()
    console.log(`Mailgun API response status: ${response.status}, Body:`, responseText)

    if (!response.ok) {
      console.error(`Mailgun API error: ${response.status} ${response.statusText}`, responseText)
      throw new Error(`Mailgun API error: ${response.statusText}`)
    }

    let result
    try {
      result = JSON.parse(responseText)
    } catch (e) {
      console.warn("Could not parse Mailgun response as JSON:", e)
      result = { message: responseText }
    }

    console.log('Email sent successfully:', result)

    // Log the success in database - using upsert to handle both new and existing records
    try {
      const { error } = await supabase
        .from('email_subscribers')
        .upsert({ 
          email: to, 
          status: 'sent', 
          sent_at: new Date().toISOString() 
        }, { 
          onConflict: 'email',
          ignoreDuplicates: false 
        })
      
      if (error) {
        console.error("Failed to update email status in database:", error)
      }
    } catch (dbError) {
      console.error("Database update error:", dbError)
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Email sent successfully",
      details: result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error in send-email function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
