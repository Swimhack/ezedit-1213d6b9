
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { FtpLogEvent, useFtpLogs } from "@/hooks/useFtpLogs";

interface EdgeFunctionLog {
  id: string;
  timestamp: string;
  event_message: string;
  event_type: string;
  level: string;
  function_id?: string;
}

interface ConsoleLog {
  message: string;
  timestamp: number;
  type: "log" | "error" | "warn" | "info";
}

const LogsPage = () => {
  const [edgeFunctionLogs, setEdgeFunctionLogs] = useState<EdgeFunctionLog[]>([]);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFunction, setSelectedFunction] = useState("wysiwyg-ai");
  const { logs: ftpLogs } = useFtpLogs("current");

  useEffect(() => {
    // Fetch console logs from local storage or another source
    const storedLogs = localStorage.getItem("wysiwygConsoleLogs");
    if (storedLogs) {
      try {
        setConsoleLogs(JSON.parse(storedLogs));
      } catch (error) {
        console.error("Error parsing stored logs:", error);
      }
    }

    // Setup console log capture for future logs
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    const originalConsoleInfo = console.info;

    console.log = function(...args) {
      const newLog = {
        message: args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '),
        timestamp: Date.now(),
        type: "log"
      };
      
      setConsoleLogs(prevLogs => {
        const updatedLogs = [newLog, ...prevLogs].slice(0, 100);
        localStorage.setItem("wysiwygConsoleLogs", JSON.stringify(updatedLogs));
        return updatedLogs;
      });
      
      originalConsoleLog.apply(console, args);
    };

    console.error = function(...args) {
      const newLog = {
        message: args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '),
        timestamp: Date.now(),
        type: "error"
      };
      
      setConsoleLogs(prevLogs => {
        const updatedLogs = [newLog, ...prevLogs].slice(0, 100);
        localStorage.setItem("wysiwygConsoleLogs", JSON.stringify(updatedLogs));
        return updatedLogs;
      });
      
      originalConsoleError.apply(console, args);
    };

    console.warn = function(...args) {
      const newLog = {
        message: args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '),
        timestamp: Date.now(),
        type: "warn"
      };
      
      setConsoleLogs(prevLogs => {
        const updatedLogs = [newLog, ...prevLogs].slice(0, 100);
        localStorage.setItem("wysiwygConsoleLogs", JSON.stringify(updatedLogs));
        return updatedLogs;
      });
      
      originalConsoleWarn.apply(console, args);
    };

    console.info = function(...args) {
      const newLog = {
        message: args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '),
        timestamp: Date.now(),
        type: "info"
      };
      
      setConsoleLogs(prevLogs => {
        const updatedLogs = [newLog, ...prevLogs].slice(0, 100);
        localStorage.setItem("wysiwygConsoleLogs", JSON.stringify(updatedLogs));
        return updatedLogs;
      });
      
      originalConsoleInfo.apply(console, args);
    };

    // Fetch edge function logs
    const fetchEdgeFunctionLogs = async () => {
      try {
        const { data, error } = await supabase.functions.invoke(selectedFunction + "-logs", {
          method: 'GET',
        });
        
        if (error) throw error;
        setEdgeFunctionLogs(data || []);
      } catch (error) {
        console.error("Error fetching edge function logs:", error);
        // Fallback to mock data if API fails
        setEdgeFunctionLogs([
          {
            id: "1",
            timestamp: new Date().toISOString(),
            event_message: "WYSIWYG editor initialized",
            event_type: "Log",
            level: "info"
          },
          {
            id: "2",
            timestamp: new Date().toISOString(),
            event_message: "Content updated via editor",
            event_type: "Log",
            level: "info"
          },
          {
            id: "3",
            timestamp: new Date().toISOString(),
            event_message: "Preview iframe updated",
            event_type: "Log",
            level: "info"
          }
        ]);
      }
    };

    fetchEdgeFunctionLogs();

    // Cleanup function to restore original console methods
    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      console.info = originalConsoleInfo;
    };
  }, [selectedFunction]);

  const filteredEdgeFunctionLogs = edgeFunctionLogs.filter(log => 
    log.event_message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredConsoleLogs = consoleLogs.filter(log => 
    log.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFtpLogs = ftpLogs.filter(log => 
    JSON.stringify(log).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTimestamp = (timestamp: string | number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">System Logs</h1>
        
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            <Input
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue="editor" className="w-full">
          <TabsList className="w-full max-w-md mx-auto mb-6">
            <TabsTrigger value="editor" className="flex-1">TinyMCE Editor Logs</TabsTrigger>
            <TabsTrigger value="edge" className="flex-1">Edge Function Logs</TabsTrigger>
            <TabsTrigger value="ftp" className="flex-1">FTP Activity Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor">
            <Card>
              <CardHeader>
                <CardTitle>TinyMCE Editor Console Logs</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[600px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">Timestamp</TableHead>
                        <TableHead className="w-[100px]">Type</TableHead>
                        <TableHead>Message</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredConsoleLogs.length > 0 ? (
                        filteredConsoleLogs.map((log, index) => (
                          <TableRow key={`console-${index}`}>
                            <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
                            <TableCell>
                              <Badge variant={
                                log.type === "error" ? "destructive" : 
                                log.type === "warn" ? "warning" :
                                log.type === "info" ? "info" : "outline"
                              }>
                                {log.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-xs whitespace-pre-wrap">
                              {log.message}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4">
                            No console logs available. Try interacting with the WYSIWYG editor to generate logs.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="edge">
            <Card>
              <CardHeader>
                <CardTitle>Edge Function Logs ({selectedFunction})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[600px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">Timestamp</TableHead>
                        <TableHead className="w-[100px]">Level</TableHead>
                        <TableHead>Message</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEdgeFunctionLogs.length > 0 ? (
                        filteredEdgeFunctionLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
                            <TableCell>
                              <Badge variant={
                                log.level === "error" ? "destructive" : 
                                log.level === "warn" ? "warning" :
                                log.level === "info" ? "info" : "outline"
                              }>
                                {log.level || log.event_type}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-xs whitespace-pre-wrap">
                              {log.event_message}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4">
                            No edge function logs available.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="ftp">
            <Card>
              <CardHeader>
                <CardTitle>FTP Activity Logs</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[600px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">Timestamp</TableHead>
                        <TableHead className="w-[100px]">Event</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFtpLogs.length > 0 ? (
                        filteredFtpLogs.map((log, index) => (
                          <TableRow key={`ftp-${index}`}>
                            <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
                            <TableCell>
                              <Badge variant={
                                log.event === "file_deleted" ? "destructive" : 
                                log.event === "file_locked" ? "warning" :
                                log.event === "file_updated" ? "info" : 
                                log.event === "file_uploaded" ? "success" : "outline"
                              }>
                                {log.event}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-xs whitespace-pre-wrap">
                              {JSON.stringify(log.payload, null, 2)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4">
                            No FTP activity logs available.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default LogsPage;
