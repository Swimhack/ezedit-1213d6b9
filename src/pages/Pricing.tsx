
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";

// Import the new components
import { PricingHero } from "@/components/pricing/HeroSection";
import { PricingPlans } from "@/components/pricing/PricingPlans";
import { EnterpriseSection } from "@/components/pricing/EnterpriseSection";
import { FaqSection } from "@/components/pricing/FaqSection";
import { CallToAction } from "@/components/pricing/CallToAction";
import { SubscriptionDialogs } from "@/components/pricing/SubscriptionDialogs";

const Pricing = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCanceled, setShowCanceled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Business Pro Monthly and Yearly price IDs (replace with your actual Stripe price IDs)
  const BUSINESS_PRO_MONTHLY_PRICE_ID = "price_monthly_id";
  const BUSINESS_PRO_YEARLY_PRICE_ID = "price_yearly_id";

  // Check for success or canceled URL parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true);
      // Clear the URL parameter
      navigate('/pricing', { replace: true });
    } else if (searchParams.get('canceled') === 'true') {
      setShowCanceled(true);
      // Clear the URL parameter
      navigate('/pricing', { replace: true });
    }
  }, [navigate]);

  // Check for authenticated user
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      setIsLoading(false);
    };
    
    checkUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Get subscription status
  const { 
    subscribed,
    subscriptionTier,
    isLoading: subLoading,
    handleCheckout
  } = useSubscription(user?.email);

  const plans = [
    {
      name: "Free Trial",
      description: "Essential tools for personal websites",
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        "50 AI-powered edits per month",
        "1 FTP connection",
        "Basic version history (7 days)",
        "Community support",
        "1 GB storage"
      ],
      popular: false,
      cta: "Get Started",
      priceId: null,
      tier: "free_trial" as const,
      disclaimer: "7-day trial period"
    },
    {
      name: "Business Pro",
      description: "Enhanced tools for growing websites",
      monthlyPrice: 50,
      yearlyPrice: 480, // $40/month billed yearly
      features: [
        "Unlimited AI-powered edits",
        "5 FTP connections",
        "Extended version history (90 days)",
        "Priority support",
        "10 GB storage",
        "Custom domain support",
        "Team collaboration (2 seats)",
        "Security scanning"
      ],
      popular: true,
      cta: "Subscribe",
      priceId: { monthly: BUSINESS_PRO_MONTHLY_PRICE_ID, yearly: BUSINESS_PRO_YEARLY_PRICE_ID },
      tier: "business_pro" as const,
      disclaimer: "Billed monthly"
    }
  ];

  const faqItems = [
    {
      question: "What happens when I reach my monthly edit limit?",
      answer: "When you reach your monthly edit limit, you can either upgrade to a higher plan or wait until your allotment resets at the start of the next billing cycle. You'll always be able to view your websites and make manual edits, even if you've reached your AI edit limit."
    },
    {
      question: "Can I cancel my subscription at any time?",
      answer: "Yes, you can cancel your subscription at any time. Your service will continue until the end of your current billing period. We do not offer refunds for partial months."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards including Visa, Mastercard, American Express, and Discover. For Enterprise plans, we also accept bank transfers and purchase orders."
    },
    {
      question: "Is there a setup fee?",
      answer: "No, there are no setup fees for any of our plans. You only pay the advertised subscription price."
    },
    {
      question: "Do you offer discounts for non-profits or educational institutions?",
      answer: "Yes, we offer special pricing for non-profit organizations, educational institutions, and open-source projects. Please contact our sales team for more information."
    }
  ];

  const handleSubscribe = async (plan: any, billingPeriod: 'monthly' | 'yearly') => {
    if (!user) {
      toast.info("Please login first to subscribe");
      navigate("/login", { state: { from: "/pricing" } });
      return;
    }

    if (!plan.priceId) {
      if (plan.tier === "free_trial") {
        navigate("/register");
      }
      return;
    }

    const priceId = billingPeriod === 'monthly' ? plan.priceId.monthly : plan.priceId.yearly;
    await handleCheckout(priceId);
  };

  if (isLoading || subLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader className="h-8 w-8 animate-spin text-ezblue mb-4" />
            <p className="text-ezgray">Loading plans...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <SubscriptionDialogs 
          showSuccess={showSuccess}
          setShowSuccess={setShowSuccess}
          showCanceled={showCanceled}
          setShowCanceled={setShowCanceled}
        />
        
        <PricingHero />
        
        <PricingPlans 
          plans={plans}
          subscriptionTier={subscriptionTier}
          handleSubscribe={handleSubscribe}
        />
        
        <EnterpriseSection />
        
        <FaqSection faqItems={faqItems} />
        
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
