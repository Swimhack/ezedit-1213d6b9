
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileEditorToolbarProps {
  fileName: string | null;
  onSave: () => void;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
}

export const FileEditorToolbar = ({ 
  fileName, 
  onSave, 
  isSaving, 
  hasUnsavedChanges 
}: FileEditorToolbarProps) => {
  const displayName = fileName ? fileName.split('/').pop() || 'File Editor' : 'File Editor';

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-ezwhite">
          {displayName}
        </h3>
        {fileName && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onSave}
            disabled={isSaving || !hasUnsavedChanges}
            className="flex items-center gap-1"
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        )}
      </div>
    </div>
  );
};
