
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import { useDropzone } from "react-dropzone";

interface UploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ftpHost: string;
  ftpPort: number;
  ftpUser: string;
  ftpPassword: string;
  currentPath: string;
  onUploadComplete: () => void;
}

export function UploadDialog({
  isOpen,
  onClose,
  ftpHost,
  ftpPort,
  ftpUser,
  ftpPassword,
  currentPath,
  onUploadComplete
}: UploadDialogProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0]);
      }
    },
    maxFiles: 1
  });

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("No file selected");
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Here you would call your upload function
      // await uploadFile(ftpHost, ftpPort, ftpUser, ftpPassword, currentPath, selectedFile);
      
      toast.success(`${selectedFile.name} uploaded successfully`);
      onUploadComplete();
      onClose();
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
        </DialogHeader>
        
        <div className="p-4">
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-10 w-10 mx-auto text-gray-400" />
            {selectedFile ? (
              <div className="mt-2">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm font-medium">{selectedFile.name}</span>
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-500">
                {isDragActive ? "Drop the file here" : "Drag and drop a file here, or click to select a file"}
              </p>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
