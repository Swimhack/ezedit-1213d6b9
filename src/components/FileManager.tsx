
import { FileProvider } from "@/contexts/FileContext";
import FileToolbar from "./FileToolbar";
import FileGrid from "./FileGrid";

const FileManager = () => {
  return (
    <FileProvider>
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <FileToolbar />
        <FileGrid />
      </div>
    </FileProvider>
  );
};

export default FileManager;
