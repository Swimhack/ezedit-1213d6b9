
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import FileUploader from "./FileUploader";
import { useFiles } from "@/contexts/FileContext";

const FileToolbar = () => {
  const { searchQuery, setSearchQuery, currentFolder, navigateUp, refreshFiles } = useFiles();

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {currentFolder ? `Folder: ${currentFolder}` : 'My Files'}
        </h2>
        {currentFolder && (
          <Button 
            variant="outline" 
            onClick={navigateUp}
            className="border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300"
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
          className="w-64 bg-white border-gray-200 text-gray-900"
        />
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-blue-500 text-white hover:bg-blue-600">
              Upload File
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
    </div>
  );
};

export default FileToolbar;
