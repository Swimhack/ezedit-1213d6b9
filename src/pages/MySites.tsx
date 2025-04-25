
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PlusCircle, ExternalLink, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import FTPConnectionModal from "@/components/FTPConnectionModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Drawer } from "@/components/ui/drawer";
import FTPFileExplorer from "@/components/FTPFileExplorer";

type FtpConnection = {
  id: string;
  server_name: string;
  host: string;
  port: number;
  username: string;
  password: string;
  root_directory: string | null;
  web_url: string | null;
  created_at: string;
};

const MySites = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [connections, setConnections] = useState<FtpConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeConnection, setActiveConnection] = useState<FtpConnection | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("ftp_connections")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setConnections(data || []);
    } catch (error: any) {
      toast.error(`Error fetching connections: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async (connection: FtpConnection) => {
    try {
      // Update the API endpoint to use the Supabase edge function URL
      const apiUrl = `https://natjhcqynqziccssnwim.supabase.co/functions/v1/ftp-test-connection`;
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          host: connection.host,
          port: connection.port,
          username: connection.username,
          password: connection.password
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        toast.success("Connection successful!");
        setTestResults(prev => ({ ...prev, [connection.id]: true }));
      } else {
        toast.error(`Connection failed: ${result.message}`);
        setTestResults(prev => ({ ...prev, [connection.id]: false }));
      }
    } catch (error: any) {
      toast.error(`Error testing connection: ${error.message}`);
      setTestResults(prev => ({ ...prev, [connection.id]: false }));
      console.error("Test connection error:", error);
    }
  };

  const handleOpenFileExplorer = (connection: FtpConnection) => {
    setActiveConnection(connection);
    setIsDrawerOpen(true);
  };

  const handleSaveConnection = () => {
    fetchConnections();
    setIsModalOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="container py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Sites</h1>
            <p className="text-ezgray mt-2">
              <Badge variant="outline" className="mr-2 bg-eznavy text-ezwhite">Beta</Badge>
              Manage your FTP connections and site files
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="bg-ezblue hover:bg-ezblue/90">
            <PlusCircle className="mr-2" size={16} /> Connect a Site
          </Button>
        </div>

        <FTPConnectionModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSaveConnection}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-full text-center py-8">
              <div className="animate-pulse">Loading connections...</div>
            </div>
          ) : connections.length === 0 ? (
            <div className="col-span-full text-center py-8 border border-dashed border-ezgray-dark rounded-lg">
              <h3 className="text-xl font-medium mb-2">No sites connected yet</h3>
              <p className="text-ezgray mb-4">
                Add your first FTP connection to start managing your sites
              </p>
              <Button onClick={() => setIsModalOpen(true)} variant="outline">
                <PlusCircle className="mr-2" size={16} /> Connect a Site
              </Button>
            </div>
          ) : (
            connections.map((connection) => (
              <Card key={connection.id} className="border-ezgray-dark bg-eznavy">
                <CardHeader className="pb-2">
                  <CardTitle className="flex justify-between items-center">
                    <span className="truncate">{connection.server_name}</span>
                    <div className="flex items-center space-x-1">
                      {testResults[connection.id] === true && (
                        <Badge className="bg-green-600">
                          <Check size={12} className="mr-1" /> Connected
                        </Badge>
                      )}
                      {testResults[connection.id] === false && (
                        <Badge variant="destructive">
                          <X size={12} className="mr-1" /> Failed
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-ezgray mb-1">Host: {connection.host}</p>
                    {connection.web_url && (
                      <p className="text-sm flex items-center">
                        <ExternalLink size={14} className="mr-1" />
                        <a 
                          href={connection.web_url.startsWith('http') ? connection.web_url : `https://${connection.web_url}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-ezblue hover:underline truncate"
                        >
                          {connection.web_url}
                        </a>
                      </p>
                    )}
                  </div>
                  <div className="pt-2 flex flex-col space-y-2">
                    <Button onClick={() => handleTestConnection(connection)} variant="outline" size="sm">
                      Test Connection
                    </Button>
                    <Button 
                      onClick={() => handleOpenFileExplorer(connection)} 
                      className="bg-ezblue hover:bg-ezblue/90" 
                      size="sm"
                    >
                      View Files
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          {activeConnection && (
            <FTPFileExplorer 
              connection={activeConnection} 
              onClose={() => setIsDrawerOpen(false)}
            />
          )}
        </Drawer>
      </div>
    </DashboardLayout>
  );
};

export default MySites;
