
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
    // Skip login check for now to allow dashboard access
    setLoading(false);
  }, [loading, user, navigate]);

  if (loading || trialStatus.loading || superAdminLoading || subLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-ezblue mb-4" />
        <p className="text-ezgray">Verifying access...</p>
      </div>
    );
  }

  // Always show content regardless of trial status
  return <>{children}</>;
};

export default TrialProtection;
