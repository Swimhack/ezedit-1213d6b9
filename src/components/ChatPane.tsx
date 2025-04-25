
import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

interface ChatPaneProps {
  activeFilePath: string;
  activeFileContent: string;
}

export default function ChatPane({ activeFilePath, activeFileContent }: ChatPaneProps) {
  const [messages, setMessages] = useLocalStorage<Message[]>("chat-messages", []);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // System prompt
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "system-1",
          role: "system",
          content: "I'm your coding assistant. Ask me questions about the code you're working on or how to solve specific programming problems.",
          timestamp: Date.now()
        }
      ]);
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // For this demo, we'll just simulate an AI response
    // In a real app, you'd call an AI service
    setTimeout(() => {
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: generateMockResponse(input, activeFilePath, activeFileContent),
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  // Simple mock response generator for demo purposes
  const generateMockResponse = (question: string, filePath: string, fileContent: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes("hello") || lowerQuestion.includes("hi")) {
      return "Hello! I'm your coding assistant. How can I help you with your code today?";
    }
    
    if (lowerQuestion.includes("what") && lowerQuestion.includes("file")) {
      return filePath 
        ? `You're currently working on: ${filePath}`
        : "You haven't selected a file yet. Select a file from the file tree to start editing.";
    }
    
    if (lowerQuestion.includes("explain") || lowerQuestion.includes("what does this")) {
      return fileContent
        ? "This code appears to be implementing a web application component. I can see it's using React hooks and making network requests. What specific part would you like me to explain?"
        : "Please select a file first so I can analyze the code for you.";
    }
    
    return "I'm a mock AI assistant for demonstration purposes. In a real implementation, I would provide helpful coding assistance and answer your questions about the code you're working on.";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 border-b border-ezgray-dark">
        <h2 className="text-lg font-semibold">AI Assistant</h2>
      </div>
      
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-4">
          {messages.filter(m => m.role !== "system").map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === "assistant"
                    ? "bg-eznavy-dark text-ezwhite"
                    : "bg-ezblue text-eznavy"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 text-right mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="p-2 border-t border-ezgray-dark">
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me about your code..."
            className="resize-none"
            rows={2}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className="h-10"
          >
            <Send size={18} />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
