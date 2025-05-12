
import React, { useEffect, useRef } from 'react';
import grapesjs from 'grapesjs';
import gjsPreset from 'grapesjs-preset-webpage';
import { VisualModeToolbar } from './VisualModeToolbar';

interface VisualEditorProps {
  content: string;
  onChange: (content: string) => void;
  fileName: string | null;
  readOnly?: boolean;
}

export function VisualEditor({
  content,
  onChange,
  fileName,
  readOnly = false
}: VisualEditorProps) {
  const [gjsView, setGjsView] = React.useState<'design' | 'code'>('design');
  const grapesjsEditorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize GrapesJS editor
  useEffect(() => {
    if (containerRef.current && !grapesjsEditorRef.current) {
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
              headers: { 
                'Content-Type': 'application/json' 
              },
              onStore: (data: any) => {
                // Add filename to the data before storing
                return {
                  ...data,
                  filename: fileName
                };
              },
              onLoad: (result: any) => {
                // Process the loaded data if needed
                return result;
              }
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
                  // Fix: GrapesJS buttons use label internally
                  command: 'show-design',
                  active: gjsView === 'design',
                  attributes: { title: 'Switch to Design View' },
                  className: 'gjs-pn-btn',
                  label: 'Design'  // Use label instead of text
                },
                {
                  id: 'code-btn',
                  // Fix: GrapesJS buttons use label internally
                  command: 'show-code',
                  active: gjsView === 'code',
                  attributes: { title: 'Switch to Code View' },
                  className: 'gjs-pn-btn',
                  label: 'Code'  // Use label instead of text
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
      editor.setComponents(content);
      
      // Listen for changes
      editor.on('change:changesCount', () => {
        if (!readOnly) {
          const html = editor.getHtml();
          onChange(html);
        }
      });
      
      grapesjsEditorRef.current = editor;
      
      // Return cleanup function
      return () => {
        editor.destroy();
        grapesjsEditorRef.current = null;
      };
    }
  }, [content, fileName, onChange, readOnly, gjsView]);
  
  // Update GrapesJS content when external content changes
  useEffect(() => {
    if (grapesjsEditorRef.current && grapesjsEditorRef.current.getHtml() !== content) {
      grapesjsEditorRef.current.setComponents(content);
    }
  }, [content]);

  const handleViewChange = (view: 'design' | 'code') => {
    setGjsView(view);
    if (grapesjsEditorRef.current) {
      grapesjsEditorRef.current.runCommand(`show-${view}`);
    }
  };

  return (
    <div className="h-full">
      <VisualModeToolbar 
        gjsView={gjsView} 
        onViewChange={handleViewChange} 
        readOnly={readOnly}
      />
      <div id="blocks" className="hidden"></div>
      <div ref={containerRef} className="h-full"></div>
    </div>
  );
}
