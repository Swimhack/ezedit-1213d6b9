
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type LogLevel = "log" | "info" | "warn" | "error";

export interface EditorLog {
  timestamp: number;
  level: LogLevel;
  message: string;
  source: string;
  details?: any;
}

export function useEditorLogs(category: string = "editor") {
  const [logs, setLogs] = useState<EditorLog[]>([]);

  const addLog = useCallback((message: string, level: LogLevel = "log", source: string = category, details?: any) => {
    const log: EditorLog = {
      timestamp: Date.now(),
      level,
      message,
      source,
      details
    };
    
    console[level](`[${source}] ${message}`, details || '');
    
    setLogs(prevLogs => [...prevLogs, log]);
    
    // Send critical logs to the server
    if (level === "error" || level === "warn") {
      try {
        supabase.functions.invoke('wysiwyg-ai-logs', {
          body: { 
            message: `[${source}] ${message}`,
            level,
            details
          }
        }).catch(err => {
          console.error("Failed to send log to server:", err);
        });
      } catch (err) {
        console.error("Error invoking log function:", err);
      }
    }
    
    return log;
  }, [category]);
  
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);
  
  return {
    logs,
    addLog,
    clearLogs
  };
}
