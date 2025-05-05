
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useSubscription(userEmail?: string) {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<'free_trial' | 'business_pro'>('free_trial');
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);

  const handleCheckout = async (priceId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to subscribe");
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
      });

      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error('Error creating checkout session:', err);
      toast.error(`Failed to start checkout: ${err.message}`);
    }
  };

  const handleCustomerPortal = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("You must be logged in to manage your subscription");
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('customer-portal', {});
      
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error('Error accessing customer portal:', err);
      toast.error(`Failed to open customer portal: ${err.message}`);
    }
  };

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsPremium(false);
          setSubscribed(false);
          setSubscriptionTier('free_trial');
          setIsLoading(false);
          return;
        }

        // First check local database for cached subscription info
        const { data: subscription, error } = await supabase
          .from('subscriptions')
          .select('status, canceled_at, trial_end')
          .eq('user_id', session.user.id)
          .single();

        if (subscription && !error) {
          setIsPremium(subscription.status === 'active');
          setSubscribed(subscription.status === 'active');
          setSubscriptionTier(subscription.status === 'active' ? 'business_pro' : 'free_trial');
          setSubscriptionEnd(subscription.trial_end);
        }

        // Check remote subscription status via edge function
        try {
          const { data, error: fnError } = await supabase.functions.invoke('check-subscription', {});
          
          if (fnError) {
            console.error('Error checking subscription via function:', fnError);
            return;
          }
          
          if (data) {
            setIsPremium(data.subscribed);
            setSubscribed(data.subscribed);
            setSubscriptionTier(data.subscription_tier || 'free_trial');
            setSubscriptionEnd(data.subscription_end);
          }
        } catch (fnErr) {
          console.error('Error in subscription check function:', fnErr);
        }
      } catch (err) {
        console.error('Error in subscription check:', err);
        setIsPremium(false);
        setSubscribed(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();

    // Set up subscription to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      checkSubscription();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [userEmail]);

  return { 
    isPremium, 
    isLoading, 
    subscribed, 
    subscriptionTier, 
    subscriptionEnd, 
    handleCheckout, 
    handleCustomerPortal 
  };
}
