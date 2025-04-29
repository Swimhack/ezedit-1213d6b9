
import { useState, useEffect } from "react";

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
      localStorage.setItem("tinyMCELogs", JSON.stringify(updatedLogs));
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
  };
  
  useEffect(() => {
    // Load any existing logs from localStorage
    const storedLogs = localStorage.getItem("tinyMCELogs");
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
    localStorage.removeItem("tinyMCELogs");
  };
  
  return { logs, addLog, clearLogs };
}
