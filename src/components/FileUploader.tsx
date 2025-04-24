
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UploadCloud } from "lucide-react";

interface FileUploaderProps {
  currentFolder: string;
  onUploadComplete: () => void;
}

const FileUploader = ({ currentFolder, onUploadComplete }: FileUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      const filePath = `${currentFolder}${file.name}`;
      
      const { error } = await supabase.storage
        .from("user-files")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });
        
      if (error) {
        throw error;
      }
      
      setFile(null);
      onUploadComplete();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Error uploading file");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="p-4 border border-dashed border-ezgray-dark rounded-lg">
      <div className="flex flex-col items-center justify-center gap-4">
        <UploadCloud size={48} className="text-ezblue" />
        
        <div className="text-center">
          <h3 className="text-lg font-medium text-ezwhite">Upload File</h3>
          <p className="text-sm text-ezgray mt-1">
            {file ? file.name : "Select a file to upload"}
          </p>
        </div>
        
        <Input
          id="file-upload"
          type="file"
          onChange={handleFileChange}
          className="hidden"
        />
        
        <label htmlFor="file-upload">
          <Button 
            variant="outline" 
            className="cursor-pointer border-ezgray-dark text-ezgray hover:text-ezwhite hover:border-ezblue"
            onClick={() => document.getElementById("file-upload")?.click()}
            type="button"
          >
            Choose File
          </Button>
        </label>
        
        {file && (
          <Button
            onClick={handleUpload}
            disabled={isUploading}
            className="bg-ezblue text-eznavy hover:bg-ezblue-light w-full"
          >
            {isUploading ? `Uploading... ${uploadProgress}%` : "Upload File"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default FileUploader;
