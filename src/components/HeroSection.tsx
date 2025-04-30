
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import EmailSubmissionForm from "./EmailSubmissionForm";

const HeroSection = () => {
  return (
    <section className="pt-32 pb-20 px-4">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          Edit Legacy Websites with <span className="text-gradient">AI-Powered</span> Simplicity
        </h1>
        <p className="text-xl md:text-2xl text-ezgray max-w-3xl mx-auto mb-10">
          Connect to any website via FTP/SFTP and update your code using natural language prompts.
          Secure, fast, and incredibly simple.
        </p>
        
        <div className="max-w-lg mx-auto mb-12">
          <h3 className="text-lg font-medium mb-3">Get early access to EzEdit</h3>
          <EmailSubmissionForm />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link to="/register">
            <Button size="lg" className="bg-ezblue text-eznavy hover:bg-ezblue-light">
              Get Started for Free
            </Button>
          </Link>
          <Link to="/demo">
            <Button size="lg" variant="outline" className="border-ezgray text-ezgray hover:bg-eznavy-light hover:text-ezwhite">
              Watch Demo
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
