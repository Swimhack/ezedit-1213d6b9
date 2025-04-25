
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type FileContextType = {
  files: any[];
  isLoading: boolean;
  currentFolder: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setCurrentFolder: (folder: string) => void;
  refreshFiles: () => void;
  navigateToFolder: (folderPath: string) => void;
  navigateUp: () => void;
  downloadFile: (fileName: string) => Promise<void>;
  deleteFile: (fileName: string) => Promise<void>;
};

const FileContext = createContext<FileContextType | null>(null);

export const FileProvider = ({ children }: { children: ReactNode }) => {
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFolder, setCurrentFolder] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

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

  useEffect(() => {
    loadFiles();
  }, [currentFolder]);

  const refreshFiles = () => {
    loadFiles();
  };

  const navigateToFolder = (folderPath: string) => {
    setCurrentFolder(folderPath);
  };

  const navigateUp = () => {
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
      
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      
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
      
      setFiles(files.filter(file => file.name !== fileName));
      toast.success("File deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <FileContext.Provider 
      value={{
        files,
        isLoading,
        currentFolder,
        searchQuery,
        setSearchQuery,
        setCurrentFolder,
        refreshFiles,
        navigateToFolder,
        navigateUp,
        downloadFile,
        deleteFile,
      }}
    >
      {children}
    </FileContext.Provider>
  );
};

export const useFiles = () => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error("useFiles must be used within a FileProvider");
  }
  return context;
};
