
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

export interface FTPTestConnectionResult {
  success: boolean;
  message: string;
  helpfulMessage?: string;
}

export function useFTPSites() {
  const [sites, setSites] = useState<FTPSite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, boolean | undefined>>({});

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

      // Reset test results for refreshed sites to ensure we have fresh connection status
      if (data && data.length > 0) {
        const newTestResults = {...testResults};
        data.forEach(site => {
          // Only reset sites that don't have a test result yet
          if (newTestResults[site.id] === undefined) {
            console.log(`Site ${site.id} doesn't have a test result yet`);
          }
        });
      }
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

  const handleTestConnection = async (site: FTPSite): Promise<FTPTestConnectionResult> => {
    try {
      setTestResults(prev => ({ ...prev, [site.id]: undefined })); // Set to undefined while testing
      
      console.log(`Testing connection to ${site.server_url}:${site.port}`);
      
      // Use Supabase function directly with more compatible parameter naming
      const { data, error } = await supabase.functions.invoke("ftp-test-connection", {
        body: {
          host: site.server_url,
          server: site.server_url, // Include both names for compatibility
          port: site.port,
          username: site.username,
          user: site.username, // Include both names for compatibility
          password: site.encrypted_password,
          root_directory: site.root_directory
        },
      });

      if (error) {
        console.error("Test connection error:", error);
        setTestResults(prev => ({ ...prev, [site.id]: false }));
        return {
          success: false,
          message: error.message,
          helpfulMessage: "Unable to connect to the FTP server. Please verify your credentials or try again later."
        };
      }

      console.log("Test response:", data);
      
      if (data && data.success) {
        setTestResults(prev => ({ ...prev, [site.id]: true }));
        return {
          success: true,
          message: data.message || "Connection successful!"
        };
      } else {
        const message = data?.message || "Unknown error";
        const helpfulMessage = data?.helpfulMessage || (
          message.includes("530") ? 
          "Login failed. Double-check your FTP username and password. You may need to contact your hosting provider." : 
          "Unable to connect to the FTP server. Please verify your credentials or try again later."
        );
        
        setTestResults(prev => ({ ...prev, [site.id]: false }));
        return {
          success: false,
          message: message,
          helpfulMessage: helpfulMessage
        };
      }
    } catch (error: any) {
      console.error("Test connection error:", error);
      setTestResults(prev => ({ ...prev, [site.id]: false }));
      return {
        success: false,
        message: error.message || "Connection failed",
        helpfulMessage: "An unexpected error occurred. Please try again or check your network connection."
      };
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
