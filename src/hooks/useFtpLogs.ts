
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type FtpLogEvent = {
  event: string;
  payload: any;
  timestamp: number;
};

export function useFtpLogs(connectionId: string | null | undefined) {
  const [logs, setLogs] = useState<FtpLogEvent[]>([]);
  
  useEffect(() => {
    if (!connectionId) return;
    
    const channelName = `ftp_logs:${connectionId}`;
    const channel = supabase.channel(channelName);
    
    channel
      .on("broadcast", { event: "*" }, (payload) => {
        const event = payload.event;
        const data = payload.payload;
        
        setLogs(prev => [
          { event, payload: data, timestamp: Date.now() },
          ...prev.slice(0, 99) // Keep only latest 100 logs
        ]);
        
        // Show toast notifications for important events
        switch (event) {
          case "file_updated":
            toast.info(`File updated: ${data.filepath.split('/').pop()}`);
            break;
          case "file_locked":
            toast.info(`File locked by ${data.by}`);
            break;
          case "file_uploaded":
            toast.success(`File uploaded successfully`);
            break;
          case "file_deleted":
            toast.info(`File deleted: ${data.filepath.split('/').pop()}`);
            break;
          case "file_renamed":
            toast.info(`File renamed to ${data.newPath.split('/').pop()}`);
            break;
        }
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [connectionId]);
  
  return { logs };
}
