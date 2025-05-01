
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface TinyMCELog {
  message: string;
  timestamp: number;
  type: "log" | "error" | "warn" | "info";
  source: "editor" | "preview" | "init" | "content";
}

export function useTinyMCELogs() {
  const [logs, setLogs] = useState<TinyMCELog[]>([]);
  
  const addLog = (message: string, type: TinyMCELog["type"] = "log", source: TinyMCELog["source"] = "editor") => {
    const newLog: TinyMCELog = {
      message,
      timestamp: Date.now(),
      type,
      source
    };
    
    setLogs(prevLogs => {
      const updatedLogs = [newLog, ...prevLogs].slice(0, 100);
      localStorage.setItem("tinymce_logs", JSON.stringify(updatedLogs));
      return updatedLogs;
    });
    
    // Also send to console for regular logging
    switch (type) {
      case "error":
        console.error(`[TinyMCE-${source}]`, message);
        break;
      case "warn":
        console.warn(`[TinyMCE-${source}]`, message);
        break;
      case "info":
        console.info(`[TinyMCE-${source}]`, message);
        break;
      default:
        console.log(`[TinyMCE-${source}]`, message);
    }
    
    // Send critical errors to the edge function logs
    if (type === "error" && source === "content") {
      sendLogToServer(message, type, source)
        .catch(err => console.error("Failed to send log to server:", err));
    }
  };
  
  // Function to send logs to Supabase edge function
  const sendLogToServer = async (message: string, level: string, source: string) => {
    try {
      await supabase.functions.invoke('wysiwyg-ai-logs', {
        method: 'POST',
        body: { message, level, source }
      });
    } catch (error) {
      console.error("Error sending log to server:", error);
    }
  };
  
  useEffect(() => {
    // Load any existing logs from localStorage
    const storedLogs = localStorage.getItem("tinymce_logs");
    if (storedLogs) {
      try {
        setLogs(JSON.parse(storedLogs));
      } catch (error) {
        console.error("Error parsing stored TinyMCE logs:", error);
      }
    }
  }, []);
  
  const clearLogs = () => {
    setLogs([]);
    localStorage.removeItem("tinymce_logs");
  };
  
  return { logs, addLog, clearLogs };
}
