
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

interface DeleteFileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ftpHost: string;
  ftpPort: number;
  ftpUser: string;
  ftpPassword: string;
  currentPath: string;
  fileToDelete: string | null;
  onUploadComplete: () => void;
}

export function DeleteFileDialog({
  isOpen,
  onClose,
  ftpHost,
  ftpPort,
  ftpUser,
  ftpPassword,
  currentPath,
  fileToDelete,
  onUploadComplete
}: DeleteFileDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!fileToDelete) {
      toast.error("No file selected for deletion");
      return;
    }
    
    setIsDeleting(true);
    
    try {
      // Here you would call your delete function
      // await deleteFile(ftpHost, ftpPort, ftpUser, ftpPassword, currentPath + '/' + fileToDelete);
      
      toast.success(`${fileToDelete} deleted successfully`);
      onUploadComplete();
      onClose();
    } catch (error: any) {
      toast.error(`Failed to delete file: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Confirm Deletion
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-4">
          <p className="mb-4">
            Are you sure you want to delete <strong>{fileToDelete}</strong>?
          </p>
          <p className="text-red-500 text-sm">
            This action cannot be undone.
          </p>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
