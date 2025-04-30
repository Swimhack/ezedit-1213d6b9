
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";
import { Loader } from "lucide-react";

interface TrialProtectionProps {
  children: React.ReactNode;
  requiresSubscription?: boolean;
}

const TrialProtection = ({ children, requiresSubscription = false }: TrialProtectionProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const trialStatus = useTrialStatus(user?.email);
  const { isSuperAdmin, loading: superAdminLoading } = useSuperAdmin(user?.email);
  const { subscribed, isLoading: subLoading } = useSubscription(user?.email);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (data.session?.user) {
        setUser(data.session.user);
      } else {
        // If no logged in user, check if we need to redirect
        setLoading(false);
      }
    };
    
    checkUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (!session?.user) {
        setLoading(false);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    if (!loading && !user) {
      toast.info("Please login or start a trial to access this feature");
      navigate("/login");
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    // First check if super admin status is loaded - if they are a super admin, allow immediate access
    if (!superAdminLoading && isSuperAdmin && user) {
      console.log("Super admin access granted to:", user.email);
      setLoading(false);
      return; // Early return for super admins
    }
    
    // Then check if subscription status is loaded - if they are subscribed, allow immediate access
    if (!subLoading && subscribed && user) {
      console.log("Paid subscriber access granted to:", user.email);
      setLoading(false);
      return; // Early return for paid subscribers
    }
    
    // If user exists and we've finished loading both trial status, subscription status and super admin status
    if (user && !trialStatus.loading && !superAdminLoading && !subLoading) {
      // If this feature requires a subscription and user doesn't have one
      if (requiresSubscription && !subscribed && !isSuperAdmin) {
        toast.warning("This feature requires a paid subscription. Please upgrade your account.");
        navigate("/pricing");
        return;
      }

      // Regular trial status check for users who are not super admins or paid subscribers
      if (!trialStatus.isActive && !isSuperAdmin && !subscribed) {
        toast.warning("Your trial has expired. Please upgrade your account.");
        navigate("/pricing");
      } else if (trialStatus.daysRemaining !== null && trialStatus.daysRemaining <= 2) {
        // Show warning for trials with 2 or fewer days left
        toast.warning(`Your trial expires in ${trialStatus.daysRemaining} days. Consider upgrading.`);
        setLoading(false);
      } else {
        // Trial is valid and not about to expire
        setLoading(false);
      }
    }
  }, [trialStatus, user, navigate, isSuperAdmin, superAdminLoading, subscribed, subLoading, requiresSubscription]);

  if (loading || trialStatus.loading || superAdminLoading || subLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-ezblue mb-4" />
        <p className="text-ezgray">Verifying access...</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default TrialProtection;
