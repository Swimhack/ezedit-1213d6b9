
// TipTapWrapper.tsx  (Client-only dynamic import)
import dynamic from 'next/dynamic';
import * as React from 'react';

export default dynamic(async () => {
  const {useEditor, EditorContent} = await import('@tiptap/react');
  const StarterKit = (await import('@tiptap/starter-kit')).default;

  return function TipTapWrapper({
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
    React.useLayoutEffect(() => {
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
  };
}, {ssr: false});
