
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { FTPSite } from "@/hooks/use-ftp-sites";

export function useSiteSave() {
  const [isLoading, setIsLoading] = useState(false);

  const saveSite = async (
    formData: {
      siteName: string;
      serverUrl: string;
      port: number;
      username: string;
      password: string;
      rootDirectory: string;
    },
    site: FTPSite | null
  ) => {
    setIsLoading(true);
    
    try {
      // Validate only required fields
      if (!formData.serverUrl) {
        toast.error("Server URL is required");
        setIsLoading(false);
        return false;
      }

      if (!formData.username) {
        toast.error("Username is required");
        setIsLoading(false);
        return false;
      }

      // Only validate password for new sites (not editing)
      if (!site && !formData.password) {
        toast.error("Password is required for new sites");
        setIsLoading(false);
        return false;
      }

      if (isNaN(formData.port) || formData.port <= 0 || formData.port > 65535) {
        toast.error("Please enter a valid port number");
        setIsLoading(false);
        return false;
      }

      // Get current user ID
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error("You must be logged in to save a site");
        setIsLoading(false);
        return false;
      }

      console.log("Saving site with user ID:", session.user.id);

      // For updates, only include password if provided new one
      const passwordField = formData.password ? { encrypted_password: formData.password } : {};

      // Prepare the data object for upsert
      const upsertData: any = {
        ...(site?.id ? { id: site.id } : {}),
        server_url: formData.serverUrl,
        port: formData.port,
        username: formData.username,
        ...passwordField,
        user_id: session.user.id,
        updated_at: new Date().toISOString()
      };
      
      // Only add site_name if it's not empty
      if (formData.siteName) {
        upsertData.site_name = formData.siteName;
      }

      // Add root directory if provided
      if (formData.rootDirectory) {
        upsertData.root_directory = formData.rootDirectory;
      }

      // Save or update site to ftp_credentials table
      const { error } = await supabase
        .from("ftp_credentials")
        .upsert(upsertData)
        .select().single();

      if (error) {
        console.error("Error saving site:", error);
        toast.error(`Failed to save site: ${error.message}`);
        return false;
      }

      toast.success(`FTP site ${site ? 'updated' : 'added'} successfully`);
      return true;
    } catch (error: any) {
      console.error("Error in saveSite:", error);
      toast.error(`Failed to save site: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    saveSite
  };
}
