
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";

interface EditorStateDisplayProps {
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export function EditorStateDisplay({ 
  isLoading, 
  error, 
  onRetry 
}: EditorStateDisplayProps) {
  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center text-red-500">
          <p className="text-xl font-bold">Error</p>
          <p>{error}</p>
          {onRetry && (
            <Button 
              variant="outline" 
              className="mt-2 btn-retry" 
              onClick={onRetry}
            >
              Retry
            </Button>
          )}
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
