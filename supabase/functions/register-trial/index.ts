
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase } from "../_shared/supabaseClient.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body to get the email
    const { email } = await req.json();
    
    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate expiration date (7 days from now)
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(now.getDate() + 7);

    console.log(`Registering trial for ${email}, expires: ${expiresAt.toISOString()}`);

    // Insert or update the trial user
    const { data: trialUser, error: insertError } = await supabase
      .from('trial_users')
      .upsert({
        email,
        expires_at: expiresAt.toISOString(),
        active: true,
        signup_at: now.toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting trial user:', insertError);
      throw insertError;
    }

    // Send welcome email using Supabase Auth's email template
    // We'll create a magic link for easy access
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${req.headers.get('origin') || ''}/dashboard`,
        data: {
          trial_user: true,
          trial_expires: expiresAt.toISOString()
        }
      }
    });

    if (authError) {
      console.error('Error sending welcome email:', authError);
      // We don't want to fail the whole operation if just the email fails
      // The trial is still created
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Trial registration successful', 
        data: { 
          email, 
          expires_at: expiresAt.toISOString() 
        } 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('Error in register-trial function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to register trial', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
