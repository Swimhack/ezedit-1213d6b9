
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

        // Check if the user is a super admin
        const { data, error } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', userData.user.id)
          .eq('role', 'super_admin')
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking super admin status:', error);
        }

        setIsSuperAdmin(!!data);
      } catch (err) {
        console.error('Error in useSuperAdmin hook:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSuperAdmin();
  }, [email]);

  return { isSuperAdmin, loading };
};
