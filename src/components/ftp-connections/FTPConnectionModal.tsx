
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { FtpConnection } from "@/hooks/use-ftp-connections";
import { FTPConnectionForm, getFormData } from "./FTPConnectionForm";
import { FTPConnectionTestButton } from "./FTPConnectionTest";
import { useFTPTestConnection } from "@/hooks/use-ftp-test-connection";

interface FTPConnectionModalProps {
  isOpen: boolean;
  editingConnection: FtpConnection | null;
  onClose: () => void;
  onSave: () => void;
}

export function FTPConnectionModal({
  isOpen,
  editingConnection,
  onClose,
  onSave
}: FTPConnectionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { testConnection, isTestingConnection, testResult } = useFTPTestConnection();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const form = e.target as HTMLFormElement;
      const { serverName, host, port, username, password } = getFormData(form);
      
      // Validate form
      if (!host || !username || !password) {
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
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        toast.error("You must be logged in to save a connection");
        setIsLoading(false);
        return;
      }

      // Save or update connection
      const { data, error } = await supabase
        .from("ftp_connections")
        .upsert({
          id: editingConnection?.id || undefined,
          server_name: serverName,
          host,
          port,
          username,
          password,
          user_id: currentUser.id
        })
        .select();

      if (error) {
        console.error("Error saving connection:", error);
        toast.error(`Failed to save connection: ${error.message}`);
        setIsLoading(false);
        return;
      }

      toast.success(`FTP connection ${editingConnection ? 'updated' : 'added'} successfully`);
      onSave();
      onClose();
    } catch (error: any) {
      console.error("Error in handleSubmit:", error);
      toast.error(`Failed to save connection: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    const form = document.querySelector('form')!;
    const { host, port, username, password } = getFormData(form);
    
    // Use the hook-based test connection function that properly handles the response
    await testConnection({
      host, 
      port, 
      username, 
      password
    });
    
    // The testConnection hook already handles toasts and state updates
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingConnection ? "Edit FTP Connection" : "Add FTP Connection"}
          </DialogTitle>
        </DialogHeader>

        <FTPConnectionForm
          editingConnection={editingConnection}
          isLoading={isLoading || isTestingConnection}
          testResult={testResult}
          onSubmit={handleSubmit}
        />

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0">
          <FTPConnectionTestButton
            isLoading={isTestingConnection}
            onStartTest={handleTest}
          />
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading || isTestingConnection}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || isTestingConnection}
              onClick={(e) => {
                const form = document.querySelector('form');
                if (form) {
                  form.dispatchEvent(new Event('submit', { cancelable: true }));
                }
              }}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editingConnection ? "Update" : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
