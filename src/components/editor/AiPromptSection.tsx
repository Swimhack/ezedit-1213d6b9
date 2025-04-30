
import React from 'react';
import { Loader } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface AiPromptSectionProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  isAiProcessing: boolean;
  onApplyAiChanges: () => void;
}

export function AiPromptSection({
  prompt,
  setPrompt,
  isAiProcessing,
  onApplyAiChanges
}: AiPromptSectionProps) {
  return (
    <div className="p-2 border-t flex gap-2">
      <Textarea
        placeholder="Describe the changes you want to make..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="flex-1 h-16 resize-none"
        disabled={isAiProcessing}
      />
      <Button 
        onClick={onApplyAiChanges} 
        disabled={!prompt.trim() || isAiProcessing}
        className="shrink-0 self-end"
      >
        {isAiProcessing ? (
          <>
            <Loader className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : "Apply Changes"}
      </Button>
    </div>
  );
}
