
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FolderPlus } from "lucide-react";

interface CreateFolderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ftpHost: string;
  ftpPort: number;
  ftpUser: string;
  ftpPassword: string;
  currentPath: string;
  onUploadComplete: () => void;
}

export function CreateFolderDialog({
  isOpen,
  onClose,
  ftpHost,
  ftpPort,
  ftpUser,
  ftpPassword,
  currentPath,
  onUploadComplete
}: CreateFolderDialogProps) {
  const [folderName, setFolderName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!folderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }
    
    setIsCreating(true);
    
    try {
      // Here you would call your create folder function
      // await createFolder(ftpHost, ftpPort, ftpUser, ftpPassword, currentPath, folderName);
      
      toast.success(`Folder '${folderName}' created successfully`);
      onUploadComplete();
      onClose();
      setFolderName('');
    } catch (error: any) {
      toast.error(`Failed to create folder: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
        </DialogHeader>
        
        <div className="p-4">
          <div className="flex items-center gap-4">
            <FolderPlus className="h-10 w-10 text-gray-400" />
            <div className="flex-1">
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Enter folder name"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                The folder will be created in the current directory: {currentPath || '/'}
              </p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!folderName.trim() || isCreating}>
            {isCreating ? "Creating..." : "Create Folder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
