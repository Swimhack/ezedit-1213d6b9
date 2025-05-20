
/**
 * GrapesJS Integration Example Component
 * 
 * This is a reference implementation showing how to properly integrate
 * GrapesJS with React and TypeScript, including remote storage configuration.
 * Not used in production but provided as a reference.
 */

import React, { useEffect, useRef } from 'react';
import grapesjs from 'grapesjs';
import gjsPreset from 'grapesjs-preset-webpage';

interface GrapesJSExampleProps {
  initialContent: string;
  fileName: string;
  connectionId: string;
  onChange?: (content: string) => void;
  onSave?: () => void;
}

export function GrapesJSIntegrationExample({
  initialContent,
  fileName,
  connectionId,
  onChange,
  onSave
}: GrapesJSExampleProps) {
  const editorRef = useRef<ReturnType<typeof grapesjs.init> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize editor once when component mounts
  useEffect(() => {
    if (!containerRef.current || editorRef.current) return;

    console.log('[GrapesJSExample] Initializing editor');
    
    try {
      // Initialize GrapesJS
      const editor = grapesjs.init({
        // Basic configuration
        container: containerRef.current,
        height: '100%',
        width: 'auto',
        fromElement: false,
        
        // Set up storage manager for remote storage
        storageManager: {
          type: 'remote',
          autosave: false,
          autoload: true,
          stepsBeforeSave: 1,
          options: {
            remote: {
              urlStore: '/api/save',
              urlLoad: '/api/load',
              contentTypeJson: true,
              headers: { 'Content-Type': 'application/json' },
              
              // Add custom parameters to load request
              onLoad: (data) => {
                console.log('[GrapesJSExample] Loading content');
                return data;
              },
              
              // Add custom parameters to store request
              onStore: (data) => {
                console.log('[GrapesJSExample] Storing content');
                return { 
                  ...data,
                  filename: fileName,
                  connectionId
                };
              }
            }
          }
        },
        
        // Load plugins
        plugins: [gjsPreset],
        pluginsOpts: {
          gjsPreset: {}
        },
        
        // Panel configuration
        panels: {
          defaults: [
            {
              id: 'views',
              buttons: [
                {
                  id: 'open-blocks',
                  command: 'core:open-blocks',
                  className: 'gjs-pn-btn',
                  label: 'Blocks',
                },
                {
                  id: 'open-layers',
                  command: 'core:open-layers',
                  className: 'gjs-pn-btn',
                  label: 'Layers',
                },
                {
                  id: 'open-style',
                  command: 'core:open-styles',
                  className: 'gjs-pn-btn',
                  label: 'Styles',
                },
              ]
            },
          ],
        },
        
        // Set up device manager
        deviceManager: {
          devices: [
            { name: 'Desktop', width: '' },
            { name: 'Tablet', width: '768px' },
            { name: 'Mobile', width: '320px' },
          ],
        },
      });
      
      // Set initial content
      editor.setComponents(initialContent);
      
      // Event handling
      editor.on('change:changesCount', () => {
        if (onChange) {
          onChange(editor.getHtml());
        }
      });
      
      editor.on('storage:store', () => {
        console.log('[GrapesJSExample] Content stored successfully');
        if (onSave) onSave();
      });
      
      editor.on('storage:error', (err) => {
        console.error('[GrapesJSExample] Storage error:', err);
      });
      
      // Save reference
      editorRef.current = editor;
      
      // Cleanup function
      return () => {
        console.log('[GrapesJSExample] Destroying editor');
        editor.destroy();
        editorRef.current = null;
      };
    } catch (err) {
      console.error('[GrapesJSExample] Error initializing editor:', err);
    }
  }, [initialContent, fileName, connectionId, onChange, onSave]);
  
  // Update content when props change
  useEffect(() => {
    if (editorRef.current && initialContent) {
      const currentHtml = editorRef.current.getHtml();
      if (currentHtml !== initialContent) {
        console.log('[GrapesJSExample] Updating content');
        editorRef.current.setComponents(initialContent);
      }
    }
  }, [initialContent]);
  
  // Manual save method
  const handleSave = () => {
    if (editorRef.current) {
      console.log('[GrapesJSExample] Manual save triggered');
      editorRef.current.store({ noStore: false }); // Fix: Added required parameter
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b">
        <button 
          onClick={handleSave}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Save
        </button>
      </div>
      <div ref={containerRef} className="flex-grow" />
    </div>
  );
}
