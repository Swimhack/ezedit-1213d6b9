
import { useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';

export const useEditorFeatures = () => {
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const { isPremium } = useSubscription();

  const handleSave = async (content: string, filePath: string) => {
    if (!isPremium) {
      toast.error("Premium Feature Required: Saving changes requires a premium subscription.");
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
      toast.error("Premium Feature Required: AI assistance requires a premium subscription.");
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
