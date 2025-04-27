
import { useState, useEffect, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import TipTapWrapper from './TipTapWrapper';
import { useFileExplorerStore } from '@/store/fileExplorerStore';
import { TabBar } from './TabBar';

// Default content for tabs
const DEFAULT_CONTENT = {
  'index.html': '<h1>Welcome to EzEdit</h1><p>Start editing your content here.</p>',
  'style.css': 'h1 {\n  color: #2DA8FF;\n  font-size: 28px;\n  margin-bottom: 16px;\n}\n\np {\n  color: #E6F1FF;\n  line-height: 1.6;\n  font-size: 16px;\n}'
};

export const DualEditor = ({ content, language, onChange, editorRef, fileName }: {
    content: string;
    language: string;
    onChange: (value: string | undefined) => void;
    editorRef?: React.MutableRefObject<any>;
    fileName?: string;
}) => {
    const activeConnection = useFileExplorerStore(state => state.activeConnection);
    const baseUrl = activeConnection?.web_url ?? '';
    
    const [activeTab, setActiveTab] = useState('index.html');
    const [tabContents, setTabContents] = useState(DEFAULT_CONTENT);
    const [isOpen, setIsOpen] = useState(false);
    const tipTapEditorRef = useRef<any>(null);
    
    // Initialize with content if provided
    useEffect(() => {
        if (content && fileName) {
            if (fileName.endsWith('.html')) {
                setActiveTab('index.html');
                setTabContents(prev => ({ ...prev, 'index.html': content }));
            } else if (fileName.endsWith('.css')) {
                setActiveTab('style.css');
                setTabContents(prev => ({ ...prev, 'style.css': content }));
            }
        }
        setIsOpen(true);
        
        return () => setIsOpen(false);
    }, [content, fileName]);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        // Ensure editor content is updated when tab changes
        if (tipTapEditorRef.current && tipTapEditorRef.current.commands) {
            tipTapEditorRef.current.commands.setContent(tabContents[tab]);
        }
    };

    const handleContentChange = (newContent: string) => {
        setTabContents(prev => ({
            ...prev,
            [activeTab]: newContent
        }));
        onChange(newContent);
    };

    return (
        <div className="h-full flex flex-col bg-background border border-border rounded-md overflow-hidden">
            <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
            
            <div className="flex-1">
                <div className="h-full">
                    <TipTapWrapper 
                        html={tabContents[activeTab]}
                        onChange={handleContentChange}
                        autoFocus={isOpen}
                        editorRef={tipTapEditorRef}
                    />
                </div>
            </div>
        </div>
    );
};
