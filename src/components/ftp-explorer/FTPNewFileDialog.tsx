
import React from "react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface FTPNewFileDialogProps {
  isOpen: boolean;
  newFileName: string;
  newFileContent: string;
  onNewFileNameChange: (value: string) => void;
  onNewFileContentChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export function FTPNewFileDialog({
  isOpen,
  newFileName,
  newFileContent,
  onNewFileNameChange,
  onNewFileContentChange,
  onCancel,
  onConfirm
}: FTPNewFileDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Create New File</AlertDialogTitle>
          <AlertDialogDescription>
            Enter the name and content for the new file.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              File Name
            </Label>
            <Input 
              id="name" 
              value={newFileName} 
              onChange={(e) => onNewFileNameChange(e.target.value)} 
              className="col-span-3" 
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="content" className="text-right">
              Content
            </Label>
            <Textarea 
              id="content" 
              value={newFileContent} 
              onChange={(e) => onNewFileContentChange(e.target.value)} 
              className="col-span-3" 
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Create</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
