
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

        // Method 1: Use the has_role function we created in the SQL migration
        const { data: hasRole, error: hasRoleError } = await supabase.rpc(
          'has_role', 
          { target_role: 'super_admin' }
        );

        if (hasRoleError) {
          console.error('Error checking super_admin role:', hasRoleError);
          
          // Method 2: Direct query as fallback if RPC fails
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', userData.user.id)
            .eq('role', 'super_admin')
            .maybeSingle();
            
          if (roleError) {
            console.error('Error checking user_roles table:', roleError);
            // Method 3: Ultimate fallback to hardcoded email
            setIsSuperAdmin(email === 'james@ekaty.com');
          } else {
            setIsSuperAdmin(roleData !== null);
          }
        } else {
          // Use result from RPC function
          setIsSuperAdmin(!!hasRole);
        }
      } catch (err) {
        console.error('Error in useSuperAdmin hook:', err);
        // Final fallback to hardcoded email for reliability
        setIsSuperAdmin(email === 'james@ekaty.com');
      } finally {
        setLoading(false);
      }
    };

    checkSuperAdmin();
  }, [email]);

  return { isSuperAdmin, loading };
};
