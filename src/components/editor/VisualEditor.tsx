
import React, { useEffect, useRef } from 'react';
import grapesjs from 'grapesjs';
import gjsPreset from 'grapesjs-preset-webpage';
import { VisualModeToolbar } from './VisualModeToolbar';
import { toast } from 'sonner';

interface VisualEditorProps {
  content:   string;
  onChange:  (content: string) => void;
  fileName:  string | null;
  readOnly?: boolean;
}

export function VisualEditor({
  content,
  onChange,
  fileName,
  readOnly = false,
}: VisualEditorProps) {
  const [gjsView, setGjsView] = React.useState<'design' | 'code'>('design');
  // Use Editor type from grapesjs import
  const grapesjsEditorRef = useRef<ReturnType<typeof grapesjs.init> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ───────────── initialise GrapesJS once ───────────── */
  useEffect(() => {
    if (containerRef.current && !grapesjsEditorRef.current) {
      console.log('[VisualEditor] Initializing GrapesJS editor');
      
      try {
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
                contentTypeJson: true,
                headers: { 'Content-Type': 'application/json' },
                onStore: data => {
                  console.log('[VisualEditor] Storing content to remote, filename:', fileName);
                  return { 
                    ...data, 
                    filename: fileName 
                  };
                },
                onLoad: result => {
                  console.log('[VisualEditor] Content loaded from remote');
                  return result;
                },
                // Add custom error handler to handle storage errors but do it via events instead
                params: {
                  errorHandler: (err: any) => {
                    console.error('[VisualEditor] Storage error via params:', err);
                    toast.error('Error saving or loading content');
                  }
                }
              },
            },
          },

          plugins: [gjsPreset],
          pluginsOpts: { gjsPreset: {} },

          panels: {
            defaults: [
              {
                id: 'views',
                buttons: [
                  {
                    id: 'design-btn',
                    command: 'show-design',
                    active: gjsView === 'design',
                    attributes: { title: 'Switch to Design View' },
                    className: 'gjs-pn-btn',
                    label: 'Design',
                  },
                  {
                    id: 'code-btn',
                    command: 'show-code',
                    active: gjsView === 'code',
                    attributes: { title: 'Switch to Code View' },
                    className: 'gjs-pn-btn',
                    label: 'Code',
                  },
                ],
              },
            ],
          },

          deviceManager: {
            devices: [
              { name: 'Desktop', width: '' },
              { name: 'Tablet', width: '768px' },
              { name: 'Mobile', width: '320px' },
            ],
          },

          styleManager: { sectors: [] },
          blockManager: { appendTo: '#blocks' },
        });

        /* ───── custom commands for Design / Code toggle ───── */
        editor.Commands.add('show-design', {
          run: ed => {
            ed.runCommand('core:open-blocks');
            ed.runCommand('core:open-layers');
            ed.stopCommand('core:open-code');
            setGjsView('design');
          },
        });

        editor.Commands.add('show-code', {
          run: ed => {
            ed.stopCommand('core:open-blocks');
            ed.stopCommand('core:open-layers');
            ed.runCommand('core:open-code');
            setGjsView('code');
          },
        });

        /* ───── initial content & change listener ───── */
        editor.setComponents(content);
        editor.on('change:changesCount', () => {
          if (!readOnly) onChange(editor.getHtml());
        });
        
        // Add error handler for storage events
        editor.on('storage:error', (err) => {
          console.error('[VisualEditor] Storage error event:', err);
          toast.error('Error with editor storage');
        });
        
        // Log successful storage
        editor.on('storage:store', () => {
          console.log('[VisualEditor] Content stored successfully');
        });
        
        editor.on('storage:load', () => {
          console.log('[VisualEditor] Content loaded successfully');
        });

        grapesjsEditorRef.current = editor;

        return () => {
          editor.destroy();
          grapesjsEditorRef.current = null;
        };
      } catch (err) {
        console.error('[VisualEditor] Error initializing editor:', err);
        toast.error('Failed to initialize visual editor');
      }
    }
  }, [content, fileName, onChange, readOnly, gjsView]);

  /* ───────────── keep external state in sync ───────────── */
  useEffect(() => {
    const currentHtml = grapesjsEditorRef.current?.getHtml();
    if (grapesjsEditorRef.current && currentHtml !== content) {
      grapesjsEditorRef.current.setComponents(content);
    }
  }, [content]);

  /* ───────────── toolbar toggle handler ───────────── */
  const handleViewChange = (view: 'design' | 'code') => {
    setGjsView(view);
    grapesjsEditorRef.current?.runCommand(`show-${view}`);
  };
  
  // Add a refresh handler
  const handleRefresh = () => {
    if (grapesjsEditorRef.current) {
      console.log('[VisualEditor] Refreshing editor content');
      grapesjsEditorRef.current.load((err: any) => {
        if (err) {
          console.error('[VisualEditor] Error during refresh:', err);
          toast.error('Failed to refresh content');
        } else {
          toast.success('Content refreshed successfully');
        }
      });
    }
  };

  return (
    <div className="h-full">
      <VisualModeToolbar
        gjsView={gjsView}
        onViewChange={handleViewChange}
        onRefresh={handleRefresh}
        readOnly={readOnly}
      />
      <div id="blocks" className="hidden" />
      <div ref={containerRef} className="h-full" />
    </div>
  );
}
