
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, FileText } from "lucide-react";

const Privacy = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <section className="py-16 px-4 bg-eznavy">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-ezwhite">
              Privacy Policy
            </h1>
            <p className="text-xl text-ezgray max-w-3xl mx-auto">
              We take your privacy seriously. Learn how we collect, use, and protect your data.
            </p>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="prose prose-invert max-w-none">
              <h2>Introduction</h2>
              <p>
                This Privacy Policy explains how EzEdit ("we," "our," or "us") collects, uses, and 
                protects your personal information when you use our website management platform.
              </p>

              <h2>Information We Collect</h2>
              <p>We collect the following types of information:</p>
              <ul>
                <li>Account information (name, email, password)</li>
                <li>Website data and FTP credentials</li>
                <li>Usage data and analytics</li>
                <li>Communication preferences</li>
              </ul>

              <h2>How We Use Your Information</h2>
              <p>We use your information to:</p>
              <ul>
                <li>Provide and maintain our services</li>
                <li>Improve and personalize user experience</li>
                <li>Process transactions</li>
                <li>Send administrative information</li>
                <li>Provide customer support</li>
              </ul>

              <h2>Data Security</h2>
              <p>
                We implement industry-standard security measures to protect your personal information 
                from unauthorized access, disclosure, alteration, or destruction.
              </p>

              <h2>Information Sharing</h2>
              <p>
                We do not sell, trade, or rent your personal information to third parties. We may 
                share your information with trusted service providers who assist us in operating our 
                platform.
              </p>

              <h2>Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to data processing</li>
                <li>Data portability</li>
              </ul>

              <h2>Contact Us</h2>
              <p>
                If you have any questions about our Privacy Policy, please contact us at 
                privacy@ezedit.co
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
