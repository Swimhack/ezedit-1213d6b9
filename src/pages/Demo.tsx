
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, PlayCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Demo = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-16">
        <Link to="/" className="inline-flex items-center text-ezgray hover:text-ezblue mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">See EzEdit in Action</h1>
          <p className="text-ezgray mb-8">
            Watch how easy it is to edit your legacy websites using our AI-powered platform.
          </p>
          
          <div className="aspect-video bg-eznavy-dark rounded-lg overflow-hidden mb-8 flex items-center justify-center">
            <div className="text-center">
              <PlayCircle className="h-16 w-16 text-ezblue mx-auto mb-4" />
              <p className="text-ezgray">Demo video coming soon</p>
            </div>
          </div>
          
          <div className="text-center">
            <Link to="/register">
              <Button size="lg" className="bg-ezblue text-eznavy hover:bg-ezblue-light">
                Try It Yourself
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Demo;
