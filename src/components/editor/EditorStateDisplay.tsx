
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { useEffect } from "react";
import { useTinyMCELogs } from "@/hooks/useTinyMCELogs";

interface EditorStateDisplayProps {
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
  filePath?: string;
}

export function EditorStateDisplay({ 
  isLoading, 
  error, 
  onRetry,
  filePath
}: EditorStateDisplayProps) {
  const { addLog } = useTinyMCELogs();
  
  useEffect(() => {
    if (error) {
      // Log errors to both local storage and server
      addLog(`Editor loading error: ${error} ${filePath ? `for file: ${filePath}` : ''}`, "error", "content");
    }
  }, [error, filePath, addLog]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="text-center text-red-500">
          <p className="text-xl font-bold mb-2">Error Loading File</p>
          <p className="mb-4">{error}</p>
          {isLoading && (
            <div className="flex items-center justify-center mb-4">
              <Loader className="h-6 w-6 animate-spin text-ezblue mr-2" />
              <span>Retrying...</span>
            </div>
          )}
          {!isLoading && onRetry && (
            <Button 
              variant="outline" 
              className="mt-2 btn-retry" 
              onClick={onRetry}
            >
              Retry
            </Button>
          )}
          <div className="mt-4 text-sm text-gray-500 max-w-md mx-auto">
            <p>This could be due to:</p>
            <ul className="list-disc text-left ml-8 mt-2">
              <li>Network connectivity issues</li>
              <li>File permissions on the FTP server</li>
              <li>The file may be too large or have special characters</li>
            </ul>
            <p className="mt-2 text-xs">
              This error has been logged for troubleshooting.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader className="h-8 w-8 animate-spin text-ezblue mb-3" />
        <span className="text-ezblue">Loading file...</span>
      </div>
    );
  }

  return null;
}
