
import React from 'react';
import { Button } from "@/components/ui/button";

interface EditorErrorStateProps {
  error: string | null;
  lockError: string | null;
  onReload: () => void;
}

export function EditorErrorState({ error, lockError, onReload }: EditorErrorStateProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-red-500">
      <p className="mb-4">Error: {error || lockError}</p>
      <Button onClick={onReload}>Reload</Button>
    </div>
  );
}
