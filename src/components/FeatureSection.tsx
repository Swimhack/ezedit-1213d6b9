
import { cn } from "@/lib/utils";

const features = [
  {
    title: "FTP/SFTP Connectivity",
    description: "Seamlessly connect to your legacy websites securely via FTP or SFTP protocols.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: "AI-Powered Editing",
    description: "Describe changes in plain English and let our AI transform your code without errors.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    title: "Version Control",
    description: "Every change is backed up automatically, allowing you to revert to previous versions.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  {
    title: "Bank-Level Security",
    description: "End-to-end encryption with zero credential storage. Your data stays yours.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
];

const FeatureCard = ({ feature, className }: { feature: typeof features[0]; className?: string }) => {
  return (
    <div className={cn("bg-eznavy-light p-6 rounded-lg border border-ezgray-dark", className)}>
      <div className="text-ezblue mb-4">{feature.icon}</div>
      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
      <p className="text-ezgray">{feature.description}</p>
    </div>
  );
};

const FeatureSection = () => {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose EzEdit.co</h2>
          <p className="text-ezgray max-w-2xl mx-auto">
            Our platform simplifies maintaining legacy websites by combining modern AI with traditional FTP access.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} className="animate-fade-in" />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
