
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
  root_directory?: string; // Add root_directory as an optional field
};

export function useFTPSites() {
  const [sites, setSites] = useState<FTPSite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  const fetchSites = async (silent = false) => {
    // Only show loading indicator on initial load, not refreshes
    if (!silent) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    
    try {
      // Get the current user session to get the user ID
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData?.session?.user) {
        console.log("No authenticated user found");
        setSites([]);
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      const userId = sessionData.session.user.id;
      console.log("Fetching sites for user:", userId);

      // Query only sites belonging to the current user
      const { data, error } = await supabase
        .from("ftp_credentials")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      console.log("Sites fetched:", data?.length || 0);
      
      // Update sites state
      setSites(data || []);
    } catch (error: any) {
      console.error("Error fetching FTP sites:", error);
      if (!silent) {
        toast.error(`Error fetching sites: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleTestConnection = async (site: FTPSite) => {
    try {
      setTestResults(prev => ({ ...prev, [site.id]: undefined })); // Set to undefined while testing
      
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
          password: site.encrypted_password
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
    isRefreshing,
    testResults,
    fetchSites,
    handleTestConnection,
  };
}
