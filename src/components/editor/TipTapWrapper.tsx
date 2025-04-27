
import React, { useLayoutEffect, Suspense, useImperativeHandle, useEffect } from 'react';
import { EditorToolbar } from './EditorToolbar';

const TipTapEditor = React.lazy(async () => {
  const { useEditor, EditorContent } = await import('@tiptap/react');
  const StarterKit = (await import('@tiptap/starter-kit')).default;
  const TextAlign = (await import('@tiptap/extension-text-align')).default;

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
      console.log('[TipTap] Initializing with content length:', html?.length || 0);
      
      const editor = useEditor({
        extensions: [
          StarterKit,
          TextAlign.configure({
            types: ['heading', 'paragraph'],
            alignments: ['left', 'center', 'right'],
          }),
        ],
        content: html || '', // Ensure we don't pass null/undefined
        editable: true,
        onUpdate: ({ editor }) => {
          const content = editor.getHTML();
          console.log('[TipTap] Content updated, new length:', content.length);
          onChange(content);
        },
        editorProps: {
          attributes: {
            class: 'prose prose-invert max-w-none focus:outline-none h-full p-6 overflow-y-auto',
          },
        },
      });

      useImperativeHandle(editorRef, () => editor, [editor]);

      // Update content when html prop changes
      useEffect(() => {
        if (editor && html !== undefined && html !== null) {
          console.log('[TipTap] Content prop changed, new length:', html.length);
          if (html !== editor.getHTML()) {
            console.log('[TipTap] Setting new content');
            editor.commands.setContent(html);
          }
        }
      }, [editor, html]);

      // Handle autofocus
      useLayoutEffect(() => {
        if (autoFocus && editor) {
          const id = setTimeout(() => editor.commands.focus('end'), 60);
          return () => clearTimeout(id);
        }
      }, [autoFocus, editor]);

      if (!editor) return null;
      
      return (
        <div className="flex flex-col h-full bg-background">
          <EditorToolbar editor={editor} />
          <EditorContent
            editor={editor}
            className="flex-1 overflow-auto"
          />
        </div>
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
  console.log('[TipTapWrapper] Rendering with html length:', props.html?.length || 0);
  
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading editor...</div>}>
      <TipTapEditor {...props} />
    </Suspense>
  );
}
