
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { FileIcon, FolderIcon, Trash2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import FileUploader from "./FileUploader";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const FileManager = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFolder, setCurrentFolder] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Create a bucket if it doesn't exist when component mounts
  useEffect(() => {
    const createBucketIfNeeded = async () => {
      try {
        // Check if user files bucket exists
        const { data: buckets, error } = await supabase.storage.listBuckets();
        
        if (error) {
          console.error("Error checking buckets:", error);
          return;
        }
        
        const userBucket = buckets?.find(bucket => bucket.name === "user-files");
        
        // If bucket doesn't exist, we can't create it from frontend
        // This would need to be done via SQL migrations
        if (!userBucket) {
          toast.error("File storage is not configured. Please contact support.");
        }
      } catch (error) {
        console.error("Error setting up storage:", error);
      }
    };
    
    createBucketIfNeeded();
  }, []);

  // Load files from Supabase Storage
  useEffect(() => {
    const loadFiles = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase.storage
          .from("user-files")
          .list(currentFolder, {
            sortBy: { column: "name", order: "asc" },
          });
          
        if (error) {
          console.error("Error loading files:", error);
          toast.error("Could not load files. Please try again.");
          return;
        }
        
        setFiles(data || []);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFiles();
  }, [currentFolder]);

  const handleFileUploadComplete = () => {
    // Reload files after upload
    setFiles([]);
    toast.success("File uploaded successfully!");
    
    // Reload the file list
    supabase.storage
      .from("user-files")
      .list(currentFolder, {
        sortBy: { column: "name", order: "asc" },
      })
      .then(({ data, error }) => {
        if (error) {
          console.error("Error reloading files:", error);
          return;
        }
        setFiles(data || []);
      });
  };

  const navigateToFolder = (folderPath: string) => {
    setCurrentFolder(folderPath);
  };

  const navigateUp = () => {
    // Go up one level in the folder structure
    const pathParts = currentFolder.split("/").filter(Boolean);
    pathParts.pop();
    setCurrentFolder(pathParts.length > 0 ? pathParts.join("/") + "/" : "");
  };

  const downloadFile = async (fileName: string) => {
    try {
      const filePath = currentFolder + fileName;
      
      const { data, error } = await supabase.storage
        .from("user-files")
        .download(filePath);
        
      if (error) {
        toast.error("Error downloading file");
        console.error("Error downloading file:", error);
        return;
      }
      
      // Create a download link
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const deleteFile = async (fileName: string) => {
    try {
      const filePath = currentFolder + fileName;
      
      const { error } = await supabase.storage
        .from("user-files")
        .remove([filePath]);
        
      if (error) {
        toast.error("Error deleting file");
        console.error("Error deleting file:", error);
        return;
      }
      
      // Remove from state
      setFiles(files.filter(file => file.name !== fileName));
      toast.success("File deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // Filter files based on search query
  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-eznavy-light rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-ezwhite">
            {currentFolder ? `Folder: ${currentFolder}` : 'My Files'}
          </h2>
          {currentFolder && (
            <Button 
              variant="outline" 
              onClick={navigateUp}
              className="border-ezgray-dark text-ezgray hover:text-ezwhite hover:border-ezblue"
            >
              Go Back
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 bg-eznavy border-ezgray-dark text-ezwhite"
          />
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-ezblue text-eznavy hover:bg-ezblue-light">
                Upload File
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-eznavy-light border-ezgray-dark">
              <DialogHeader>
                <DialogTitle className="text-ezwhite">Upload File</DialogTitle>
              </DialogHeader>
              <FileUploader 
                currentFolder={currentFolder} 
                onUploadComplete={handleFileUploadComplete} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-pulse text-ezgray">Loading files...</div>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-10 text-ezgray">
          {searchQuery ? "No files match your search" : "No files found in this folder"}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFiles.map((file) => (
            <Card 
              key={file.id} 
              className="bg-eznavy border-ezgray-dark hover:border-ezblue transition-colors p-4"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-2">
                  {file.metadata?.mimetype?.startsWith("image/") ? (
                    <img 
                      src={supabase.storage.from("user-files").getPublicUrl(currentFolder + file.name).data.publicUrl}
                      alt={file.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : file.metadata?.isDir ? (
                    <FolderIcon className="w-10 h-10 text-ezblue" />
                  ) : (
                    <FileIcon className="w-10 h-10 text-ezgray" />
                  )}
                  
                  <div className="flex gap-2">
                    {!file.metadata?.isDir && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => downloadFile(file.name)}
                        className="hover:text-ezblue"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => deleteFile(file.name)}
                      className="hover:text-ezblue"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div 
                  className="mt-2 text-sm font-medium text-ezwhite overflow-hidden text-ellipsis cursor-pointer"
                  onClick={() => {
                    if (file.metadata?.isDir) {
                      navigateToFolder(currentFolder + file.name + "/");
                    }
                  }}
                  title={file.name}
                >
                  {file.name}
                </div>
                
                <div className="text-xs text-ezgray mt-1">
                  {!file.metadata?.isDir && file.metadata?.size && (
                    `${(file.metadata.size / 1024).toFixed(2)} KB`
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileManager;
