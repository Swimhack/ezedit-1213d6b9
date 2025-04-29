
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { Loader } from 'lucide-react';

// Define strict types for console logs
type ConsoleLogType = "error" | "log" | "warn" | "info";

interface ConsoleLog {
  message: string;
  timestamp: number;
  type: ConsoleLogType;
}

interface EdgeFunctionLog {
  id: string;
  timestamp: string;
  message: string;
  function_id: string;
  level: string;
}

const Logs = () => {
  const [activeTab, setActiveTab] = useState('editor');
  const [editorLogs, setEditorLogs] = useState<ConsoleLog[]>([]);
  const [functionLogs, setFunctionLogs] = useState<EdgeFunctionLog[]>([]);
  const [ftpLogs, setFtpLogs] = useState<ConsoleLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch TinyMCE editor logs from localStorage
    const storedEditorLogs = localStorage.getItem('tinymce_logs');
    if (storedEditorLogs) {
      try {
        const parsedLogs = JSON.parse(storedEditorLogs);
        setEditorLogs(parsedLogs.map((log: any) => ({
          message: log.message,
          timestamp: log.timestamp,
          type: validateLogType(log.type)
        })));
      } catch (err) {
        console.error('Failed to parse editor logs:', err);
      }
    }

    // Fetch edge function logs from Supabase
    const fetchFunctionLogs = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('wysiwyg-ai-logs', {
          method: 'GET'
        });
        
        if (error) throw error;
        setFunctionLogs(data || []);
      } catch (err) {
        console.error('Failed to fetch function logs:', err);
        setEditorLogs(prevLogs => [...prevLogs, {
          message: `Failed to fetch function logs: ${err instanceof Error ? err.message : String(err)}`,
          timestamp: Date.now(),
          type: "error" as ConsoleLogType
        }]);
      }
    };

    // Fetch FTP logs from localStorage
    const storedFtpLogs = localStorage.getItem('ftp_logs');
    if (storedFtpLogs) {
      try {
        const parsedLogs = JSON.parse(storedFtpLogs);
        setFtpLogs(parsedLogs.map((log: any) => ({
          message: log.message,
          timestamp: log.timestamp,
          type: validateLogType(log.type)
        })));
      } catch (err) {
        console.error('Failed to parse FTP logs:', err);
      }
    }

    fetchFunctionLogs().finally(() => setLoading(false));

    // Cleanup and clear logs function
    const clearLogs = () => {
      if (confirm('Are you sure you want to clear all logs?')) {
        localStorage.removeItem('tinymce_logs');
        localStorage.removeItem('ftp_logs');
        setEditorLogs([]);
        setFtpLogs([]);
        toast({
          title: 'Logs cleared',
          description: 'All local log data has been removed.',
        });
      }
    };

    // Add clear logs button to DOM
    const headerActions = document.querySelector('.dashboard-header-actions');
    if (headerActions) {
      const clearBtn = document.createElement('button');
      clearBtn.className = 'text-sm text-red-500 hover:text-red-700 transition-colors';
      clearBtn.innerText = 'Clear Logs';
      clearBtn.onclick = clearLogs;
      headerActions.appendChild(clearBtn);
    }

    return () => {
      // Remove clear logs button on unmount
      const clearBtn = document.querySelector('.dashboard-header-actions button');
      if (clearBtn) {
        clearBtn.remove();
      }
    };
  }, [toast]);

  // Helper function to validate log types
  const validateLogType = (type: string): ConsoleLogType => {
    const validTypes: ConsoleLogType[] = ["error", "log", "warn", "info"];
    return validTypes.includes(type as ConsoleLogType) ? (type as ConsoleLogType) : "log";
  };

  // Format timestamp to readable date
  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  // Get badge variant based on log type
  const getBadgeVariant = (type: ConsoleLogType) => {
    switch (type) {
      case 'error':
        return 'destructive';
      case 'warn':
        return 'outline'; // Using outline for warnings
      case 'info':
        return 'secondary'; // Using secondary for info
      default:
        return 'default';
    }
  };

  // Format edge function logs timestamp
  const formatFunctionTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader className="h-10 w-10 animate-spin text-blue-500" />
          <p className="ml-2 text-lg">Loading logs...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">System Logs</h1>
          <p className="text-gray-500">Review logs for troubleshooting and monitoring.</p>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="editor">Editor Logs ({editorLogs.length})</TabsTrigger>
            <TabsTrigger value="functions">Function Logs ({functionLogs.length})</TabsTrigger>
            <TabsTrigger value="ftp">FTP Logs ({ftpLogs.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor">
            <Card>
              <CardHeader>
                <CardTitle>WYSIWYG Editor Logs</CardTitle>
                <CardDescription>
                  Recent activity and errors from the TinyMCE editor.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {editorLogs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No editor logs available.
                  </div>
                ) : (
                  <ScrollArea className="h-[500px] w-full rounded-md border p-4">
                    <div className="space-y-4">
                      {editorLogs.slice().reverse().map((log, index) => (
                        <div key={index} className="border-b pb-3 last:border-0">
                          <div className="flex justify-between mb-1">
                            <Badge variant={getBadgeVariant(log.type)} className="uppercase">
                              {log.type}
                            </Badge>
                            <small className="text-gray-500">{formatTimestamp(log.timestamp)}</small>
                          </div>
                          <div className="font-mono text-sm whitespace-pre-wrap break-all">
                            {log.message}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="functions">
            <Card>
              <CardHeader>
                <CardTitle>Edge Function Logs</CardTitle>
                <CardDescription>
                  Logs from serverless functions and backend operations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {functionLogs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No function logs available.
                  </div>
                ) : (
                  <ScrollArea className="h-[500px] w-full rounded-md border p-4">
                    <div className="space-y-4">
                      {functionLogs.slice().reverse().map((log, index) => (
                        <div key={index} className="border-b pb-3 last:border-0">
                          <div className="flex justify-between mb-1">
                            <Badge variant={log.level === 'error' ? 'destructive' : 'secondary'} className="uppercase">
                              {log.level || 'INFO'}
                            </Badge>
                            <small className="text-gray-500">{formatFunctionTimestamp(log.timestamp)}</small>
                          </div>
                          <div className="font-mono text-sm whitespace-pre-wrap break-all">
                            {log.message}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Function: {log.function_id || 'Unknown'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="ftp">
            <Card>
              <CardHeader>
                <CardTitle>FTP Logs</CardTitle>
                <CardDescription>
                  File transfer and connection logs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ftpLogs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No FTP logs available.
                  </div>
                ) : (
                  <ScrollArea className="h-[500px] w-full rounded-md border p-4">
                    <div className="space-y-4">
                      {ftpLogs.slice().reverse().map((log, index) => (
                        <div key={index} className="border-b pb-3 last:border-0">
                          <div className="flex justify-between mb-1">
                            <Badge variant={getBadgeVariant(log.type)} className="uppercase">
                              {log.type}
                            </Badge>
                            <small className="text-gray-500">{formatTimestamp(log.timestamp)}</small>
                          </div>
                          <div className="font-mono text-sm whitespace-pre-wrap break-all">
                            {log.message}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={() => navigate(-1)} className="mr-2">
            Go Back
          </Button>
          <Button onClick={() => {
            localStorage.removeItem('tinymce_logs');
            localStorage.removeItem('ftp_logs');
            setEditorLogs([]);
            setFtpLogs([]);
            toast({
              title: 'Logs cleared',
              description: 'All local log data has been removed.',
            });
          }}>
            Clear All Logs
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Logs;
