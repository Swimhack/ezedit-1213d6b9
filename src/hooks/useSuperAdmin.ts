
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSuperAdmin = (email?: string | null) => {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!email) {
      setLoading(false);
      return;
    }

    const checkSuperAdmin = async () => {
      try {
        // Get user ID first
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user?.id) {
          setLoading(false);
          return;
        }

        // Check if the user exists in the user_roles table with super_admin role
        const { data, error } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', userData.user.id)
          .eq('role', 'super_admin')
          .single();

        if (error) {
          // If error (table might not exist yet), fallback to hardcoded email check
          if (email === 'james@ekaty.com') {
            setIsSuperAdmin(true);
          }
        } else {
          // If we have data (user found in user_roles as super_admin)
          setIsSuperAdmin(data !== null);
        }
      } catch (err) {
        console.error('Error in useSuperAdmin hook:', err);
        // Fallback to email check for reliability
        if (email === 'james@ekaty.com') {
          setIsSuperAdmin(true);
        }
      } finally {
        setLoading(false);
      }
    };

    checkSuperAdmin();
  }, [email]);

  return { isSuperAdmin, loading };
};
