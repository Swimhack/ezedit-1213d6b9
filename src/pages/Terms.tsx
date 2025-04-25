
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollText } from "lucide-react";

const Terms = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <section className="py-16 px-4 bg-eznavy">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-ezwhite">
              Terms of Service
            </h1>
            <p className="text-xl text-ezgray max-w-3xl mx-auto">
              Please read these terms carefully before using our services.
            </p>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="prose prose-invert max-w-none">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing or using EzEdit's services, you agree to be bound by these Terms of 
                Service and all applicable laws and regulations.
              </p>

              <h2>2. Description of Service</h2>
              <p>
                EzEdit provides a web-based platform for managing and updating legacy websites 
                through our AI-powered tools and FTP integration capabilities.
              </p>

              <h2>3. User Accounts</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials 
                and for all activities that occur under your account.
              </p>

              <h2>4. Acceptable Use</h2>
              <p>You agree not to:</p>
              <ul>
                <li>Use the service for any illegal purpose</li>
                <li>Upload malicious code or content</li>
                <li>Attempt to gain unauthorized access</li>
                <li>Interfere with the service's operation</li>
              </ul>

              <h2>5. Payment Terms</h2>
              <p>
                Subscription fees are billed in advance on a monthly or annual basis. All fees are 
                non-refundable unless otherwise specified.
              </p>

              <h2>6. Intellectual Property</h2>
              <p>
                All content and materials available through the service are protected by 
                intellectual property rights and belong to EzEdit or its licensors.
              </p>

              <h2>7. Limitation of Liability</h2>
              <p>
                EzEdit shall not be liable for any indirect, incidental, special, consequential, 
                or punitive damages resulting from your use of the service.
              </p>

              <h2>8. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. Users will be notified of 
                any changes through the service.
              </p>

              <h2>9. Termination</h2>
              <p>
                We may terminate or suspend your account at any time for violations of these terms 
                or for any other reason.
              </p>

              <h2>10. Contact Information</h2>
              <p>
                For questions about these Terms of Service, please contact us at legal@ezedit.co
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
