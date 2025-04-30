
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlanCard, PlanProps } from "./PlanCard";

interface PricingPlansProps {
  plans: Omit<PlanProps, 'billingPeriod' | 'onSubscribe'>[];
  subscriptionTier: 'free_trial' | 'business_pro' | null;
  handleSubscribe: (plan: any, billingPeriod: 'monthly' | 'yearly') => Promise<void>;
}

export const PricingPlans = ({ 
  plans,
  subscriptionTier,
  handleSubscribe 
}: PricingPlansProps) => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const isCurrentPlan = (planTier: 'free_trial' | 'business_pro') => {
    return subscriptionTier === planTier;
  };

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <Tabs 
          defaultValue="monthly" 
          className="w-full"
          onValueChange={(value) => setBillingPeriod(value as 'monthly' | 'yearly')}
        >
          <div className="flex justify-center mb-8">
            <TabsList>
              <TabsTrigger value="monthly">Monthly Billing</TabsTrigger>
              <TabsTrigger value="yearly">Yearly Billing (Save 20%)</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="monthly" className="w-full">
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {plans.map((plan, index) => (
                <PlanCard
                  key={index}
                  {...plan}
                  billingPeriod="monthly"
                  isCurrentPlan={isCurrentPlan(plan.tier)}
                  onSubscribe={() => handleSubscribe(plan, 'monthly')}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="yearly" className="w-full">
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {plans.map((plan, index) => (
                <PlanCard
                  key={index}
                  {...plan}
                  billingPeriod="yearly"
                  isCurrentPlan={isCurrentPlan(plan.tier)}
                  onSubscribe={() => handleSubscribe(plan, 'yearly')}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};
