
import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { EditorToolbar } from './EditorToolbar';

interface TipTapWrapperProps {
  content: string;
  onChange: (content: string) => void;
  onSave: () => Promise<void>;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  filePath: string;
  isPremium: boolean;
}

export function TipTapWrapper({
  content,
  onChange,
  onSave,
  hasUnsavedChanges,
  isSaving,
  filePath,
  isPremium
}: TipTapWrapperProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

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

  return (
    <div className="flex flex-col h-full">
      <EditorToolbar
        filePath={filePath}
        onSave={onSave}
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
