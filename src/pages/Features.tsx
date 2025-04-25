
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { CheckCircle2, Code2, FileText, Globe, Lock, MessageSquarePlus, Zap } from "lucide-react";

const Features = () => {
  const featureGroups = [
    {
      title: "Smart Editing",
      description: "Powerful tools that make editing your website a breeze",
      features: [
        {
          title: "AI-Powered Edits",
          description: "Describe changes in plain English and let our AI implement them without breaking your site.",
          icon: <MessageSquarePlus className="h-8 w-8 text-ezblue" />
        },
        {
          title: "Code Analysis",
          description: "Our system understands your code structure and makes appropriate changes while preserving functionality.",
          icon: <Code2 className="h-8 w-8 text-ezblue" />
        },
        {
          title: "Real-time Preview",
          description: "See your changes in real-time before you commit them to your production website.",
          icon: <Globe className="h-8 w-8 text-ezblue" />
        }
      ]
    },
    {
      title: "Seamless Connectivity",
      description: "Connect to all your existing sites with zero friction",
      features: [
        {
          title: "FTP/SFTP Integration",
          description: "Connect directly to your legacy hosting with secure FTP protocol support.",
          icon: <FileText className="h-8 w-8 text-ezblue" />
        },
        {
          title: "Zero Knowledge Security",
          description: "Your credentials are encrypted and never stored on our servers in plaintext.",
          icon: <Lock className="h-8 w-8 text-ezblue" />
        },
        {
          title: "Batch Operations",
          description: "Upload, download, or modify multiple files with a single click.",
          icon: <Zap className="h-8 w-8 text-ezblue" />
        }
      ]
    }
  ];

  const allFeatures = [
    "Automated Site Backups",
    "Revision History",
    "Collaborative Editing",
    "Secure Credential Storage",
    "Detailed File Comparison",
    "Syntax Highlighting",
    "Smart Error Prevention",
    "Template Support",
    "SEO Recommendations",
    "Performance Optimization",
    "Markdown Support",
    "Mobile-Friendly Interface"
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-16 px-4 bg-eznavy">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-ezwhite">
              Powerful Features for Legacy Website Management
            </h1>
            <p className="text-xl text-ezgray max-w-3xl mx-auto mb-10">
              EzEdit provides all the tools you need to maintain and update your legacy websites with modern AI technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-ezblue text-eznavy hover:bg-ezblue-light">
                  Start Free Trial
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="lg" variant="outline" className="border-ezgray text-ezwhite hover:bg-eznavy-light">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Main Feature Groups */}
        <section className="py-16 px-4 bg-eznavy-light">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Comprehensive Tools for Web Management</h2>
              <p className="text-ezgray max-w-2xl mx-auto">
                Our platform is designed to make managing legacy websites simple and efficient with powerful features.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-12">
              {featureGroups.map((group, index) => (
                <Card key={index} className="bg-eznavy border-ezgray-dark">
                  <CardHeader>
                    <CardTitle className="text-ezwhite">{group.title}</CardTitle>
                    <CardDescription>{group.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {group.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex gap-4">
                        <div className="shrink-0 mt-1">
                          {feature.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg text-ezwhite">{feature.title}</h4>
                          <p className="text-ezgray">{feature.description}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Feature List */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Everything You Need in One Place</h2>
              <p className="text-ezgray max-w-2xl mx-auto">
                A comprehensive suite of tools for modern website management with legacy infrastructure
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-eznavy-light rounded-lg">
                  <CheckCircle2 className="text-ezblue h-5 w-5 shrink-0" />
                  <span className="font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="py-16 px-4 bg-gradient-to-tr from-eznavy-dark via-eznavy to-eznavy-light">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-ezwhite">
              Ready to Modernize Your Website Management?
            </h2>
            <p className="text-ezgray max-w-2xl mx-auto mb-8">
              Join thousands of developers and content managers who have transformed how they update legacy websites.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-ezblue text-eznavy hover:bg-ezblue-light">
                  Start Free Trial
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="lg" variant="outline" className="border-ezgray text-ezgray hover:bg-eznavy-light hover:text-ezwhite">
                  View Pricing Plans
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

export default Features;
