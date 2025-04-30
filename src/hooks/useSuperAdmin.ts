
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

        // Check if the user exists in the user_roles table
        // This will be handled by RLS policies and will return null if the table doesn't exist
        const { data, error } = await supabase.rpc('has_super_admin_role', {
          user_id: userData.user.id
        }).single();

        if (error) {
          // If the function doesn't exist, fallback to hardcoded email check
          if (email === 'james@ekaty.com') {
            setIsSuperAdmin(true);
          }
        } else {
          setIsSuperAdmin(!!data?.is_super_admin);
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
