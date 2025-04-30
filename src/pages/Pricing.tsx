import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader } from "lucide-react";

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

  const isCurrentPlan = (planTier: 'free_trial' | 'business_pro') => {
    return subscriptionTier === planTier;
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
        {/* Success Dialog */}
        <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Subscription Successful!</DialogTitle>
              <DialogDescription>
                Thank you for subscribing to EzEdit Business Pro. Your payment was successful and your subscription is now active.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end">
              <Button onClick={() => setShowSuccess(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Canceled Dialog */}
        <Dialog open={showCanceled} onOpenChange={setShowCanceled}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Subscription Canceled</DialogTitle>
              <DialogDescription>
                Your subscription process was canceled. If you have any questions or need assistance, feel free to contact our support team.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end">
              <Button onClick={() => setShowCanceled(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Hero Section */}
        <section className="py-16 px-4 bg-eznavy">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-ezwhite">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-ezgray max-w-3xl mx-auto mb-6">
              Choose the plan that fits your needs. All plans include core features with no hidden costs.
            </p>
          </div>
        </section>

        {/* Pricing Plans */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <Tabs defaultValue="monthly" className="w-full">
              <div className="flex justify-center mb-8">
                <TabsList>
                  <TabsTrigger value="monthly">Monthly Billing</TabsTrigger>
                  <TabsTrigger value="yearly">Yearly Billing (Save 20%)</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="monthly" className="w-full">
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  {plans.map((plan, index) => (
                    <Card 
                      key={index} 
                      className={`${
                        plan.popular ? 'border-ezblue ring-2 ring-ezblue' : 'border-ezgray-dark'
                      } relative ${isCurrentPlan(plan.tier) ? 'bg-eznavy-light/30' : ''}`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-4 left-0 right-0 flex justify-center">
                          <span className="bg-ezblue px-3 py-1 text-eznavy text-sm font-semibold rounded-full">
                            Most Popular
                          </span>
                        </div>
                      )}
                      {isCurrentPlan(plan.tier) && (
                        <div className="absolute -top-4 right-4">
                          <span className="bg-green-500 px-3 py-1 text-white text-sm font-semibold rounded-full">
                            Your Plan
                          </span>
                        </div>
                      )}
                      <CardHeader className={plan.popular ? 'pt-8' : ''}>
                        <CardTitle>{plan.name}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-6">
                          <span className="text-4xl font-bold">${plan.monthlyPrice}</span>
                          <span className="text-ezgray">/month</span>
                        </div>

                        <div className="space-y-3">
                          {plan.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center gap-2">
                              <CheckCircle className="text-ezblue h-5 w-5 shrink-0" />
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="flex flex-col">
                        <Button 
                          className={`w-full ${
                            plan.popular 
                              ? 'bg-ezblue text-eznavy hover:bg-ezblue-light' 
                              : ''
                          }`}
                          onClick={() => handleSubscribe(plan, 'monthly')}
                          disabled={isCurrentPlan(plan.tier)}
                        >
                          {isCurrentPlan(plan.tier) ? 'Current Plan' : plan.cta}
                        </Button>
                        <p className="text-xs text-ezgray mt-3">
                          {plan.disclaimer}
                        </p>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="yearly" className="w-full">
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  {plans.map((plan, index) => (
                    <Card 
                      key={index} 
                      className={`${
                        plan.popular ? 'border-ezblue ring-2 ring-ezblue' : 'border-ezgray-dark'
                      } relative ${isCurrentPlan(plan.tier) ? 'bg-eznavy-light/30' : ''}`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-4 left-0 right-0 flex justify-center">
                          <span className="bg-ezblue px-3 py-1 text-eznavy text-sm font-semibold rounded-full">
                            Most Popular
                          </span>
                        </div>
                      )}
                      {isCurrentPlan(plan.tier) && (
                        <div className="absolute -top-4 right-4">
                          <span className="bg-green-500 px-3 py-1 text-white text-sm font-semibold rounded-full">
                            Your Plan
                          </span>
                        </div>
                      )}
                      <CardHeader className={plan.popular ? 'pt-8' : ''}>
                        <CardTitle>{plan.name}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-6">
                          <span className="text-4xl font-bold">${plan.yearlyPrice}</span>
                          <span className="text-ezgray">/year</span>
                          {plan.yearlyPrice > 0 && (
                            <p className="text-xs text-green-500 mt-1">
                              Save ${plan.monthlyPrice * 12 - plan.yearlyPrice} annually
                            </p>
                          )}
                        </div>

                        <div className="space-y-3">
                          {plan.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center gap-2">
                              <CheckCircle className="text-ezblue h-5 w-5 shrink-0" />
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="flex flex-col">
                        <Button 
                          className={`w-full ${
                            plan.popular 
                              ? 'bg-ezblue text-eznavy hover:bg-ezblue-light' 
                              : ''
                          }`}
                          onClick={() => handleSubscribe(plan, 'yearly')}
                          disabled={isCurrentPlan(plan.tier)}
                        >
                          {isCurrentPlan(plan.tier) ? 'Current Plan' : plan.cta}
                        </Button>
                        <p className="text-xs text-ezgray mt-3">
                          {plan.tier === 'business_pro' ? 'Billed annually' : plan.disclaimer}
                        </p>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Enterprise */}
        <section className="py-16 px-4 bg-eznavy-light">
          <div className="container mx-auto">
            <div className="bg-eznavy border border-ezgray-dark rounded-lg p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 text-ezwhite">Need a custom solution?</h2>
                  <p className="text-ezgray mb-6">
                    Our enterprise plans are tailored to your organization's specific needs. Get in touch with our sales team to discuss custom integrations, advanced security features, and dedicated support.
                  </p>
                  <Button className="bg-ezblue text-eznavy hover:bg-ezblue-light">
                    Contact Sales
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-ezblue h-5 w-5 shrink-0" />
                    <span className="text-ezgray">Custom service level agreements (SLAs)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-ezblue h-5 w-5 shrink-0" />
                    <span className="text-ezgray">Dedicated account manager</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-ezblue h-5 w-5 shrink-0" />
                    <span className="text-ezgray">Priority feature development</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-ezblue h-5 w-5 shrink-0" />
                    <span className="text-ezgray">Custom training and onboarding</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-ezblue h-5 w-5 shrink-0" />
                    <span className="text-ezgray">Advanced security compliance options</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-ezgray max-w-2xl mx-auto">
                Have more questions? Contact our support team.
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
              {faqItems.map((item, index) => (
                <div key={index} className="border border-ezgray-dark rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-2">{item.question}</h3>
                  <p className="text-ezgray">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 px-4 bg-gradient-to-tr from-eznavy-dark via-eznavy to-eznavy-light">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-ezwhite">
              Ready to Get Started?
            </h2>
            <p className="text-ezgray max-w-2xl mx-auto mb-8">
              Try EzEdit risk-free with our free trial or subscribe to our Business Pro plan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-ezblue text-eznavy hover:bg-ezblue-light">
                  Start Free Trial
                </Button>
              </Link>
              <Link to="/docs">
                <Button size="lg" variant="outline" className="border-ezgray text-ezgray hover:bg-eznavy-light hover:text-ezwhite">
                  Read the Docs
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
