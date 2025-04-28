
import React, { useEffect, useRef, useState } from 'react';
import TipTapWrapper from './TipTapWrapper';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Wand, Maximize, Minimize, Save, Code } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import grapesjs from 'grapesjs';
import 'grapesjs-preset-webpage';

interface WysiwygEditorProps {
  content: string;
  onChange: (content: string) => void;
  editorRef?: React.RefObject<HTMLDivElement>;
}

interface AICommand {
  command: string;
  timestamp: number;
}

export function WysiwygEditor({ content, onChange, editorRef }: WysiwygEditorProps) {
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiCommand, setAICommand] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [recentCommands, setRecentCommands] = useState<AICommand[]>([]);
  const tiptapEditorRef = useRef<any>(null);
  const gjsEditorRef = useRef<any>(null);
  const [editorMode, setEditorMode] = useState<'rich' | 'visual'>('rich');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Initialize GrapesJS editor for visual mode
  useEffect(() => {
    if (editorMode === 'visual' && !gjsEditorRef.current) {
      const editor = grapesjs.init({
        container: '#gjs-editor',
        height: '100%',
        width: '100%',
        storageManager: false,
        panels: { defaults: [] },
        deviceManager: {
          devices: [
            {
              name: 'Desktop',
              width: '',
            },
            {
              name: 'Tablet',
              width: '768px',
              widthMedia: '992px',
            },
            {
              name: 'Mobile',
              width: '320px',
              widthMedia: '480px',
            },
          ]
        },
        blockManager: {
          appendTo: '#blocks',
          blocks: [
            {
              id: 'section',
              label: 'Section',
              attributes: { class: 'gjs-block-section' },
              content: '<section class="p-4"><h2>Insert title here</h2><p>Insert content here</p></section>',
            },
            {
              id: 'text',
              label: 'Text',
              content: '<p class="m-0">Insert text here</p>',
            },
            {
              id: 'image',
              label: 'Image',
              content: { type: 'image' },
              attributes: { class: 'gjs-block-image' }
            },
            {
              id: 'button',
              label: 'Button',
              content: '<button class="px-4 py-2 text-white bg-blue-500 rounded">Click Me</button>',
            },
          ]
        },
        styleManager: {
          appendTo: '#styles',
          sectors: [
            {
              name: 'Dimension',
              open: false,
              properties: [
                'width',
                'height',
                'min-width',
                'min-height',
                'padding',
                'margin'
              ]
            },
            {
              name: 'Typography',
              open: false,
              properties: [
                'font-family',
                'font-size',
                'font-weight',
                'color',
                'text-align',
                'line-height'
              ]
            },
            {
              name: 'Decorations',
              open: false,
              properties: [
                'background-color',
                'border-radius',
                'border',
                'box-shadow'
              ]
            }
          ]
        }
      });

      editor.setComponents(content);
      editor.on('component:update', () => {
        const htmlContent = editor.getHtml();
        onChange(htmlContent);
      });

      gjsEditorRef.current = editor;
    }

    return () => {
      if (gjsEditorRef.current && editorMode !== 'visual') {
        gjsEditorRef.current.destroy();
        gjsEditorRef.current = null;
      }
    };
  }, [editorMode, content]);

  // Update GrapesJS content when the prop changes
  useEffect(() => {
    if (editorMode === 'visual' && gjsEditorRef.current) {
      gjsEditorRef.current.setComponents(content);
    }
  }, [content, editorMode]);

  // Toggle AI assistant panel
  const toggleAIAssistant = () => {
    setShowAIAssistant(!showAIAssistant);
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          containerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  // Process AI command
  const processAICommand = async () => {
    if (!aiCommand.trim()) return;
    
    setIsPending(true);
    try {
      // If using Supabase Edge Functions:
      const { data, error } = await supabase.functions.invoke('cline-chat', {
        body: {
          message: `Act as a web designer. Apply the following change to HTML content: "${aiCommand}". 
          Respond only with the transformed HTML code, no explanations.`,
          filePath: '',
          fileContent: content,
          previousMessages: []
        }
      });
      
      if (error) throw new Error(error.message);
      
      // Extract the HTML from the response
      const responseText = data?.response || '';
      const htmlMatch = responseText.match(/```html\n([\s\S]*?)\n```/) || 
                        responseText.match(/```([\s\S]*?)```/) || 
                        [null, responseText];
      
      let processedHtml = htmlMatch[1] || responseText;
      
      // Clean up AI response if needed
      processedHtml = processedHtml.trim();
      
      // Apply the changes
      onChange(processedHtml);
      
      // Add command to recent list
      setRecentCommands(prev => {
        const newCommands = [{ command: aiCommand, timestamp: Date.now() }, ...prev].slice(0, 5);
        return newCommands;
      });
      
      setAICommand('');
      toast.success('AI changes applied');
    } catch (error) {
      console.error('Error processing AI command:', error);
      toast.error('Failed to process command');
    } finally {
      setIsPending(false);
    }
  };
  
  // Handle keyboard shortcut for AI panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'a') {
        toggleAIAssistant();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAIAssistant]);
  
  // Use a recent command
  const useRecentCommand = (command: string) => {
    setAICommand(command);
  };
  
  return (
    <div className="relative h-full" ref={containerRef}>
      <div className="flex items-center justify-between p-1 bg-gray-100 dark:bg-gray-800 border-b">
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={editorMode === 'rich' ? 'bg-gray-200 dark:bg-gray-700' : ''}
            onClick={() => setEditorMode('rich')}
          >
            Rich Text
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={editorMode === 'visual' ? 'bg-gray-200 dark:bg-gray-700' : ''}
            onClick={() => setEditorMode('visual')}
          >
            Visual Builder
          </Button>
        </div>
        
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAIAssistant}
            title="AI Assistant (Alt+A)"
          >
            <Wand size={16} />
          </Button>
        </div>
      </div>

      {editorMode === 'rich' ? (
        <TipTapWrapper
          html={content}
          onChange={onChange}
          editorRef={tiptapEditorRef}
        />
      ) : (
        <div className="h-[calc(100%-36px)] flex">
          <div className="w-64 border-r overflow-y-auto">
            <div className="p-2 bg-gray-50 dark:bg-gray-900 border-b font-medium text-sm">Blocks</div>
            <div id="blocks" className="p-2"></div>
            <div className="p-2 bg-gray-50 dark:bg-gray-900 border-b border-t font-medium text-sm mt-2">Styles</div>
            <div id="styles" className="p-2"></div>
          </div>
          <div className="flex-1">
            <div id="gjs-editor" className="h-full"></div>
          </div>
        </div>
      )}
      
      {showAIAssistant && (
        <div className="absolute bottom-16 right-4 w-80 bg-background border rounded-lg shadow-lg p-3 z-10">
          <h3 className="text-sm font-semibold mb-2">AI Editor Assistant</h3>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Enter a natural language command to edit the content
            </p>
            <Input
              placeholder="E.g., 'make all headings blue'"
              value={aiCommand}
              onChange={(e) => setAICommand(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  processAICommand();
                }
              }}
              disabled={isPending}
            />
            <Button 
              className="w-full" 
              size="sm" 
              onClick={processAICommand} 
              disabled={isPending}
            >
              {isPending ? 'Processing...' : 'Apply Changes'}
            </Button>
            
            {recentCommands.length > 0 && (
              <div className="mt-3">
                <h4 className="text-xs font-medium mb-1">Recent Commands:</h4>
                <ul className="text-xs space-y-1">
                  {recentCommands.map((cmd, i) => (
                    <li key={cmd.timestamp} className="flex">
                      <button
                        className="text-left hover:text-primary truncate max-w-[90%]"
                        onClick={() => useRecentCommand(cmd.command)}
                      >
                        {cmd.command}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
