
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { FTPSite } from "@/hooks/use-ftp-sites";
import { SiteFormForm, getFormData } from "./SiteFormForm";
import { SiteConnectionTestButton, testSiteConnection } from "./SiteConnectionTest";

interface SiteFormModalProps {
  isOpen: boolean;
  site: FTPSite | null;
  onClose: () => void;
  onSave: () => void;
}

export function SiteFormModal({
  isOpen,
  site,
  onClose,
  onSave
}: SiteFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Get form data
      const form = e.target as HTMLFormElement;
      const { siteName, serverUrl, port, username, password } = getFormData(form);
      
      // Validate form
      if (!serverUrl || !username || (!password && !site)) {
        toast.error("Please fill in all required fields");
        setIsLoading(false);
        return;
      }

      if (isNaN(port) || port <= 0 || port > 65535) {
        toast.error("Please enter a valid port number");
        setIsLoading(false);
        return;
      }

      // Get current user ID
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error("You must be logged in to save a site");
        setIsLoading(false);
        return;
      }

      console.log("Saving site with user ID:", session.user.id);

      // For updates, only include password if provided new one
      const passwordField = password ? { encrypted_password: password } : {};

      // Prepare the data object for upsert
      const upsertData: any = {
        ...(site?.id ? { id: site.id } : {}),
        server_url: serverUrl,
        port: port,
        username,
        ...passwordField,
        user_id: session.user.id,
        updated_at: new Date().toISOString()
      };
      
      // Only add site_name if it's not empty
      if (siteName) {
        upsertData.site_name = siteName;
      }

      // Save or update site
      const { error } = await supabase
        .from("ftp_credentials")
        .upsert(upsertData)
        .select().single();

      if (error) {
        console.error("Error saving site:", error);
        toast.error(`Failed to save site: ${error.message}`);
        setIsLoading(false);
        return;
      }

      toast.success(`FTP site ${site ? 'updated' : 'added'} successfully`);
      onSave();
    } catch (error: any) {
      console.error("Error in handleSubmit:", error);
      toast.error(`Failed to save site: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      // Get form data without submitting the form
      const form = document.querySelector('form') as HTMLFormElement;
      if (!form) {
        toast.error("Form not found");
        setIsLoading(false);
        return;
      }
      
      const { serverUrl, port, username, password } = getFormData(form);
      
      // Test connection
      const result = await testSiteConnection(
        serverUrl, 
        port, 
        username, 
        password,
        site?.encrypted_password
      );
      
      setTestResult(result);
      
      if (result.success) {
        toast.success("Connection test successful!");
      } else {
        toast.error(`Connection test failed: ${result.message || "Unknown error"}`);
      }
    } catch (error: any) {
      console.error("Error testing connection:", error);
      setTestResult({
        success: false,
        message: error.message || "Connection failed"
      });
      toast.error(`Connection test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {site ? "Edit FTP Site" : "Add FTP Site"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <SiteFormForm
            site={site}
            isLoading={isLoading}
            testResult={testResult}
          />

          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0">
            <SiteConnectionTestButton
              isLoading={isLoading}
              onTestConnection={handleTest}
            />
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {site ? "Update" : "Save"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
