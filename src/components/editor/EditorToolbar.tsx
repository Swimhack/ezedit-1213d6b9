
import { Save, FileCode2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EditorToolbarProps {
  filePath: string;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  onSave: () => void;
}

export function EditorToolbar({ filePath, isSaving, hasUnsavedChanges, onSave }: EditorToolbarProps) {
  return (
    <div className="flex items-center justify-between p-2 border-b border-ezgray-dark">
      <div className="flex items-center space-x-2">
        <FileCode2 size={16} />
        <span className="text-sm truncate">
          {filePath ? filePath : "No file selected"}
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onSave}
          disabled={!filePath || isSaving || !hasUnsavedChanges}
        >
          {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
        </Button>
      </div>
    </div>
  );
}
