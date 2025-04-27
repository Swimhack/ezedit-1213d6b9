
import React, { useEffect, useRef, useState } from 'react';
import TipTapWrapper from './TipTapWrapper';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Wand } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
  
  // Toggle AI assistant panel
  const toggleAIAssistant = () => {
    setShowAIAssistant(!showAIAssistant);
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
    <div className="relative h-full">
      <TipTapWrapper
        html={content}
        onChange={onChange}
        editorRef={tiptapEditorRef}
      />
      
      <div className="absolute bottom-4 right-4">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full shadow-md bg-background"
          onClick={toggleAIAssistant}
          title="AI Assistant (Alt+A)"
        >
          <Wand className="h-4 w-4" />
        </Button>
      </div>
      
      {showAIAssistant && (
        <div className="absolute bottom-16 right-4 w-80 bg-background border rounded-lg shadow-lg p-3">
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
