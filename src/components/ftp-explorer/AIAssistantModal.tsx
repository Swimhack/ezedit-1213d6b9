
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Check } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

interface AIAssistantModalProps {
  isOpen: boolean;
  filePath: string;
  fileContent: string;
  onClose: () => void;
  onApplyResponse: (content: string) => void;
  onBack: () => void;
}

export function AIAssistantModal({
  isOpen,
  filePath,
  fileContent,
  onClose,
  onApplyResponse,
  onBack
}: AIAssistantModalProps) {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    setIsProcessing(true);

    try {
      // Simple AI simulation for now - can be replaced with actual API call
      // This is just a placeholder function that returns modified content
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simple example that adds comments to the code
      const aiModifiedContent = `/* AI modified this file based on prompt: "${prompt}" */\n\n${fileContent}`;
      
      setResponse(aiModifiedContent);
    } catch (error) {
      console.error("AI processing error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApply = () => {
    if (response) {
      onApplyResponse(response);
      onBack();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 gap-0">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Editor
            </Button>
            <h2 className="text-lg font-medium">AI Assistant</h2>
          </div>
          
          {response && (
            <Button size="sm" onClick={handleApply}>
              <Check className="h-4 w-4 mr-2" />
              Apply Changes
            </Button>
          )}
        </div>

        <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
          <div className="md:w-1/2 p-4 border-r flex flex-col h-full">
            <h3 className="text-sm font-medium mb-2">What would you like to change?</h3>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what changes you want to make to this file..."
              className="flex-grow resize-none mb-4"
            />
            <Button 
              onClick={handleSubmit} 
              disabled={!prompt.trim() || isProcessing}
              className="self-end"
            >
              {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Get AI Suggestions
            </Button>
          </div>
          
          <div className="md:w-1/2 p-4 flex flex-col h-full">
            <h3 className="text-sm font-medium mb-2">AI Response</h3>
            {isProcessing ? (
              <div className="flex-grow flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Processing your request...
              </div>
            ) : response ? (
              <pre className="flex-grow whitespace-pre-wrap overflow-auto p-4 bg-muted rounded-md text-sm">
                {response}
              </pre>
            ) : (
              <div className="flex-grow flex items-center justify-center text-muted-foreground">
                AI response will appear here
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
