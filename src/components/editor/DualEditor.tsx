import { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export const DualEditor = ({ content, language, onChange, editorRef, fileName }: {
    content: string;
    language: string;
    onChange: (value: string | undefined) => void;
    editorRef?: React.MutableRefObject<any>;
    fileName?: string;
}) => {
    const [mode, setMode] = useState<'code' | 'visual'>(
        language === 'html' ? 'visual' : 'code'
    );

    const tiptap = useEditor({
        extensions: [StarterKit],
        content: content,
        editable: mode === 'visual',
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        }
    });

    useEffect(() => {
        if (tiptap && mode === 'visual') {
            tiptap.commands.setContent(content);
        }
    }, [content, tiptap, mode]);

    useEffect(() => {
        if (mode === 'visual') {
            setTimeout(() => tiptap?.commands.focus(), 50);
        }
    }, [tiptap, mode]);

    const handleEditorDidMount = (editor: any) => {
        if (editorRef) {
            editorRef.current = editor;
            setTimeout(() => editor.layout(), 100);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between bg-background px-4 py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">{fileName || 'Untitled'}</span>
                {language === 'html' && (
                    <button
                        onClick={() => setMode(m => (m === 'code' ? 'visual' : 'code'))}
                        className="text-xs px-3 py-1.5 rounded bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    >
                        {mode === 'code' ? 'Visual' : 'Code'}
                    </button>
                )}
            </div>

            <div className="flex-1">
                {mode === 'code' ? (
                    <MonacoEditor
                        height="100%"
                        language={language}
                        value={content}
                        onChange={onChange}
                        theme="vs-dark"
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            wordWrap: 'on',
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            tabSize: 2,
                            fixedOverflowWidgets: true,
                        }}
                        onMount={handleEditorDidMount}
                    />
                ) : (
                    <div className="h-full overflow-y-auto bg-background">
                        <EditorContent editor={tiptap} className="prose prose-invert p-4 max-w-none" />
                    </div>
                )}
            </div>
        </div>
    );
};
