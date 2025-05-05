
import { useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';

export const useEditorFeatures = () => {
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const { isPremium } = useSubscription();

  const handleSave = async (content: string, filePath: string) => {
    if (!isPremium) {
      toast({
        title: "Premium Feature Required",
        description: "Saving changes requires a premium subscription.",
        duration: 3000,
      });
      return Promise.reject(new Error("Premium subscription required"));
    }

    try {
      // Implementation of save logic
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };

  const handleAIAssist = () => {
    if (!isPremium) {
      toast({
        title: "Premium Feature Required",
        description: "AI assistance requires a premium subscription.",
        duration: 3000,
      });
      return;
    }
    
    setShowAIAssistant(true);
  };

  return {
    isReadOnly,
    showAIAssistant,
    setShowAIAssistant,
    handleSave,
    handleAIAssist,
    isPremiumUser: isPremium
  };
};
