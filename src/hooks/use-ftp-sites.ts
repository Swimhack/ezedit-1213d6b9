
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type FTPSite = {
  id: string;
  site_name?: string; // Made optional since it might not exist in the database
  server_url: string;
  port: number;
  username: string;
  encrypted_password: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export function useFTPSites() {
  const [sites, setSites] = useState<FTPSite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  const fetchSites = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("ftp_credentials")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSites(data || []);
    } catch (error: any) {
      toast.error(`Error fetching sites: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async (site: FTPSite) => {
    try {
      const response = await fetch(`https://natjhcqynqziccssnwim.supabase.co/functions/v1/test-ftp-connection`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          server: site.server_url,
          port: site.port,
          user: site.username,
          password: site.encrypted_password // Note: In a real app, you'd decrypt this
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
        setTestResults(prev => ({ ...prev, [site.id]: true }));
      } else {
        toast.error(`Connection failed: ${result.message}`);
        setTestResults(prev => ({ ...prev, [site.id]: false }));
      }
    } catch (error: any) {
      toast.error(`Error testing connection: ${error.message}`);
      setTestResults(prev => ({ ...prev, [site.id]: false }));
      console.error("Test connection error:", error);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  return {
    sites,
    isLoading,
    testResults,
    fetchSites,
    handleTestConnection,
  };
}
