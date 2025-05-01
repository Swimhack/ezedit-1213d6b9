
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditorErrorRetryProps {
  message?: string;
  onRetry: () => void;
  errorDetails?: string | null;
}

export function EditorErrorRetry({ message, onRetry, errorDetails }: EditorErrorRetryProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      
      <h3 className="text-lg font-semibold mb-2">
        {message || "Failed to load editor content"}
      </h3>
      
      <p className="text-muted-foreground text-center mb-4 max-w-md">
        The editor couldn't properly load your file content. This might be due to network issues or an interrupted connection.
      </p>
      
      {errorDetails && (
        <div className="bg-muted/50 p-3 rounded-md text-xs font-mono mb-4 max-w-md overflow-auto max-h-32">
          <code>{errorDetails}</code>
        </div>
      )}
      
      <Button 
        onClick={onRetry}
        className="flex items-center gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Retry Loading
      </Button>
    </div>
  );
}
