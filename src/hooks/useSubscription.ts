
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useSubscription() {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsPremium(false);
          setIsLoading(false);
          return;
        }

        // Check if user has an active subscription
        const { data: subscription, error } = await supabase
          .from('subscriptions')
          .select('status')
          .eq('user_id', session.user.id)
          .single();

        if (error) {
          console.error('Error checking subscription:', error);
          setIsPremium(false);
        } else {
          setIsPremium(subscription?.status === 'active');
        }
      } catch (err) {
        console.error('Error in subscription check:', err);
        setIsPremium(false);
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
  }, []);

  return { isPremium, isLoading };
}
