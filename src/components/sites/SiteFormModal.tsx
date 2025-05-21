
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
  const { isLoading: isSaving, saveSite } = useSiteSave();
  const { testConnection, isTestingConnection, testResult, lastErrorMessage, helpfulMessage } = useFTPTestConnection();
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setFormSubmitted(true);
    
    // Get form data from the form
    const formData = getFormData(e.target as HTMLFormElement);
    
    // Basic validation for required fields
    if (!formData.serverUrl || !formData.username || !formData.password && !site) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.port && (isNaN(formData.port) || formData.port <= 0 || formData.port > 65535)) {
      toast.error("Please enter a valid port number");
      return;
    }
    
    try {
      // Save site data without requiring successful connection test
      const saveSuccessful = await saveSite(formData, site);
      
      if (saveSuccessful) {
        toast.success(`FTP site ${site ? "updated" : "saved"} successfully`);
        onSave();
      } else {
        toast.error("Failed to save FTP site");
      }
    } catch (error: any) {
      console.error("Error saving site:", error);
      toast.error(`Failed to save FTP site: ${error.message}`);
    } finally {
      setFormSubmitted(false);
    }
  };

  const handleTest = async () => {
    try {
      const form = document.querySelector('form') as HTMLFormElement;
      const formData = getFormData(form);
      setErrorDetails(null);
      
      // Use the testConnection hook that already handles toasts and proper response reading
      const result = await testConnection({
        host: formData.serverUrl,
        port: formData.port,
        username: formData.username,
        password: formData.password,
        existingPassword: site?.encrypted_password,
        directory: formData.rootDirectory
      });
      
      // Display helpful error messages if available
      if (!result.success) {
        if (helpfulMessage) {
          setErrorDetails(helpfulMessage);
        }
        // Also handle specific error cases
        else if (lastErrorMessage && lastErrorMessage.includes("530")) {
          setErrorDetails(
            "Authentication failed. Please check the following:\n" +
            "• Verify username format (sometimes needs domain prefix/suffix)\n" +
            "• Check if password contains special characters that need URL encoding\n" +
            "• Confirm if the server requires FTPS instead of FTP\n" +
            "• Check if there are IP restrictions on the FTP server"
          );
        }
      }
    } catch (error: any) {
      console.error("Error testing connection:", error);
      setErrorDetails(error.message);
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

          {errorDetails && (
            <div className="text-sm p-3 border border-orange-200 bg-orange-50 rounded-md text-orange-800 whitespace-pre-line">
              <p className="font-semibold mb-1">Troubleshooting tips:</p>
              {errorDetails}
            </div>
          )}

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
                disabled={formSubmitted || isSaving}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={formSubmitted || isSaving}
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
