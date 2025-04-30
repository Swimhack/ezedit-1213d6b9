
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SaveIcon, Lock } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FileEditorToolbarProps {
  fileName: string | null;
  onSave: () => void;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  disabled?: boolean;
}

export function FileEditorToolbar({ 
  fileName, 
  onSave, 
  isSaving, 
  hasUnsavedChanges,
  disabled = false
}: FileEditorToolbarProps) {
  const handleSave = () => {
    if (disabled) {
      toast.error("Editing requires a paid subscription");
      return;
    }
    
    if (!fileName) {
      toast.error("No file selected");
      return;
    }
    
    onSave();
  };

  return (
    <div className="flex items-center justify-between p-2 border-b border-ezgray-dark bg-eznavy-light">
      <div className="flex items-center">
        <span className="text-sm text-ezgray-light ml-2 truncate max-w-[300px]">
          {fileName || "No file selected"}
        </span>
      </div>
      
      <div className="flex items-center space-x-2">
        {hasUnsavedChanges && (
          <span className="text-xs italic text-amber-400">
            Unsaved changes
          </span>
        )}
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving || !fileName || disabled}
                className={`relative ${disabled ? 'bg-slate-700' : 'bg-ezblue hover:bg-ezblue-light'}`}
              >
                {disabled ? (
                  <Lock className="h-4 w-4 mr-2" />
                ) : (
                  <SaveIcon className="h-4 w-4 mr-2" />
                )}
                {isSaving ? "Saving..." : disabled ? "Locked" : "Save"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {disabled ? "Upgrade to edit files" : "Save changes"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
