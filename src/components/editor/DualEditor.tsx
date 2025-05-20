
import { useState, useEffect, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { TipTapWrapper } from './TipTapWrapper';
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

  // Debug logs for content loading
  useEffect(() => {
    console.log('[DualEditor] Props content length:', initialContent?.length || 0);
    console.log('[DualEditor] FTP content length:', ftpContent?.length || 0);
  }, [initialContent, ftpContent]);

  // Initialize with content from FTP when available
  useEffect(() => {
    if (fileName && ftpContent) {
      console.log('[DualEditor] Setting content from FTP, length:', ftpContent.length);
      if (fileName.endsWith('.html')) {
        setActiveTab('index.html');
        setTabContents(prev => ({ ...prev, 'index.html': ftpContent }));
      } else if (fileName.endsWith('.css')) {
        setActiveTab('style.css');
        setTabContents(prev => ({ ...prev, 'style.css': ftpContent }));
      } else {
        // For other file types
        const tabName = fileName.split('/').pop() || 'file';
        setActiveTab(tabName);
        setTabContents(prev => ({ ...prev, [tabName]: ftpContent }));
      }
    } else if (initialContent) {
      console.log('[DualEditor] Setting content from props, length:', initialContent.length);
      setTabContents(prev => ({ ...prev, [activeTab]: initialContent }));
    }
    setIsOpen(true);
    
    return () => setIsOpen(false);
  }, [fileName, ftpContent, initialContent]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Ensure editor content is updated when tab changes
    if (tipTapEditorRef.current && tipTapEditorRef.current.commands) {
      tipTapEditorRef.current.commands.setContent(tabContents[tab] || '');
    }
  };

  const handleContentChange = (newContent: string) => {
    console.log('[DualEditor] Content changed, new length:', newContent.length);
    
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

  const currentContent = tabContents[activeTab] || '';
  console.log('[DualEditor] Rendering with content length:', currentContent.length);

  return (
    <div className="h-full flex flex-col bg-background border border-border rounded-md overflow-hidden">
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
      
      <div className="flex-1">
        <div className="h-full">
          <TipTapWrapper 
            content={currentContent}
            onChange={handleContentChange}
            autoFocus={isOpen}
            editorRef={tipTapEditorRef}
          />
        </div>
      </div>
    </div>
  );
};
