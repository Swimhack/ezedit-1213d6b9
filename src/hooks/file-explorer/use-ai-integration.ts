
import { toast } from "sonner";

export function useAiIntegration() {
  const applyAIResponse = (currentContent: string, aiResponse: string) => {
    if (currentContent) {
      const newContent = currentContent + '\n' + aiResponse;
      toast.success("AI response applied to editor");
      return newContent;
    }
    return currentContent;
  };

  return {
    applyAIResponse
  };
}
