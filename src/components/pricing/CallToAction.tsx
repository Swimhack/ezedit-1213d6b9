
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const CallToAction = () => {
  return (
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
  );
};
