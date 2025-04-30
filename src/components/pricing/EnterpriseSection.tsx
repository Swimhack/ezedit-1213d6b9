
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const EnterpriseSection = () => {
  return (
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
  );
};
