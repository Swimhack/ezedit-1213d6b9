
import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PlanFeature {
  text: string;
}

export interface PlanProps {
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  popular: boolean;
  cta: string;
  priceId: { monthly: string; yearly: string } | null;
  tier: 'free_trial' | 'business_pro';
  disclaimer: string;
  isCurrentPlan?: boolean; // Changed to optional
  billingPeriod: 'monthly' | 'yearly';
  onSubscribe: () => void;
}

export const PlanCard = ({
  name,
  description,
  monthlyPrice,
  yearlyPrice,
  features,
  popular,
  cta,
  isCurrentPlan,
  billingPeriod,
  onSubscribe,
  disclaimer,
}: PlanProps) => {
  const price = billingPeriod === 'monthly' ? monthlyPrice : yearlyPrice;
  
  return (
    <Card 
      className={`${
        popular ? 'border-ezblue ring-2 ring-ezblue' : 'border-ezgray-dark'
      } relative ${isCurrentPlan ? 'bg-eznavy-light/30' : ''}`}
    >
      {popular && (
        <div className="absolute -top-4 left-0 right-0 flex justify-center">
          <span className="bg-ezblue px-3 py-1 text-eznavy text-sm font-semibold rounded-full">
            Most Popular
          </span>
        </div>
      )}
      {isCurrentPlan && (
        <div className="absolute -top-4 right-4">
          <span className="bg-green-500 px-3 py-1 text-white text-sm font-semibold rounded-full">
            Your Plan
          </span>
        </div>
      )}
      <CardHeader className={popular ? 'pt-8' : ''}>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <span className="text-4xl font-bold">${price}</span>
          <span className="text-ezgray">/{billingPeriod === 'monthly' ? 'month' : 'year'}</span>
          {billingPeriod === 'yearly' && price > 0 && (
            <p className="text-xs text-green-500 mt-1">
              Save ${monthlyPrice * 12 - yearlyPrice} annually
            </p>
          )}
        </div>

        <div className="space-y-3">
          {features.map((feature, featureIndex) => (
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
            popular 
              ? 'bg-ezblue text-eznavy hover:bg-ezblue-light' 
              : ''
          }`}
          onClick={onSubscribe}
          disabled={isCurrentPlan}
        >
          {isCurrentPlan ? 'Current Plan' : cta}
        </Button>
        <p className="text-xs text-ezgray mt-3">
          {disclaimer}
        </p>
      </CardFooter>
    </Card>
  );
};
