
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { FTPSite } from "@/hooks/use-ftp-sites";

interface SiteFormData {
  siteName?: string;
  serverUrl: string;
  port: number;
  username: string;
  password: string;
  rootDirectory?: string;
}

export function useSiteSave() {
  const [isLoading, setIsLoading] = useState(false);

  const saveSite = async (
    formData: SiteFormData,
    existingSite: FTPSite | null
  ): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Get the current user session to get the user ID
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error(`Authentication error: ${sessionError.message}`);
      }

      if (!sessionData?.session?.user) {
        toast.error("You must be logged in to save sites");
        return false;
      }

      const userId = sessionData.session.user.id;

      if (existingSite) {
        // Update existing site
        if (formData.password) {
          // If password is provided, update it along with other fields
          const result = await supabase
            .from("ftp_credentials")
            .update({
              user_id: userId,
              site_name: formData.siteName || null,
              server_url: formData.serverUrl,
              port: formData.port || 21,
              username: formData.username,
              encrypted_password: formData.password,
              root_directory: formData.rootDirectory || null
              // Let updated_at be handled by Supabase defaults
            })
            .eq("id", existingSite.id)
            .eq("user_id", userId);
            
          if (result.error) {
            throw result.error;
          }
        } else {
          // Update without changing the password
          const result = await supabase
            .from("ftp_credentials")
            .update({
              user_id: userId,
              site_name: formData.siteName || null,
              server_url: formData.serverUrl,
              port: formData.port || 21,
              username: formData.username,
              root_directory: formData.rootDirectory || null
              // Let updated_at be handled by Supabase defaults
            })
            .eq("id", existingSite.id)
            .eq("user_id", userId);
            
          if (result.error) {
            throw result.error;
          }
        }
      } else {
        // Insert new site - ensure encrypted_password is always provided
        const result = await supabase
          .from("ftp_credentials")
          .insert({
            user_id: userId,
            site_name: formData.siteName || null,
            server_url: formData.serverUrl,
            port: formData.port || 21,
            username: formData.username,
            encrypted_password: formData.password, // Required field in schema
            root_directory: formData.rootDirectory || null
            // Let created_at and updated_at be handled by Supabase defaults
          });

        if (result.error) {
          throw result.error;
        }
      }

      toast.success(
        `FTP site ${existingSite ? "updated" : "saved"} successfully`
      );
      return true;
    } catch (error: any) {
      console.error("Error saving FTP site:", error);
      toast.error(`Failed to save FTP site: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { saveSite, isLoading };
}
