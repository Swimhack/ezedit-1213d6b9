
import { useSubscription } from "@/hooks/useSubscription";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { useEditorStore } from "@/store/editorStore";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

export const useEditorFeatures = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Get existing stores and hooks
  const { content } = useEditorStore();
  const { subscribed } = useSubscription(user?.email);
  const trialStatus = useTrialStatus(user?.email);
  
  // Check for authenticated user
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      setLoading(false);
    };
    
    checkUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Determine feature flags
  const canSaveFiles = subscribed;
  const canViewHistory = subscribed;
  const canConnectMultipleSites = subscribed;
  const canAccessPrioritySupport = subscribed;
  const hasUnlimitedPreviews = true; // Available to all tiers
  const isInTrial = !subscribed && trialStatus.isActive;
  
  // Return feature flags and user status
  return {
    canSaveFiles,
    canViewHistory,
    canConnectMultipleSites,
    canAccessPrioritySupport,
    hasUnlimitedPreviews,
    isInTrial,
    isLoading: loading,
    user,
    trialDaysRemaining: trialStatus.daysRemaining,
    trialActive: trialStatus.isActive
  };
};
