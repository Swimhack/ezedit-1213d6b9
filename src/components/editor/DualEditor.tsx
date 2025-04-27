
import { useState, useEffect, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import TipTapWrapper from './TipTapWrapper';
import { useFileExplorerStore } from '@/store/fileExplorerStore';
import { TabBar } from './TabBar';

// Default content for tabs
const DEFAULT_CONTENT = {
  'index.html': '<h1>Welcome to EzEdit</h1><p>Start editing your content here.</p>',
  'style.css': 'h1 {\n  color: #333;\n  font-size: 24px;\n}\n\np {\n  color: #666;\n  line-height: 1.6;\n}'
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
    
    useEffect(() => {
        setIsOpen(true);
        return () => setIsOpen(false);
    }, []);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
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
        <div className="h-full flex flex-col">
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
