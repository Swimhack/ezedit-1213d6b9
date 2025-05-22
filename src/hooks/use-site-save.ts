
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
    console.log("Starting saveSite with formData:", formData); 
    console.log("Existing site:", existingSite);
    
    setIsLoading(true);

    try {
      // Get the current user session to get the user ID
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log("Session data:", sessionData);
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        throw new Error(`Authentication error: ${sessionError.message}`);
      }

      if (!sessionData?.session?.user) {
        console.error("No user in session");
        toast.error("You must be logged in to save sites");
        return false;
      }

      const userId = sessionData.session.user.id;
      console.log("User ID for save operation:", userId);

      // Format data for database consistency with exact field names matching the DB schema
      const preparedData = {
        user_id: userId,
        site_name: formData.siteName || null,
        server_url: formData.serverUrl,
        port: formData.port || 21,
        username: formData.username,
        encrypted_password: formData.password, // Match exactly with DB column name
        root_directory: formData.rootDirectory || null
      };
      
      console.log("Prepared data for Supabase:", preparedData);

      let result;
      
      // Prepare the data object based on whether it's a new site or an update
      if (existingSite) {
        console.log("Updating existing site with ID:", existingSite.id);
        
        // Update existing site with or without password change
        if (formData.password) {
          result = await supabase
            .from("ftp_credentials")
            .update(preparedData)
            .eq("id", existingSite.id)
            .eq("user_id", userId);
        } else {
          // If no password provided, don't update the password field
          const { encrypted_password, ...dataWithoutPassword } = preparedData;
          result = await supabase
            .from("ftp_credentials")
            .update(dataWithoutPassword)
            .eq("id", existingSite.id)
            .eq("user_id", userId);
        }
      } else {
        console.log("Inserting new site");
        // Insert new site - password is required for new sites
        result = await supabase
          .from("ftp_credentials")
          .insert(preparedData);
      }
      
      console.log("Supabase operation complete. Result:", result);
      
      if (result.error) {
        console.error("Supabase error on save:", result.error);
        throw new Error(`Database error: ${result.error.message}`);
      }

      console.log("Site saved successfully");
      return true;
    } catch (error: any) {
      console.error("Error in saveSite function:", error);
      toast.error(`Failed to save FTP site: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { saveSite, isLoading };
}
