
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import FileUploader from "./FileUploader";
import { useFiles } from "@/contexts/FileContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowLeft, Search, Upload } from "lucide-react";

const FileToolbar = () => {
  const { searchQuery, setSearchQuery, currentFolder, navigateUp, refreshFiles } = useFiles();
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {currentFolder && (
            <Button 
              variant="outline" 
              size={isMobile ? "icon" : "default"}
              onClick={navigateUp}
              className="border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300"
            >
              {isMobile ? <ArrowLeft className="h-4 w-4" /> : "Go Back"}
            </Button>
          )}
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 truncate max-w-[200px] md:max-w-none">
            {currentFolder ? `Folder: ${currentFolder}` : 'My Files'}
          </h2>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-blue-500 text-white hover:bg-blue-600" size={isMobile ? "icon" : "default"}>
              {isMobile ? <Upload className="h-4 w-4" /> : "Upload File"}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-gray-200">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Upload File</DialogTitle>
            </DialogHeader>
            <FileUploader 
              currentFolder={currentFolder} 
              onUploadComplete={refreshFiles} 
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-white border-gray-200 text-gray-900 w-full"
        />
      </div>
    </div>
  );
};

export default FileToolbar;
