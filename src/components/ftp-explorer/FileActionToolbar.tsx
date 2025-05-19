
import React from "react";
import { Button } from "@/components/ui/button";
import { Save, Edit, Trash2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";

interface FileActionToolbarProps {
  fileName: string;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  isRenaming?: boolean;
  isDeleting?: boolean;
  onSave?: () => Promise<void> | void;
  onRename?: () => void;
  onDelete?: () => void;
  onCancel?: () => void;
  isError?: boolean;
  errorMessage?: string;
}

export function FileActionToolbar({
  fileName,
  hasUnsavedChanges,
  isSaving,
  isRenaming,
  isDeleting,
  onSave,
  onRename,
  onDelete,
  onCancel,
  isError,
  errorMessage
}: FileActionToolbarProps) {
  const { isPremium } = useSubscription();
  
  const handleSaveClick = async () => {
    if (!isPremium) {
      toast.error("Premium required to save changes");
      return;
    }
    
    if (onSave) {
      try {
        await onSave();
      } catch (err) {
        console.error("Save error:", err);
      }
    }
  };
  
  const handleRenameClick = () => {
    if (!isPremium) {
      toast.error("Premium required to rename files");
      return;
    }
    
    if (onRename) {
      onRename();
    }
  };
  
  const handleDeleteClick = () => {
    if (!isPremium) {
      toast.error("Premium required to delete files");
      return;
    }
    
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <div className="p-2 flex gap-2 items-center border-b bg-gray-50 dark:bg-gray-900">
      <div className="flex-grow">
        <div className="text-sm font-medium truncate">{fileName}</div>
        {isError && (
          <div className="flex items-center text-xs text-red-500 mt-1">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {errorMessage || "An error occurred"}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {!isPremium && (
          <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600 border-gray-300">
            Premium required to save
          </Badge>
        )}
        
        <Button
          size="sm"
          variant="outline"
          disabled={!isPremium || !hasUnsavedChanges || isSaving || isRenaming || isDeleting}
          onClick={handleSaveClick}
          className={cn(
            "flex items-center gap-1",
            hasUnsavedChanges && "border-blue-400"
          )}
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          disabled={!isPremium || isRenaming || isDeleting || isSaving}
          onClick={handleRenameClick}
        >
          <Edit className="h-4 w-4" />
          <span className="sr-only">Rename</span>
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          disabled={!isPremium || isRenaming || isDeleting || isSaving}
          onClick={handleDeleteClick}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
    </div>
  );
}
