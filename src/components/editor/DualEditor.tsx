
import { useState, useEffect, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import TipTapWrapper from './TipTapWrapper';
import { useFileExplorerStore } from '@/store/fileExplorerStore';
import { TabBar } from './TabBar';
import { useFileContent } from '@/hooks/use-file-content';

export const DualEditor = ({ 
  content: initialContent, 
  language, 
  onChange, 
  editorRef, 
  fileName 
}: {
  content: string;
  language: string;
  onChange: (value: string | undefined) => void;
  editorRef?: React.MutableRefObject<any>;
  fileName?: string;
}) => {
  const activeConnection = useFileExplorerStore(state => state.activeConnection);
  const baseUrl = activeConnection?.web_url ?? '';
  
  const [activeTab, setActiveTab] = useState('index.html');
  const [tabContents, setTabContents] = useState<Record<string, string>>({});
  const [isOpen, setIsOpen] = useState(false);
  const tipTapEditorRef = useRef<any>(null);

  const { content: ftpContent, isLoading } = useFileContent({
    connection: activeConnection,
    filePath: fileName || ''
  });

  // Initialize with content from FTP when available
  useEffect(() => {
    if (fileName && ftpContent) {
      if (fileName.endsWith('.html')) {
        setActiveTab('index.html');
        setTabContents(prev => ({ ...prev, 'index.html': ftpContent }));
      } else if (fileName.endsWith('.css')) {
        setActiveTab('style.css');
        setTabContents(prev => ({ ...prev, 'style.css': ftpContent }));
      }
    }
    setIsOpen(true);
    
    return () => setIsOpen(false);
  }, [fileName, ftpContent]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Ensure editor content is updated when tab changes
    if (tipTapEditorRef.current && tipTapEditorRef.current.commands) {
      tipTapEditorRef.current.commands.setContent(tabContents[tab]);
    }
  };

  const handleContentChange = (newContent: string) => {
    // Auto-insert viewport meta once per document for HTML/PHP files
    if (fileName && /\.html?$|\.php$/i.test(fileName)) {
      let html = newContent;
      if (!/<meta\s+name=["']viewport/i.test(html)) {
        html = html.replace(
          /<head[^>]*>/i,
          match => `${match}\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">`
        );
      }
      setTabContents(prev => ({
        ...prev,
        [activeTab]: html
      }));
      onChange(html);
      return;
    }

    setTabContents(prev => ({
      ...prev,
      [activeTab]: newContent
    }));
    onChange(newContent);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-background border border-border rounded-md">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background border border-border rounded-md overflow-hidden">
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
      
      <div className="flex-1">
        <div className="h-full">
          <TipTapWrapper 
            html={tabContents[activeTab] || ''}
            onChange={handleContentChange}
            autoFocus={isOpen}
            editorRef={tipTapEditorRef}
          />
        </div>
      </div>
    </div>
  );
};
