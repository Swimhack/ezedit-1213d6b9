
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FTPConnectionFormFields } from "@/components/FTPConnectionForm";
import { useState } from "react";
import { toast } from "sonner";
import { Loader } from "lucide-react";

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

interface AddSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSiteAdded: (site: Site) => void;
}

export function AddSiteModal({ isOpen, onClose, onSiteAdded }: AddSiteModalProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSaving(true);
    try {
      // Generate a mock ID since we're not actually saving to a database
      const newSite = {
        id: `site-${Date.now()}`,
        ...data
      };
      
      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("New site added!");
      onSiteAdded(newSite);
    } catch (error: any) {
      toast.error(`Error adding site: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add FTP Site</DialogTitle>
        </DialogHeader>
        
        <FTPConnectionFormFields
          defaultValues={{}}
          isEditing={false}
          onSubmit={handleSubmit}
        >
          <div className="flex justify-between mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              Add Site
            </Button>
          </div>
        </FTPConnectionFormFields>
      </DialogContent>
    </Dialog>
  );
}
