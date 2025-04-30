
import { Button } from "@/components/ui/button";
import { Code, Edit3 } from "lucide-react";

interface EditorModeTabsProps {
  editorMode: 'code' | 'wysiwyg';
  setEditorMode: (mode: 'code' | 'wysiwyg') => void;
  supportsWysiwyg: boolean;
  onRefresh: () => void;
}

export function EditorModeTabs({
  editorMode,
  setEditorMode,
  supportsWysiwyg,
  onRefresh
}: EditorModeTabsProps) {
  return (
    <div className="editor-mode-tabs px-4 py-1">
      {supportsWysiwyg && (
        <div className="flex items-center space-x-2">
          <Button 
            size="sm" 
            variant={editorMode === 'code' ? 'default' : 'outline'}
            onClick={() => setEditorMode('code')}
            className="flex items-center gap-1"
          >
            <Code className="w-4 h-4" />
            Code
          </Button>
          <Button 
            size="sm" 
            variant={editorMode === 'wysiwyg' ? 'default' : 'outline'}
            onClick={() => setEditorMode('wysiwyg')}
            className="flex items-center gap-1"
          >
            <Edit3 className="w-4 h-4" />
            Visual
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onRefresh}
            className="flex items-center gap-1 ml-2"
          >
            Refresh Content
          </Button>
        </div>
      )}
    </div>
  );
}
