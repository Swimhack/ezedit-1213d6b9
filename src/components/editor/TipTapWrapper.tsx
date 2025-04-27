
import React, { useLayoutEffect, Suspense, useImperativeHandle } from 'react';

// Use React's lazy loading instead of Next.js dynamic
const TipTapEditor = React.lazy(async () => {
  const { useEditor, EditorContent } = await import('@tiptap/react');
  const StarterKit = (await import('@tiptap/starter-kit')).default;

  return {
    default: function TipTapWrapper({
      html,
      onChange,
      autoFocus = false,
      editorRef,
    }: {
      html: string;
      onChange: (val: string) => void;
      autoFocus?: boolean;
      editorRef?: React.MutableRefObject<any>;
    }) {
      const editor = useEditor({
        extensions: [StarterKit],
        content: html || '<p></p>', // Always provide at least an empty paragraph
        editable: true,
        onUpdate: ({editor}) => onChange(editor.getHTML()),
        editorProps: {
          attributes: {
            class: 'prose prose-invert max-w-none focus:outline-none h-full p-4',
          },
        },
      });

      // Expose editor instance through ref for external manipulation
      useImperativeHandle(editorRef, () => editor, [editor]);

      /** DEBUG — confirm content and editor mounted */
      console.log('[TipTap] mounted →', !!editor, 'content length:', html?.length);

      // focus after animation
      useLayoutEffect(() => {
        if (autoFocus && editor) {
          const id = setTimeout(() => editor.commands.focus('end'), 60);
          return () => clearTimeout(id);
        }
      }, [autoFocus, editor]);

      if (!editor) return null;
      
      return (
        <EditorContent
          editor={editor}
          className="prose prose-invert p-4 h-full overflow-y-auto bg-background"
        />
      );
    }
  };
});

// Export a component that handles the suspense boundary
export default function TipTapWrapper(props: {
  html: string;
  onChange: (val: string) => void;
  autoFocus?: boolean;
  editorRef?: React.MutableRefObject<any>;
}) {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading editor...</div>}>
      <TipTapEditor {...props} />
    </Suspense>
  );
}
