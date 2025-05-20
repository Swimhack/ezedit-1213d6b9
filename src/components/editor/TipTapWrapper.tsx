
import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { EditorToolbar } from './EditorToolbar';

interface TipTapWrapperProps {
  content: string;
  onChange: (content: string) => void;
  autoFocus?: boolean;
  editorRef?: React.MutableRefObject<any>;
}

export function TipTapWrapper({
  content,
  onChange,
  autoFocus,
  editorRef
}: TipTapWrapperProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    autofocus: autoFocus,
  }, [autoFocus]);

  // Set the editor reference if provided
  React.useEffect(() => {
    if (editorRef && editor) {
      editorRef.current = editor;
    }
  }, [editor, editorRef]);

  const handleFormat = () => {
    // Format functionality for TipTap would go here
    console.log('Format not implemented for TipTap');
  };

  const handleUndo = () => {
    editor?.commands.undo();
  };

  const handleRedo = () => {
    editor?.commands.redo();
  };

  const dummySaveHandler = async () => {
    console.log('Save functionality not implemented');
  };

  // Dummy props for compatibility with EditorToolbar
  const filePath = '';
  const hasUnsavedChanges = false;
  const isSaving = false;
  const isPremium = true;

  return (
    <div className="flex flex-col h-full">
      <EditorToolbar
        filePath={filePath}
        onSave={dummySaveHandler}
        onFormat={handleFormat}
        onUndo={handleUndo}
        onRedo={handleRedo}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        isPremium={isPremium}
        editor={editor}
      />
      <div className="p-4 flex-grow overflow-y-auto">
        <EditorContent editor={editor} className="prose max-w-none" />
      </div>
    </div>
  );
}
