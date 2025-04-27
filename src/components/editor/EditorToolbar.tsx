import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading,
  Undo,
  Redo
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export interface EditorToolbarProps {
  editor?: any; // Make editor optional since code editor doesn't need it
  filePath?: string;
  isSaving?: boolean;
  hasUnsavedChanges?: boolean;
  onSave?: () => void;
}

export function EditorToolbar({ editor, filePath, isSaving, hasUnsavedChanges, onSave }: EditorToolbarProps) {
  // Show format controls only when editor is available
  if (!editor) {
    return (
      <div className="border-b border-border flex flex-wrap gap-1 p-1">
        {onSave && (
          <>
            <div className="flex items-center ml-2 text-sm text-muted-foreground">
              {filePath ? filePath : 'No file selected'}
              {hasUnsavedChanges && <span className="ml-2 text-amber-500">●</span>}
            </div>
            <div className="flex-1"></div>
            <Button
              variant="outline"
              size="sm"
              onClick={onSave}
              disabled={isSaving || !hasUnsavedChanges}
              className="mr-2"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="border-b border-border flex flex-wrap gap-1 p-1">
      {/* File actions (if provided) */}
      {onSave && (
        <>
          <div className="flex items-center ml-2 text-sm text-muted-foreground">
            {filePath ? filePath : 'No file selected'}
            {hasUnsavedChanges && <span className="ml-2 text-amber-500">●</span>}
          </div>
          <div className="flex-1"></div>
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            disabled={isSaving || !hasUnsavedChanges}
            className="mr-2"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Separator orientation="vertical" className="mx-1 h-8" />
        </>
      )}

      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBold().run()}
        data-active={editor.isActive('bold')}
        className="data-[active=true]:bg-accent"
      >
        <Bold className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        data-active={editor.isActive('italic')}
        className="data-[active=true]:bg-accent"
      >
        <Italic className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-8" />

      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        data-active={editor.isActive('bulletList')}
        className="data-[active=true]:bg-accent"
      >
        <List className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        data-active={editor.isActive('orderedList')}
        className="data-[active=true]:bg-accent"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-8" />

      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        data-active={editor.isActive({ textAlign: 'left' })}
        className="data-[active=true]:bg-accent"
      >
        <AlignLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        data-active={editor.isActive({ textAlign: 'center' })}
        className="data-[active=true]:bg-accent"
      >
        <AlignCenter className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        data-active={editor.isActive({ textAlign: 'right' })}
        className="data-[active=true]:bg-accent"
      >
        <AlignRight className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-8" />

      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <Undo className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  );
}
