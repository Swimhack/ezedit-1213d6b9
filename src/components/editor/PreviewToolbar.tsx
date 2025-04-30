
import React from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PreviewToolbarProps {
  onManualRefresh: () => void;
}

export function PreviewToolbar({ onManualRefresh }: PreviewToolbarProps) {
  return (
    <div className="p-2 bg-gray-100 text-xs font-mono border-t border-b flex-none flex justify-between">
      <span>Preview</span>
      <Button
        size="sm"
        variant="ghost"
        onClick={onManualRefresh}
        className="p-0 h-4"
        title="Refresh preview"
      >
        <RefreshCw size={12} />
      </Button>
    </div>
  );
}
