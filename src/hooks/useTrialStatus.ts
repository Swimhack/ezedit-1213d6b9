
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export interface TrialStatus {
  isActive: boolean;
  expiresAt: string | null;
  daysRemaining: number | null;
  loading: boolean;
  error: string | null;
}

export function useTrialStatus(email?: string | null) {
  const [status, setStatus] = useState<TrialStatus>({
    isActive: false,
    expiresAt: null,
    daysRemaining: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!email) {
      setStatus(prev => ({ ...prev, loading: false }));
      return;
    }

    const checkTrialStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('trial_users')
          .select('*')
          .eq('email', email)
          .eq('active', true)
          .single();

        if (error) {
          if (error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
            console.error('Error checking trial status:', error);
            setStatus({
              isActive: false,
              expiresAt: null,
              daysRemaining: null,
              loading: false,
              error: error.message
            });
          } else {
            // No active trial found
            setStatus({
              isActive: false,
              expiresAt: null,
              daysRemaining: null,
              loading: false,
              error: null
            });
          }
          return;
        }

        if (data) {
          const now = new Date();
          const expiresAt = new Date(data.expires_at);
          const diffTime = expiresAt.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          setStatus({
            isActive: true,
            expiresAt: data.expires_at,
            daysRemaining: diffDays,
            loading: false,
            error: null
          });
        } else {
          setStatus({
            isActive: false,
            expiresAt: null,
            daysRemaining: null,
            loading: false,
            error: null
          });
        }
      } catch (error: any) {
        console.error('Error in useTrialStatus:', error);
        setStatus({
          isActive: false,
          expiresAt: null,
          daysRemaining: null,
          loading: false,
          error: error.message
        });
      }
    };

    checkTrialStatus();
  }, [email]);

  return status;
}
