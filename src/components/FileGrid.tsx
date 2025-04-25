
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileIcon, FolderIcon, Trash2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useFiles } from "@/contexts/FileContext";

const FileGrid = () => {
  const { 
    files, 
    isLoading, 
    currentFolder, 
    searchQuery,
    navigateToFolder,
    downloadFile,
    deleteFile
  } = useFiles();

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-pulse text-ezgray">Loading files...</div>
      </div>
    );
  }

  if (filteredFiles.length === 0) {
    return (
      <div className="text-center py-10 text-ezgray">
        {searchQuery ? "No files match your search" : "No files found in this folder"}
      </div>
    );
  }

  return (
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
  );
};

export default FileGrid;
