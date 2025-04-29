
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { toast } from "sonner";
import { Loader } from "lucide-react";

interface TrialProtectionProps {
  children: React.ReactNode;
}

const TrialProtection = ({ children }: TrialProtectionProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const trialStatus = useTrialStatus(user?.email);

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
      navigate("/register");
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (user && !trialStatus.loading) {
      if (!trialStatus.isActive) {
        toast.warning("Your trial has expired or isn't active. Please upgrade your account.");
        navigate("/pricing");
      } else if (trialStatus.daysRemaining !== null && trialStatus.daysRemaining <= 2) {
        // Show warning for trials with 2 or fewer days left
        toast.warning(`Your trial expires in ${trialStatus.daysRemaining} days. Consider upgrading.`);
      } else {
        // Trial is valid and not about to expire
        setLoading(false);
      }
    }
  }, [trialStatus, user, navigate]);

  if (loading || trialStatus.loading) {
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
