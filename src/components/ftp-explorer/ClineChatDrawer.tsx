
import { useState } from "react";
import { SendHorizonal, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ClineChatDrawerProps {
  filePath: string;
  code: string;
  onInsert: (snippet: string) => void;
}

export function ClineChatDrawer({ filePath, code, onInsert }: ClineChatDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSend = async () => {
    if (!question.trim() || isLoading) return;
    
    const userQuestion = question.trim();
    setMessages(prev => [...prev, { role: "user", text: userQuestion }]);
    setQuestion("");
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("cline-chat", {
        body: {
          message: userQuestion,
          filePath: filePath,
          fileContent: code,
          previousMessages: messages.map(m => ({
            role: m.role === "user" ? "user" : "assistant",
            content: m.text
          }))
        },
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      setMessages(prev => [...prev, { 
        role: "ai", 
        text: data?.response || "No response received from AI" 
      }]);
      
    } catch (error: any) {
      console.error("Cline chat error:", error);
      toast.error("Error communicating with Cline");
      setMessages(prev => [...prev, { 
        role: "ai", 
        text: `⚠️ Error: ${error.message || "Something went wrong. Please try again."}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleApplyResponse = (text: string) => {
    onInsert(text);
    toast.success("AI response applied to editor");
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="fixed right-4 top-16 z-50 rounded-full bg-ezblue text-white shadow-lg hover:bg-ezblue/90"
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle size={18} />
      </Button>

      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className="h-[80vh]">
          <DrawerHeader className="border-b">
            <DrawerTitle>Cline AI Assistant</DrawerTitle>
          </DrawerHeader>
          
          <ScrollArea className="h-[calc(80vh-10rem)] p-4">
            <div className="flex flex-col gap-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`rounded-lg p-3 ${
                    msg.role === "user"
                      ? "bg-gray-100 ml-6 dark:bg-gray-800"
                      : "bg-ezblue/10 mr-6"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {msg.text}
                  </p>
                  {msg.role === "ai" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 text-xs"
                      onClick={() => handleApplyResponse(msg.text)}
                    >
                      Apply to Editor
                    </Button>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-center py-4">
                  <div className="animate-spin h-5 w-5 border-2 border-ezblue border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="flex items-center gap-2 p-4 border-t">
            <Input
              placeholder="Ask about this code..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              className="flex-1"
            />
            <Button 
              onClick={handleSend} 
              disabled={isLoading || !question.trim()} 
              size="icon"
            >
              <SendHorizonal size={18} />
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
