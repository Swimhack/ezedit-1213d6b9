
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { FTPSite } from "@/hooks/use-ftp-sites";
import { SiteForm, getFormData } from "./SiteForm";
import { SiteConnectionTestButton } from "./SiteConnectionTest";
import { useSiteSave } from "@/hooks/use-site-save";
import { useFTPTestConnection } from "@/hooks/use-ftp-test-connection";

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
  // We don't need a separate testResult state as the hook now manages it
  const { isLoading: isSaving, saveSite } = useSiteSave();
  const { testConnection, isTestingConnection, testResult } = useFTPTestConnection();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get form data from the form
    const formData = getFormData(e.target as HTMLFormElement);
    
    // Save site data
    const saveSuccessful = await saveSite(formData, site);
    
    if (saveSuccessful) {
      onSave();
    }
  };

  const handleTest = async () => {
    try {
      const form = document.querySelector('form') as HTMLFormElement;
      const formData = getFormData(form);
      
      // Use the testConnection hook that already handles toasts and proper response reading
      await testConnection({
        host: formData.serverUrl,
        port: formData.port,
        username: formData.username,
        password: formData.password,
        existingPassword: site?.encrypted_password
      });
      
    } catch (error: any) {
      console.error("Error testing connection:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {site ? "Edit FTP Site" : "Add FTP Site"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <SiteForm 
            site={site} 
            testResult={testResult} 
          />

          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2 pt-4">
            <SiteConnectionTestButton
              isLoading={isTestingConnection}
              onTestConnection={handleTest}
            />
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {site ? "Update" : "Save"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
