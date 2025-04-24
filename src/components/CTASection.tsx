
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-16 px-4 bg-gradient-to-tr from-eznavy-dark via-eznavy to-eznavy-light">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Simplify Your Web Maintenance?
        </h2>
        <p className="text-ezgray max-w-2xl mx-auto mb-8">
          Join thousands of developers and content managers who have transformed how they update legacy websites.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register">
            <Button size="lg" className="bg-ezblue text-eznavy hover:bg-ezblue-light">
              Get Started for Free
            </Button>
          </Link>
          <Link to="/pricing">
            <Button size="lg" variant="outline" className="border-ezgray text-ezgray hover:bg-eznavy-light hover:text-ezwhite">
              View Pricing Plans
            </Button>
          </Link>
        </div>
        <p className="mt-6 text-ezgray text-sm">
          No credit card required. Free plan includes 50 edits per month.
        </p>
      </div>
    </section>
  );
};

export default CTASection;
