
import React from "react";
import { Save, Undo, Redo, FileCode, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface EditorToolbarProps {
  filePath: string | null;
  onSave: () => Promise<void>;
  onFormat: () => void;
  onUndo: () => void;
  onRedo: () => void;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  isPremium: boolean;
}

export function EditorToolbar({
  filePath,
  onSave,
  onFormat,
  onUndo,
  onRedo,
  isSaving,
  hasUnsavedChanges,
  isPremium
}: EditorToolbarProps) {
  const fileName = filePath ? filePath.split('/').pop() : null;
  
  return (
    <div className="border-b bg-gray-50 dark:bg-gray-800 p-2 flex items-center">
      <div className="flex items-center space-x-2 mr-4">
        <FileCode size={16} className="text-gray-500" />
        <span className="font-medium text-sm">
          {fileName || "No file selected"}
        </span>
        {hasUnsavedChanges && (
          <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-1.5 py-0.5 rounded">
            Modified
          </span>
        )}
      </div>
      
      <div className="flex-grow"></div>
      
      <div className="flex items-center space-x-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onUndo}
              disabled={!filePath || !isPremium}
            >
              <Undo size={16} />
              <span className="sr-only">Undo</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRedo}
              disabled={!filePath || !isPremium}
            >
              <Redo size={16} />
              <span className="sr-only">Redo</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onFormat}
              disabled={!filePath || !isPremium}
            >
              <span className="text-sm">{ }</span>
              <span>Format</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Format Document (Alt+Shift+F)</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={hasUnsavedChanges ? "default" : "ghost"}
              size="sm"
              onClick={onSave}
              disabled={!filePath || isSaving || !hasUnsavedChanges || !isPremium}
              className={cn(
                "flex items-center gap-1", 
                isPremium ? "" : "cursor-not-allowed"
              )}
            >
              {isPremium ? (
                isSaving ? (
                  <>
                    <div className="h-3 w-3 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save</span>
                  </>
                )
              ) : (
                <>
                  <Lock size={16} />
                  <span>Premium</span>
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isPremium ? "Save (Ctrl+S)" : "Upgrade to premium to save files"}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
