
import { useState, useRef, FormEvent, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface KleinChatProps {
  filePath: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function KleinChat({ filePath }: KleinChatProps) {
  const chatStorageKey = `klein-chat-history-${filePath}`;
  
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>(
    chatStorageKey,
    [{role: 'assistant', content: `Ask Klein about ${filePath}…`}]
  );
  
  const formRef = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Reset initial message when file path changes
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{role: 'assistant', content: `Ask Klein about ${filePath}…`}]);
    }
  }, [filePath, setMessages, messages.length]);

  async function send(e: FormEvent) {
    e.preventDefault();
    const input = (formRef.current!.elements.namedItem('prompt') as HTMLInputElement);
    const prompt = input.value.trim();
    if (!prompt) return;
    setMessages(m => [...m, {role: 'user', content: prompt}]);
    input.value = '';
    setIsLoading(true);

    try {
      // First try Klein API if key exists
      if (window.ENV?.KLEIN_API_KEY) {
        const allMessages = [...messages, {role: 'user', content: prompt}];
        const res = await fetch('https://api.klein.ai/v1/chat', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${window.ENV.KLEIN_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'system',
                content: `You are a helpful AI assistant analyzing code. The current file being discussed is: ${filePath}`
              },
              ...allMessages.map(m => ({
                role: m.role,
                content: m.content
              }))
            ]
          })
        });
        const data = await res.json();
        setMessages(m => [...m, {role: 'assistant', content: data.choices[0].message.content}]);
      } else {
        // Fallback to echo endpoint when no API key
        setMessages(m => [...m, {
          role: 'assistant', 
          content: `[Demo Mode] Echo: ${prompt}\n\nNote: Klein API key not configured. This is a demo response.`
        }]);
      }
    } catch (error) {
      console.error('Klein chat error:', error);
      setMessages(m => [...m, {
        role: 'assistant',
        content: 'Sorry, there was an error processing your request.'
      }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col border-l border-slate-800">
      <header className="px-4 py-2 font-semibold text-slate-200 bg-slate-800">
        Klein AI Chat
        <div className="text-xs text-slate-400 truncate">{filePath}</div>
      </header>

      <div className="flex-1 overflow-y-auto space-y-4 p-4 text-sm">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-right' : ''}>
            <span className={m.role === 'user' ? 'text-emerald-400' : 'text-indigo-300'}>
              {m.content}
            </span>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-indigo-300 animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-indigo-300 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 rounded-full bg-indigo-300 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        )}
      </div>

      <form ref={formRef} onSubmit={send} className="p-2 border-t border-slate-800">
        <input
          name="prompt"
          placeholder="Type a question…"
          className="w-full rounded bg-slate-700 px-3 py-2 text-slate-200 focus:outline-none"
          disabled={isLoading}
        />
      </form>
    </div>
  );
}
