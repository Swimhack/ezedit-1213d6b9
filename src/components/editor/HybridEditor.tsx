import React, { useEffect, useRef, useState } from 'react';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import grapesjs from 'grapesjs';
import gjsPreset from 'grapesjs-preset-webpage';
import { CodeEditor } from './CodeEditor';
import { WysiwygEditor } from './WysiwygEditor';
import { Button } from '@/components/ui/button';
import { Eye, Code, Columns, Paintbrush } from 'lucide-react';
import { useLivePreview } from '@/hooks/useLivePreview';
import './grapesjs-styles.css';

interface HybridEditorProps {
  content: string;
  fileName: string | null;
  onChange: (content: string) => void;
  editorRef?: React.MutableRefObject<any>;
}

export function HybridEditor({ 
  content, 
  fileName, 
  onChange,
  editorRef
}: HybridEditorProps) {
  const [tabIndex, setTabIndex] = useState(0);
  const [htmlContent, setHtmlContent] = useState(content);
  const grapesjsEditorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [gjsView, setGjsView] = useState<'design' | 'code'>('design');

  const previewSrc = useLivePreview(content, fileName || '');
  const isHtmlFile = fileName ? /\.(html?|htm)$/i.test(fileName) : false;
  
  // Initialize GrapesJS when tab is selected
  useEffect(() => {
    if (tabIndex === 1 && isHtmlFile && containerRef.current && !grapesjsEditorRef.current) {
      const editor = grapesjs.init({
        container: containerRef.current,
        height: '100%',
        width: 'auto',
        fromElement: false,
        storageManager: {
          type: 'remote',
          autosave: false,
          autoload: true,
          options: {
            remote: {
              urlStore: '/api/save',
              urlLoad: '/api/load',
              params: { filename: fileName },
              contentTypeJson: true
            }
          }
        },
        plugins: [gjsPreset],
        pluginsOpts: {
          gjsPreset: {}
        },
        panels: { 
          defaults: [
            {
              id: 'views',
              buttons: [
                {
                  id: 'design-btn',
                  label: 'Design',
                  className: 'gjs-pn-btn',
                  command: 'show-design',
                  active: gjsView === 'design',
                  attributes: { title: 'Switch to Design View' },
                },
                {
                  id: 'code-btn',
                  label: 'Code',
                  className: 'gjs-pn-btn',
                  command: 'show-code',
                  active: gjsView === 'code',
                  attributes: { title: 'Switch to Code View' },
                }
              ]
            }
          ] 
        },
        deviceManager: { devices: [
          { name: 'Desktop', width: '' },
          { name: 'Tablet', width: '768px' },
          { name: 'Mobile', width: '320px' }
        ]},
        styleManager: { sectors: [] },
        blockManager: { appendTo: '#blocks' }
      });
      
      // Add the toggle commands
      editor.Commands.add('show-design', {
        run: (editor) => {
          editor.runCommand('core:open-blocks');
          editor.runCommand('core:open-layers');
          editor.stopCommand('core:open-code');
          setGjsView('design');
        }
      });

      editor.Commands.add('show-code', {
        run: (editor) => {
          editor.stopCommand('core:open-blocks');
          editor.stopCommand('core:open-layers');
          editor.runCommand('core:open-code');
          setGjsView('code');
        }
      });
      
      // Set content
      editor.setComponents(htmlContent);
      
      // Listen for changes
      editor.on('change:changesCount', () => {
        const html = editor.getHtml();
        setHtmlContent(html);
        onChange(html);
      });
      
      grapesjsEditorRef.current = editor;
      
      // Return cleanup function
      return () => {
        editor.destroy();
        grapesjsEditorRef.current = null;
      };
    }
  }, [tabIndex, isHtmlFile]);
  
  // Update GrapesJS content when external content changes
  useEffect(() => {
    if (grapesjsEditorRef.current && content !== htmlContent) {
      grapesjsEditorRef.current.setComponents(content);
      setHtmlContent(content);
    }
  }, [content]);
  
  if (!isHtmlFile) {
    return (
      <CodeEditor 
        content={content}
        language={fileName ? fileName.split('.').pop() || 'plaintext' : 'plaintext'}
        onChange={onChange}
        editorRef={editorRef}
      />
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-1">
        <Tabs selectedIndex={tabIndex} onSelect={(index) => setTabIndex(index)}>
          <TabList className="flex gap-2 mb-0">
            <Tab className="flex items-center gap-1 px-3 py-2 rounded-t cursor-pointer border-b-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800">
              <Code size={16} />
              <span>Code</span>
            </Tab>
            <Tab className="flex items-center gap-1 px-3 py-2 rounded-t cursor-pointer border-b-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800">
              <Columns size={16} />
              <span>Visual</span>
            </Tab>
            <Tab className="flex items-center gap-1 px-3 py-2 rounded-t cursor-pointer border-b-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800">
              <Eye size={16} />
              <span>Preview</span>
            </Tab>
          </TabList>
        </Tabs>
      </div>
      
      <div className="flex-grow">
        {tabIndex === 0 && (
          <CodeEditor 
            content={content} 
            language="html" 
            onChange={onChange} 
            editorRef={editorRef} 
          />
        )}
        
        {tabIndex === 1 && (
          <div className="h-full">
            <div className="flex gap-2 p-2 border-b">
              <Button 
                size="sm" 
                variant={gjsView === 'design' ? 'default' : 'outline'}
                onClick={() => {
                  if (grapesjsEditorRef.current) {
                    grapesjsEditorRef.current.runCommand('show-design');
                  }
                }}
                className="flex items-center gap-1"
              >
                <Paintbrush size={14} />
                Design
              </Button>
              <Button 
                size="sm" 
                variant={gjsView === 'code' ? 'default' : 'outline'}
                onClick={() => {
                  if (grapesjsEditorRef.current) {
                    grapesjsEditorRef.current.runCommand('show-code');
                  }
                }}
                className="flex items-center gap-1"
              >
                <Code size={14} />
                Code
              </Button>
            </div>
            <div id="blocks" className="hidden"></div>
            <div ref={containerRef} className="h-full"></div>
          </div>
        )}
        
        {tabIndex === 2 && (
          <div className="h-full w-full bg-white">
            <iframe 
              srcDoc={previewSrc} 
              className="w-full h-full border-0" 
              sandbox="allow-scripts"
              title="Preview"
            />
          </div>
        )}
      </div>
    </div>
  );
}
