
import { useState } from "react";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FTPConnectionFormFields, type FTPConnectionFormData } from "./FTPConnectionForm";
import { useFTPTestConnection } from "@/hooks/use-ftp-test-connection";

interface Site {
  id: string;
  server_name: string;
  host: string;
  username: string;
  password: string;
  port: number;
  web_url?: string | null;
  root_directory?: string | null;
}

interface FTPConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (site: Site) => void;
  editConnection?: Site;
}

const FTPConnectionModal = ({ isOpen, onClose, onSave, editConnection }: FTPConnectionModalProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const { isTestingConnection, testConnection, testResult } = useFTPTestConnection();

  const handleSubmit = async (data: FTPConnectionFormData) => {
    setIsSaving(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        throw new Error("User not authenticated");
      }
      
      const user_id = sessionData.session.user.id;
      
      const finalData = {
        ...data,
        password: data.password || (editConnection?.password || ''),
      };

      // Create the updated site object
      const updatedSite: Site = {
        id: editConnection?.id || `site-${Date.now()}`,
        server_name: finalData.server_name,
        host: finalData.host,
        username: finalData.username,
        password: finalData.password,
        port: finalData.port,
        root_directory: finalData.root_directory || null,
        web_url: finalData.web_url || null
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success(editConnection ? "Connection updated!" : "New connection added!");
      onSave(updatedSite);
    } catch (error: any) {
      toast.error(`Error saving connection: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    const formData = document.querySelector('form')!;
    const formElements = formData.elements as any;
    
    await testConnection({
      host: formElements.host.value,
      port: parseInt(formElements.port.value) || 21,
      username: formElements.username.value,
      password: formElements.password.value,
      existingPassword: editConnection?.password
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editConnection ? 'Edit FTP Connection' : 'Add FTP Connection'}</DialogTitle>
        </DialogHeader>
        
        <FTPConnectionFormFields
          defaultValues={editConnection || {}}
          isEditing={!!editConnection}
          onSubmit={handleSubmit}
        >
          <DialogFooter className="flex sm:justify-between gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleTestConnection}
              disabled={isTestingConnection}
            >
              {isTestingConnection && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              Test Connection
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="bg-ezblue hover:bg-ezblue/90">
                {isSaving && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                {editConnection ? 'Update Connection' : 'Save Connection'}
              </Button>
            </div>
          </DialogFooter>
        </FTPConnectionFormFields>
      </DialogContent>
    </Dialog>
  );
};

export default FTPConnectionModal;
