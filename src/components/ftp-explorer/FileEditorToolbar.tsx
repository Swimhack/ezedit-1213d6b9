
import React from "react";
import { Button } from "@/components/ui/button";
import { Save, RefreshCw, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface FileEditorToolbarProps {
  fileName: string;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
  onRefresh?: () => void;
  autoSaveEnabled?: boolean;
  isAutoSaving?: boolean; 
  onToggleAutoSave?: () => void;
}

export function FileEditorToolbar({
  fileName,
  hasUnsavedChanges,
  isSaving,
  onSave,
  onRefresh,
  autoSaveEnabled = false,
  isAutoSaving = false,
  onToggleAutoSave
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
            <div className="w-4 h-4 animate-spin rounded-full border-2 border-b-transparent border-white" />
            {isAutoSaving ? "Autosaving..." : "Saving..."}
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
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
      
      {onToggleAutoSave && (
        <div className="flex items-center gap-2">
          <Switch 
            id="autosave" 
            checked={autoSaveEnabled}
            onCheckedChange={onToggleAutoSave}
          />
          <Label htmlFor="autosave" className="text-xs text-gray-600 cursor-pointer flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Autosave
          </Label>
        </div>
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
