
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
              onUploadComplete={refreshFiles} 
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default FileToolbar;
