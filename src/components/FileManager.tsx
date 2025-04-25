
import { FileProvider } from "@/contexts/FileContext";
import FileToolbar from "./FileToolbar";
import FileGrid from "./FileGrid";

const FileManager = () => {
  return (
    <FileProvider>
      <div className="bg-eznavy-light rounded-lg p-6">
        <FileToolbar />
        <FileGrid />
      </div>
    </FileProvider>
  );
};

export default FileManager;
