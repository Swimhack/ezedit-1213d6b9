import { useState, useEffect, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import TipTapWrapper from './TipTapWrapper';

export const DualEditor = ({ content, language, onChange, editorRef, fileName }: {
    content: string;
    language: string;
    onChange: (value: string | undefined) => void;
    editorRef?: React.MutableRefObject<any>;
    fileName?: string;
}) => {
    // Improve detection of HTML-capable files
    const looksLikeHtml = /<\w+[^>]*>/i.test(content);   // crude tag sniff
    const isVisualCapable = looksLikeHtml && /\.(html?|php)$/i.test(language);
    const [mode, setMode] = useState<'code' | 'visual'>(
        isVisualCapable ? 'visual' : 'code'
    );
    
    // Track modal open status for autoFocus behavior
    const [isOpen, setIsOpen] = useState(false);
    const tipTapEditorRef = useRef<any>(null);
    
    // Ensure the component recognizes it's mounted
    useEffect(() => {
        setIsOpen(true);
        return () => setIsOpen(false);
    }, []);

    // Handle editor mounting
    const handleEditorDidMount = (editor: any) => {
        if (editorRef) {
            editorRef.current = editor;
            setTimeout(() => editor.layout(), 100);
        }
    };

    /* keep TipTap in sync */
    useEffect(() => {
        if (!isVisualCapable) {
            setMode('code');  // force code mode for non-HTML content
            return;
        }
        if (tipTapEditorRef.current && mode === 'visual') {
            tipTapEditorRef.current.commands?.setContent(content || '');
        }
    }, [fileName, content, mode, isVisualCapable]);

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between bg-background px-4 py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">{fileName || 'Untitled'}</span>
                {isVisualCapable && (
                    <button
                        onClick={() => setMode(m => (m === 'code' ? 'visual' : 'code'))}
                        className="text-xs px-3 py-1.5 rounded bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    >
                        {mode === 'code' ? 'Visual Editor' : 'Code Editor'}
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
                    <div className="flex flex-col h-full overflow-hidden">
                        <div className="bg-muted flex gap-2 px-3 py-2 border-b border-border items-center">
                            <span className="text-xs text-muted-foreground">Visual Editor</span>
                            <div className="h-4 border-r border-border"></div>
                            <button className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                B
                            </button>
                            <button className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground hover:bg-secondary/80 italic">
                                I
                            </button>
                            <button className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground hover:bg-secondary/80 underline">
                                U
                            </button>
                            <button className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                H1
                            </button>
                            <button className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                H2
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto bg-background">
                            <TipTapWrapper 
                                html={content} 
                                onChange={(value) => onChange(value)}
                                autoFocus={isOpen}
                                editorRef={tipTapEditorRef}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
