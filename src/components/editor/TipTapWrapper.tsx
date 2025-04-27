
import React, { useLayoutEffect, Suspense } from 'react';

// Use React's lazy loading instead of Next.js dynamic
const TipTapEditor = React.lazy(async () => {
  const { useEditor, EditorContent } = await import('@tiptap/react');
  const StarterKit = (await import('@tiptap/starter-kit')).default;

  return {
    default: function TipTapWrapper({
      html,
      onChange,
      autoFocus = false,
    }: {
      html: string;
      onChange: (val: string) => void;
      autoFocus?: boolean;
    }) {
      const editor = useEditor({
        extensions: [StarterKit],
        content: html,
        editable: true,
        onUpdate: ({editor}) => onChange(editor.getHTML()),
      });

      /** DEBUG — confirm TipTap mounted */
      console.log('[TipTap] mounted →', !!editor);

      // focus after Radix Dialog animation
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
}) {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading editor...</div>}>
      <TipTapEditor {...props} />
    </Suspense>
  );
}
