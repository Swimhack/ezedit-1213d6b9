
import { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import TipTapWrapper from './TipTapWrapper';

export const DualEditor = ({ content, language, onChange, editorRef, fileName }: {
    content: string;
    language: string;
    onChange: (value: string | undefined) => void;
    editorRef?: React.MutableRefObject<any>;
    fileName?: string;
}) => {
    // Expand the file types that can use visual editor and ensure proper detection
    const isVisualCapable = /html|php|htm/.test(language);
    const [mode, setMode] = useState<'code' | 'visual'>(
        isVisualCapable ? 'visual' : 'code'
    );
    
    // Track modal open status for autoFocus behavior
    const [isOpen, setIsOpen] = useState(false);
    
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

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between bg-background px-4 py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">{fileName || 'Untitled'}</span>
                {isVisualCapable && (
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
                        <TipTapWrapper 
                            html={content} 
                            onChange={(value) => onChange(value)}
                            autoFocus={isOpen} 
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
