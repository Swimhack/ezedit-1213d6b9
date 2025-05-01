import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory cache of recent logs (for quick retrieval without DB calls)
const recentLogs = [];
const MAX_LOGS = 100;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // For GET requests, return the logs (in a real implementation you'd fetch from a database)
    if (req.method === 'GET') {
      const mockLogs = [
        {
          id: "log-1",
          timestamp: new Date().toISOString(),
          event_message: "WYSIWYG editor initialized",
          event_type: "Log",
          level: "log",
          function_id: "wysiwyg-ai"
        },
        {
          id: "log-2",
          timestamp: new Date(Date.now() - 60000).toISOString(),
          event_message: "Content processed successfully",
          event_type: "Log",
          level: "info",
          function_id: "wysiwyg-ai"
        },
        {
          id: "log-3",
          timestamp: new Date(Date.now() - 120000).toISOString(),
          event_message: "Preview iframe updated",
          event_type: "Log", 
          level: "log",
          function_id: "wysiwyg-ai"
        },
        {
          id: "log-4",
          timestamp: new Date(Date.now() - 180000).toISOString(),
          event_message: "File format conversion completed",
          event_type: "Log", 
          level: "info",
          function_id: "wysiwyg-ai"
        },
        {
          id: "log-5",
          timestamp: new Date(Date.now() - 240000).toISOString(),
          event_message: "Text extraction process finished",
          event_type: "Log", 
          level: "log",
          function_id: "wysiwyg-ai"
        },
        ...recentLogs // Add any collected real-time logs
      ];

      return new Response(JSON.stringify(mockLogs), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // For POST requests, log the data
    if (req.method === 'POST') {
      const { message, level = "log", source = "editor" } = await req.json();
      
      console.log(`[WYSIWYG-${source}] ${message}`);
      
      // Store in our in-memory cache
      recentLogs.unshift({
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        event_message: message,
        event_type: "Log",
        level: level,
        function_id: source || "wysiwyg-ai"
      });
      
      // Keep only the last MAX_LOGS entries
      if (recentLogs.length > MAX_LOGS) {
        recentLogs.length = MAX_LOGS;
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Log recorded", 
        timestamp: new Date().toISOString() 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error in wysiwyg-ai-logs function:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to process the logs request',
      details: error.message 
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
