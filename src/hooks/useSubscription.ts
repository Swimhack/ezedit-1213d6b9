
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SubscriptionStatus {
  subscribed: boolean;
  subscriptionTier: 'free_trial' | 'business_pro' | null;
  subscriptionEnd: string | null;
  isLoading: boolean;
  error: string | null;
  checkStatus: () => Promise<void>;
  handleCustomerPortal: () => Promise<void>;
  handleCheckout: (priceId: string) => Promise<void>;
  canUploadFiles: boolean;
  canEditFiles: boolean;
}

export function useSubscription(email?: string | null): SubscriptionStatus {
  const [status, setStatus] = useState<Omit<SubscriptionStatus, 'checkStatus' | 'handleCustomerPortal' | 'handleCheckout' | 'canUploadFiles' | 'canEditFiles'>>({
    subscribed: false,
    subscriptionTier: null,
    subscriptionEnd: null,
    isLoading: true,
    error: null
  });

  const checkStatus = async () => {
    if (!email) {
      setStatus(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      setStatus(prev => ({ ...prev, isLoading: true }));
      const { data, error } = await supabase.functions.invoke('check-subscription');

      if (error) {
        console.error('Error checking subscription status:', error);
        setStatus({
          subscribed: false,
          subscriptionTier: null,
          subscriptionEnd: null,
          isLoading: false,
          error: error.message
        });
        return;
      }

      setStatus({
        subscribed: !!data.subscribed,
        subscriptionTier: data.subscription_tier || null,
        subscriptionEnd: data.subscription_end || null,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Error in useSubscription:', error);
      setStatus({
        subscribed: false,
        subscriptionTier: null,
        subscriptionEnd: null,
        isLoading: false,
        error: error.message || 'An error occurred'
      });
    }
  };

  const handleCustomerPortal = async () => {
    try {
      setStatus(prev => ({ ...prev, isLoading: true }));
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
        toast.error('Failed to open customer portal');
        setStatus(prev => ({ ...prev, isLoading: false, error: error.message }));
        return;
      }
      
      // Redirect to Stripe Customer Portal
      window.location.href = data.url;
    } catch (error: any) {
      toast.error('Failed to open customer portal');
      setStatus(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || 'An error occurred' 
      }));
    }
  };

  const handleCheckout = async (priceId: string) => {
    try {
      setStatus(prev => ({ ...prev, isLoading: true }));
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId }
      });
      
      if (error) {
        toast.error('Failed to create checkout session');
        setStatus(prev => ({ ...prev, isLoading: false, error: error.message }));
        return;
      }
      
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error: any) {
      toast.error('Failed to create checkout session');
      setStatus(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || 'An error occurred' 
      }));
    }
  };

  useEffect(() => {
    checkStatus();
  }, [email]);

  // Determine user capabilities based on subscription tier
  const canUploadFiles = status.subscribed || status.subscriptionTier === 'business_pro';
  const canEditFiles = status.subscribed || status.subscriptionTier === 'business_pro';

  return {
    ...status,
    checkStatus,
    handleCustomerPortal,
    handleCheckout,
    canUploadFiles,
    canEditFiles
  };
}
