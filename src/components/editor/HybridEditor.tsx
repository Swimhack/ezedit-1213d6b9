
import React, { useEffect, useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import { TabPanel } from 'react-tabs';
import { CodeEditor } from './CodeEditor';
import './grapesjs-styles.css';
import { EditorTabView } from './EditorTabView';
import { VisualEditor } from './VisualEditor';
import { PreviewTab } from './PreviewTab';

interface HybridEditorProps {
  content: string;
  fileName: string | null;
  onChange: (content: string) => void;
  editorRef?: React.MutableRefObject<any>;
  readOnly?: boolean;
}

export function HybridEditor({ 
  content, 
  fileName, 
  onChange,
  editorRef,
  readOnly = false
}: HybridEditorProps) {
  const [tabIndex, setTabIndex] = useState(0);
  const [htmlContent, setHtmlContent] = useState(content);
  
  const isHtmlFile = fileName ? /\.(html?|htm)$/i.test(fileName) : false;
  
  // Initialize content when loading new content
  useEffect(() => {
    console.log('[HybridEditor] Content updated, length:', content?.length || 0);
    if (content) {
      setHtmlContent(content);
    }
  }, [content, fileName]);
  
  if (!isHtmlFile) {
    return (
      <CodeEditor 
        content={content}
        language={fileName ? fileName.split('.').pop() || 'plaintext' : 'plaintext'}
        onChange={onChange}
        editorRef={editorRef}
        readOnly={readOnly}
      />
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      <EditorTabView 
        tabIndex={tabIndex} 
        setTabIndex={setTabIndex} 
        readOnly={readOnly}
        isHtmlFile={isHtmlFile}
      />
      
      <div className="flex-grow">
        {tabIndex === 0 && (
          <CodeEditor 
            content={content} 
            language="html" 
            onChange={onChange} 
            editorRef={editorRef} 
            readOnly={readOnly}
          />
        )}
        
        {tabIndex === 1 && !readOnly && isHtmlFile && (
          <VisualEditor
            content={content}
            onChange={onChange}
            fileName={fileName}
            readOnly={readOnly}
          />
        )}
        
        {(tabIndex === 2 || (tabIndex === 1 && readOnly)) && (
          <PreviewTab content={content} fileName={fileName} />
        )}
      </div>
    </div>
  );
}
