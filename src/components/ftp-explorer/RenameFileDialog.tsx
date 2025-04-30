
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface RenameFileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ftpHost: string;
  ftpPort: number;
  ftpUser: string;
  ftpPassword: string;
  currentPath: string;
  fileToRename: string | null;
  newFileName: string;
  setNewFileName: (name: string) => void;
  onUploadComplete: () => void;
}

export function RenameFileDialog({
  isOpen,
  onClose,
  ftpHost,
  ftpPort,
  ftpUser,
  ftpPassword,
  currentPath,
  fileToRename,
  newFileName,
  setNewFileName,
  onUploadComplete
}: RenameFileDialogProps) {
  const [isRenaming, setIsRenaming] = React.useState(false);

  const handleRename = async () => {
    if (!fileToRename || !newFileName.trim()) {
      toast.error("Please enter a valid file name");
      return;
    }
    
    setIsRenaming(true);
    
    try {
      // Here you would call your rename function
      // await renameFile(ftpHost, ftpPort, ftpUser, ftpPassword, 
      //   currentPath + '/' + fileToRename, 
      //   currentPath + '/' + newFileName);
      
      toast.success(`File renamed to '${newFileName}' successfully`);
      onUploadComplete();
      onClose();
    } catch (error: any) {
      toast.error(`Failed to rename file: ${error.message}`);
    } finally {
      setIsRenaming(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename {fileToRename}</DialogTitle>
        </DialogHeader>
        
        <div className="p-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="current-name">Current Name</Label>
              <Input
                id="current-name"
                value={fileToRename || ''}
                disabled
              />
            </div>
            <div>
              <Label htmlFor="new-name">New Name</Label>
              <Input
                id="new-name"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="Enter new file name"
                autoFocus
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isRenaming}>
            Cancel
          </Button>
          <Button onClick={handleRename} disabled={!newFileName.trim() || isRenaming}>
            {isRenaming ? "Renaming..." : "Rename"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
