
import React, { useLayoutEffect, Suspense, useImperativeHandle, useEffect } from 'react';

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
        content: html,
        editable: true,
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
        editorProps: {
          attributes: {
            class: 'prose prose-invert max-w-none focus:outline-none h-full p-4 overflow-y-auto',
          },
        },
      });

      useImperativeHandle(editorRef, () => editor, [editor]);

      useEffect(() => {
        if (editor && html !== editor.getHTML()) {
          editor.commands.setContent(html);
        }
      }, [editor, html]);

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
          className="h-full bg-background"
        />
      );
    }
  };
});

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
