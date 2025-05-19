
import { useState, useEffect } from "react";
import { toast } from "sonner";

// For this example, we'll use a simple mock subscription system
// In a real app, this would connect to your backend
export function useSubscription(userEmail?: string) {
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const [subscriptionTier, setSubscriptionTier] = useState<'free_trial' | 'business_pro' | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        setIsLoading(true);
        
        // Simulate API call to check subscription status
        // In a real application, this would be an actual API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // For demo purposes, using localStorage to simulate subscription state
        const storedIsPremium = localStorage.getItem('ezEdit_isPremium');
        const storedSubscriptionTier = localStorage.getItem('ezEdit_subscriptionTier');
        
        // Default to false if not set
        const premium = storedIsPremium === 'true';
        setIsPremium(premium);
        setSubscribed(premium);
        setSubscriptionTier(premium ? 'business_pro' : 'free_trial');
        
        // Set a dummy subscription end date 30 days in the future
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
        setSubscriptionEnd(endDate.toISOString());
        
        setError(null);
      } catch (err: any) {
        console.error("Error checking subscription:", err);
        setError(err.message || "Failed to check subscription status");
        toast.error("Could not verify subscription status");
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, [userEmail]);

  const upgradeToPremium = () => {
    // This would typically redirect to a payment page or open a modal
    // For demo purposes, we'll just set the premium flag directly
    localStorage.setItem('ezEdit_isPremium', 'true');
    localStorage.setItem('ezEdit_subscriptionTier', 'business_pro');
    setIsPremium(true);
    setSubscribed(true);
    setSubscriptionTier('business_pro');
    toast.success("Upgraded to premium successfully!");
  };

  const downgradeToFree = () => {
    localStorage.setItem('ezEdit_isPremium', 'false');
    localStorage.setItem('ezEdit_subscriptionTier', 'free_trial');
    setIsPremium(false);
    setSubscribed(false);
    setSubscriptionTier('free_trial');
    toast.info("Downgraded to free plan");
  };

  const handleCheckout = async (priceId: string) => {
    // This would typically redirect to a Stripe checkout page
    // For demo purposes, we'll just upgrade to premium directly
    toast.info("Processing checkout...");
    await new Promise(resolve => setTimeout(resolve, 1000));
    upgradeToPremium();
    return true;
  };
  
  const handleCustomerPortal = async () => {
    // This would typically redirect to a customer portal
    if (subscribed) {
      toast.info("Opening customer portal...");
      // In real app: redirect to Stripe Customer Portal
    } else {
      // Redirect to pricing page or open checkout
      handleCheckout("demo-price-id");
    }
  };

  return {
    isPremium,
    isLoading,
    error,
    upgradeToPremium,
    downgradeToFree,
    subscribed,
    subscriptionTier,
    subscriptionEnd,
    handleCheckout,
    handleCustomerPortal
  };
}
