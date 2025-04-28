
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { UploadCloud, Loader } from "lucide-react";
import { toast } from "sonner";
import { uploadFile } from "@/lib/ftp";

export default function EzUploader({
  connectionId,
  currentPath,
  onUploadComplete
}: {
  connectionId: string;
  currentPath: string;
  onUploadComplete?: () => void;
}) {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return;

      setIsUploading(true);
      const uploadPromises = acceptedFiles.map(async file => {
        try {
          await uploadFile(connectionId, currentPath, file);
          return { file: file.name, success: true };
        } catch (error) {
          console.error("Upload error:", error);
          return { file: file.name, success: false, error };
        }
      });

      const results = await Promise.all(uploadPromises);
      const success = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      if (success > 0 && failed === 0) {
        toast.success(`Successfully uploaded ${success} file(s)`);
      } else if (success > 0 && failed > 0) {
        toast.warning(`Uploaded ${success} file(s), ${failed} failed`);
      } else {
        toast.error(`Failed to upload ${failed} file(s)`);
      }

      setIsUploading(false);
      if (onUploadComplete) {
        onUploadComplete();
      }
    },
    [connectionId, currentPath, onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
        ${
          isDragActive
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-400"
        }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-3">
          <UploadCloud className="h-6 w-6 text-blue-500" />
        </div>
        {isUploading ? (
          <div className="flex items-center space-x-2">
            <Loader className="h-4 w-4 animate-spin" />
            <span>Uploading files...</span>
          </div>
        ) : (
          <>
            <div>
              <p className="text-sm font-medium">
                {isDragActive ? "Drop the files here" : "Drag & drop files here"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                or click to select files
              </p>
            </div>
            <Button type="button" size="sm" variant="outline">
              Select Files
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
