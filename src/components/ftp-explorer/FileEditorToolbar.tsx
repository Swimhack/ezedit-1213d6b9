
import React from "react";
import { Button } from "@/components/ui/button";
import { FloppyDisk, Clock, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileEditorToolbarProps {
  fileName: string;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
  onRefresh?: () => void;
}

export function FileEditorToolbar({
  fileName,
  hasUnsavedChanges,
  isSaving,
  onSave,
  onRefresh
}: FileEditorToolbarProps) {
  return (
    <div className="p-2 flex gap-2 items-center border-b bg-gray-50">
      <Button
        size="sm"
        disabled={!hasUnsavedChanges || isSaving}
        onClick={onSave}
        className={cn(
          "flex items-center gap-1",
          hasUnsavedChanges ? "bg-blue-500 hover:bg-blue-600" : ""
        )}
      >
        {isSaving ? (
          <>
            <Clock className="w-4 h-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <FloppyDisk className="w-4 h-4" />
            Save
          </>
        )}
      </Button>
      
      {onRefresh && (
        <Button
          size="sm"
          variant="outline"
          onClick={onRefresh}
          className="flex items-center gap-1"
          title="Refresh file content"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      )}
      
      <div className="flex-1"></div>
      
      <div className="text-sm text-gray-500">
        {hasUnsavedChanges ? (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-orange-500 rounded-full inline-block"></span>
            Unsaved changes
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
            Saved
          </span>
        )}
      </div>
    </div>
  );
}
