
import React from 'react';
import { Button } from "@/components/ui/button";
import { useTinyMCELogs } from "@/hooks/useTinyMCELogs";

interface EditorErrorStateProps {
  error: string | null;
  lockError: string | null;
  onReload: () => void;
  filePath?: string;
}

export function EditorErrorState({ error, lockError, onReload, filePath }: EditorErrorStateProps) {
  const { addLog } = useTinyMCELogs();
  
  React.useEffect(() => {
    if (error || lockError) {
      // Log the error with file context
      const errorMessage = `Editor Error: ${error || lockError} ${filePath ? `for file: ${filePath}` : ''}`;
      addLog(errorMessage, "error", "content");
    }
  }, [error, lockError, filePath, addLog]);

  return (
    <div className="h-full flex flex-col items-center justify-center text-red-500">
      <p className="mb-4">Error: {error || lockError}</p>
      <Button onClick={onReload}>Reload</Button>
      <p className="mt-4 text-xs text-gray-500">
        This error has been logged for troubleshooting.
      </p>
    </div>
  );
}
