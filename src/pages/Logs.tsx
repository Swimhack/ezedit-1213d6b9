
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LogViewer, LogEntry } from '@/components/ui/log-viewer';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { Loader, FileText } from 'lucide-react';
import { logEvent } from '@/utils/ftp-utils';

// Define strict types for console logs
type ConsoleLogType = "error" | "log" | "warn" | "info";

interface ConsoleLog {
  message: string;
  timestamp: number;
  type: ConsoleLogType;
  source?: string;
  level: string; // Changed from optional to required to match LogEntry
}

interface EdgeFunctionLog {
  id: string;
  timestamp: string;
  event_message: string;
  function_id: string;
  level: string;
}

const Logs = () => {
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get('filter');
  
  const [activeTab, setActiveTab] = useState('combined');
  const [editorLogs, setEditorLogs] = useState<ConsoleLog[]>([]);
  const [functionLogs, setFunctionLogs] = useState<EdgeFunctionLog[]>([]);
  const [ftpLogs, setFtpLogs] = useState<ConsoleLog[]>([]);
  const [combinedText, setCombinedText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();

  // Set initial tab based on URL parameter if provided
  useEffect(() => {
    if (filterParam) {
      if (filterParam === 'editor' || filterParam === 'functions' || filterParam === 'ftp') {
        setActiveTab(filterParam);
      } else if (filterParam === 'text') {
        setActiveTab('combined');
      }
    }
  }, [filterParam]);

  // Log page visit
  useEffect(() => {
    logEvent('Logs page visited', 'info', 'navigation');
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    
    try {
      // Fetch TinyMCE editor logs from localStorage
      const storedEditorLogs = localStorage.getItem('tinymce_logs');
      if (storedEditorLogs) {
        try {
          const parsedLogs = JSON.parse(storedEditorLogs);
          setEditorLogs(parsedLogs.map((log: any) => {
            const logType = validateLogType(log.type);
            return {
              message: log.message,
              timestamp: log.timestamp,
              type: logType,
              source: log.source || 'editor',
              level: logType // Ensure level is always set
            };
          }));
          logEvent(`Loaded ${parsedLogs.length} editor logs`, 'info', 'logs');
        } catch (err) {
          console.error('Failed to parse editor logs:', err);
          logEvent('Failed to parse editor logs', 'error', 'logs');
        }
      }

      // Fetch FTP logs from localStorage
      const storedFtpLogs = localStorage.getItem('ftp_logs');
      if (storedFtpLogs) {
        try {
          const parsedLogs = JSON.parse(storedFtpLogs);
          setFtpLogs(parsedLogs.map((log: any) => {
            const logType = validateLogType(log.type);
            return {
              message: log.message,
              timestamp: log.timestamp,
              type: logType,
              source: log.source || 'ftp',
              level: logType // Ensure level is always set
            };
          }));
          logEvent(`Loaded ${parsedLogs.length} FTP logs`, 'info', 'logs');
        } catch (err) {
          console.error('Failed to parse FTP logs:', err);
          logEvent('Failed to parse FTP logs', 'error', 'logs');
        }
      }
      
      // Fetch custom logs from other sources
      const sources = ['ftp', 'ftpContent', 'ftpDirectory', 'dateUtils', 'siteConfig', 'fileExplorer', 'navigation'];
      for (const source of sources) {
        const storageKey = `${source}_logs`;
        const storedLogs = localStorage.getItem(storageKey);
        if (storedLogs) {
          try {
            const parsedLogs = JSON.parse(storedLogs);
            setFtpLogs(prevLogs => [
              ...prevLogs, 
              ...parsedLogs.map((log: any) => {
                const logType = validateLogType(log.type);
                return {
                  message: log.message,
                  timestamp: log.timestamp,
                  type: logType,
                  source: log.source || source,
                  level: logType // Ensure level is always set
                };
              })
            ]);
            logEvent(`Loaded ${parsedLogs.length} ${source} logs`, 'info', 'logs');
          } catch (err) {
            console.error(`Failed to parse ${source} logs:`, err);
            logEvent(`Failed to parse ${source} logs`, 'error', 'logs');
          }
        }
      }

      // Fetch edge function logs from Supabase
      try {
        const { data, error } = await supabase.functions.invoke('wysiwyg-ai-logs', {
          method: 'GET'
        });
        
        if (error) throw error;
        setFunctionLogs(data || []);
        logEvent(`Loaded ${data?.length || 0} function logs`, 'info', 'logs');
      } catch (err) {
        console.error('Failed to fetch function logs:', err);
        logEvent(`Failed to fetch function logs: ${err instanceof Error ? err.message : String(err)}`, 'error', 'logs');
      }
    } catch (err) {
      console.error('Error loading logs:', err);
      logEvent(`Error loading logs: ${err instanceof Error ? err.message : String(err)}`, 'error', 'logs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs, refreshKey]);

  // Helper function to validate log types
  const validateLogType = (type: string): ConsoleLogType => {
    const validTypes: ConsoleLogType[] = ["error", "log", "warn", "info"];
    return validTypes.includes(type as ConsoleLogType) ? (type as ConsoleLogType) : "log";
  };

  // Format timestamp to readable date
  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  // Generate combined text logs format
  useEffect(() => {
    let text = "# COMBINED LOGS\n\n";
    
    // Add editor logs
    text += "## EDITOR LOGS\n";
    if (editorLogs.length === 0) {
      text += "No editor logs available.\n";
    } else {
      editorLogs.slice().sort((a, b) => b.timestamp - a.timestamp).forEach((log) => {
        text += `[${formatTimestamp(log.timestamp)}] [${log.type.toUpperCase()}] ${log.source ? `[${log.source}] ` : ''}${log.message}\n`;
      });
    }
    
    text += "\n## FUNCTION LOGS\n";
    if (functionLogs.length === 0) {
      text += "No function logs available.\n";
    } else {
      functionLogs.slice().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).forEach((log) => {
        text += `[${new Date(log.timestamp).toLocaleString()}] [${(log.level || 'INFO').toUpperCase()}] [${log.function_id || 'unknown'}] ${log.event_message}\n`;
      });
    }
    
    text += "\n## FTP LOGS\n";
    if (ftpLogs.length === 0) {
      text += "No FTP logs available.\n";
    } else {
      ftpLogs.slice().sort((a, b) => b.timestamp - a.timestamp).forEach((log) => {
        text += `[${formatTimestamp(log.timestamp)}] [${log.type.toUpperCase()}] ${log.source ? `[${log.source}] ` : ''}${log.message}\n`;
      });
    }
    
    setCombinedText(text);
  }, [editorLogs, functionLogs, ftpLogs]);

  // Format edge function logs timestamp
  const formatFunctionTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  };

  // Download logs as text file
  const downloadLogs = () => {
    const element = document.createElement('a');
    const file = new Blob([combinedText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `logs-${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    logEvent('Downloaded combined logs', 'info', 'logs');
  };

  const clearAllLogs = () => {
    if (window.confirm('Are you sure you want to clear all logs? This cannot be undone.')) {
      localStorage.removeItem('tinymce_logs');
      localStorage.removeItem('ftp_logs');
      
      // Clear all custom logs
      const sources = ['ftp', 'ftpContent', 'ftpDirectory', 'dateUtils', 'siteConfig', 'fileExplorer', 'navigation'];
      for (const source of sources) {
        localStorage.removeItem(`${source}_logs`);
      }
      
      setEditorLogs([]);
      setFtpLogs([]);
      setCombinedText("# COMBINED LOGS\n\nAll logs have been cleared.");
      toast({
        title: 'Logs cleared',
        description: 'All local log data has been removed.',
      });
      
      logEvent('All logs cleared by user', 'info', 'logs');
    }
  };

  const refreshLogs = () => {
    setRefreshKey(prev => prev + 1);
    toast({
      title: 'Refreshing logs',
      description: 'Fetching the latest log data...',
    });
    
    logEvent('Manually refreshed logs', 'info', 'logs');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-10">
          <div className="flex items-center justify-center h-full">
            <Loader className="h-10 w-10 animate-spin text-blue-500 mr-4" />
            <p className="text-lg">Loading logs...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">System Logs</h1>
            <p className="text-gray-500">Review logs for troubleshooting and monitoring.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={refreshLogs} variant="outline">
              <Loader className="h-4 w-4 mr-2" /> Refresh
            </Button>
            <Button onClick={downloadLogs} variant="outline">
              <FileText className="h-4 w-4 mr-2" /> Export All
            </Button>
          </div>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="combined">
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Combined Text
              </div>
            </TabsTrigger>
            <TabsTrigger value="editor">Editor Logs ({editorLogs.length})</TabsTrigger>
            <TabsTrigger value="functions">Function Logs ({functionLogs.length})</TabsTrigger>
            <TabsTrigger value="ftp">FTP Logs ({ftpLogs.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="combined">
            <Card>
              <CardContent className="pt-6">
                <ScrollArea className="h-[600px] w-full rounded-md border p-4">
                  <pre className="font-mono text-sm whitespace-pre-wrap break-words">{combinedText}</pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="editor">
            <LogViewer
              logs={editorLogs}
              title="WYSIWYG Editor Logs"
              description="Recent activity and errors from the TinyMCE editor."
              onClear={() => {
                localStorage.removeItem('tinymce_logs');
                setEditorLogs([]);
                toast({
                  title: 'Editor logs cleared',
                  description: 'All editor logs have been removed.',
                });
                logEvent('Editor logs cleared', 'info', 'logs');
              }}
              emptyMessage="No editor logs available."
            />
          </TabsContent>
          
          <TabsContent value="functions">
            <LogViewer
              logs={functionLogs.map(log => ({
                message: log.event_message,
                timestamp: new Date(log.timestamp).getTime(),
                level: log.level || 'info',
                source: log.function_id
              }))}
              title="Edge Function Logs"
              description="Logs from serverless functions and backend operations."
              emptyMessage="No function logs available."
            />
          </TabsContent>
          
          <TabsContent value="ftp">
            <LogViewer
              logs={ftpLogs}
              title="FTP Logs"
              description="File transfer and connection logs."
              onClear={() => {
                localStorage.removeItem('ftp_logs');
                // Clear all custom logs
                const sources = ['ftp', 'ftpContent', 'ftpDirectory', 'dateUtils', 'siteConfig', 'fileExplorer', 'navigation'];
                for (const source of sources) {
                  localStorage.removeItem(`${source}_logs`);
                }
                setFtpLogs([]);
                toast({
                  title: 'FTP logs cleared',
                  description: 'All FTP logs have been removed.',
                });
                logEvent('FTP logs cleared', 'info', 'logs');
              }}
              emptyMessage="No FTP logs available."
            />
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button 
            onClick={clearAllLogs}
            variant="destructive"
          >
            Clear All Logs
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Logs;
