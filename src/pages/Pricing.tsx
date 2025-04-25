
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "Free",
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
      disclaimer: "No credit card required"
    },
    {
      name: "Professional",
      description: "Enhanced tools for growing websites",
      monthlyPrice: 15,
      yearlyPrice: 144,
      features: [
        "250 AI-powered edits per month",
        "5 FTP connections",
        "Extended version history (90 days)",
        "Priority support",
        "10 GB storage",
        "Custom domain support",
        "Team collaboration (2 seats)",
        "Security scanning"
      ],
      popular: true,
      cta: "Start Free Trial",
      disclaimer: "14-day free trial"
    },
    {
      name: "Enterprise",
      description: "Advanced tools for large organizations",
      monthlyPrice: 39,
      yearlyPrice: 396,
      features: [
        "Unlimited AI-powered edits",
        "Unlimited FTP connections",
        "Complete version history",
        "24/7 priority support",
        "100 GB storage",
        "Custom domain support",
        "Team collaboration (unlimited seats)",
        "Security scanning & monitoring",
        "Advanced analytics",
        "Custom integrations",
        "Dedicated account manager"
      ],
      popular: false,
      cta: "Contact Sales",
      disclaimer: "Custom solutions available"
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

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
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
                <div className="grid md:grid-cols-3 gap-8">
                  {plans.map((plan, index) => (
                    <Card 
                      key={index} 
                      className={`${
                        plan.popular ? 'border-ezblue ring-2 ring-ezblue' : 'border-ezgray-dark'
                      } relative`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-4 left-0 right-0 flex justify-center">
                          <span className="bg-ezblue px-3 py-1 text-eznavy text-sm font-semibold rounded-full">
                            Most Popular
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
                        >
                          {plan.cta}
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
                <div className="grid md:grid-cols-3 gap-8">
                  {plans.map((plan, index) => (
                    <Card 
                      key={index} 
                      className={`${
                        plan.popular ? 'border-ezblue ring-2 ring-ezblue' : 'border-ezgray-dark'
                      } relative`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-4 left-0 right-0 flex justify-center">
                          <span className="bg-ezblue px-3 py-1 text-eznavy text-sm font-semibold rounded-full">
                            Most Popular
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
                        >
                          {plan.cta}
                        </Button>
                        <p className="text-xs text-ezgray mt-3">
                          {plan.disclaimer}
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
              Try EzEdit risk-free with our free plan or 14-day trial on any paid plan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-ezblue text-eznavy hover:bg-ezblue-light">
                  Start Free
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
