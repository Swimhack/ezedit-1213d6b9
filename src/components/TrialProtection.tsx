
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
  const [loading, setLoading] = useState(false); // Changed to false for instant loading
  const trialStatus = useTrialStatus(user?.email);
  const { isSuperAdmin, loading: superAdminLoading } = useSuperAdmin(user?.email);
  const { 
    isPremium, 
    isLoading: subLoading,
    subscribed
  } = useSubscription(user?.email);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (data.session?.user) {
        setUser(data.session.user);
      } 
      // Always ensure we're not blocking rendering
      setLoading(false);
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

  // We're removing this effect as it's redundant and causes delays
  // The checkUser function above already sets loading to false

  // Show loader only when explicitly waiting for critical data
  if (trialStatus.loading && requiresSubscription) {
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
