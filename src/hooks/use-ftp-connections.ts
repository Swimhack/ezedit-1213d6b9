
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type FtpConnection = {
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

export function useFTPConnections() {
  const [connections, setConnections] = useState<FtpConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

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
      const response = await fetch(`https://natjhcqynqziccssnwim.supabase.co/functions/v1/ftp-test-connection`, {
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

  useEffect(() => {
    fetchConnections();
  }, []);

  return {
    connections,
    isLoading,
    testResults,
    fetchConnections,
    handleTestConnection,
  };
}
