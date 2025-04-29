
import { useState, useEffect, useRef } from "react";
import { SendIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface ClintPaneProps {
  filePath: string;
  fileContent: string;
  onApplyResponse?: (text: string) => void;
}

export default function ClinePane({ filePath, fileContent, onApplyResponse }: ClintPaneProps) {
  const chatStorageKey = `cline-chat-history-${filePath}`;
  const [messages, setMessages] = useLocalStorage<Array<{ role: 'user' | 'assistant', content: string }>>(
    chatStorageKey,
    []
  );
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Reset messages when file path changes
  useEffect(() => {
    if (filePath && messages.length === 0) {
      setMessages([]);
    }
  }, [filePath, setMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("cline-chat", {
        body: {
          message: userMessage,
          filePath,
          fileContent,
          previousMessages: messages
        },
      });

      if (error) throw new Error(error.message);

      // Add the response to messages
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data?.response || '🤖 No response received' 
      }]);
      
    } catch (error: any) {
      // Handle any errors by showing them in the chat
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `⚠️ Error: ${error.message || 'Something went wrong. Please try again.'}` 
      }]);
      console.error('Cline chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyResponse = (content: string) => {
    if (onApplyResponse) {
      onApplyResponse(content);
      toast.success('Applied response to editor');
    }
  };

  if (!filePath) return null;

  return (
    <div className="flex h-full bg-eznavy-dark relative">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -left-6 top-1/2 -translate-y-1/2 z-10 bg-eznavy-dark p-1 rounded-l-md border-l border-t border-b border-ezgray-dark"
        aria-label={isCollapsed ? "Expand Cline pane" : "Collapse Cline pane"}
      >
        {isCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      <div className={`flex flex-col w-full transition-all duration-300 ${isCollapsed ? 'mr-[-100%]' : ''}`}>
        <div className="px-4 py-2 border-b border-ezgray-dark">
          <h3 className="text-lg font-semibold text-ezwhite">Cline AI Chat</h3>
          {filePath && (
            <p className="text-xs text-ezgray truncate">File: {filePath}</p>
          )}
        </div>

        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="p-3 text-center text-ezgray">
                <p>Ask Cline about this file's code.</p>
              </div>
            )}
            
            {messages.map((message, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-eznavy-light ml-8'
                    : 'bg-ezgray-dark mr-8'
                }`}
              >
                <p className="text-sm text-ezwhite whitespace-pre-wrap">{message.content}</p>
                {message.role === 'assistant' && onApplyResponse && !message.content.startsWith('⚠️') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleApplyResponse(message.content)}
                    className="mt-2"
                  >
                    ↩ Apply to editor
                  </Button>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-center justify-center py-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-ezblue"></div>
              </div>
            )}
          </div>
        </ScrollArea>

        <form onSubmit={handleSubmit} className="p-4 border-t border-ezgray-dark">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the code..."
              className="min-h-[60px]"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={isLoading || !input.trim()}
            >
              <SendIcon className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
