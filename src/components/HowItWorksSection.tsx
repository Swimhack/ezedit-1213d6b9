
import { Button } from "@/components/ui/button";

const steps = [
  {
    number: "01",
    title: "Connect to Your Server",
    description: "Enter your FTP/SFTP credentials to securely connect to your website's server."
  },
  {
    number: "02",
    title: "Browse & Select Files",
    description: "Navigate through your server's directory structure and select files for editing."
  },
  {
    number: "03",
    title: "Edit with AI Assistance",
    description: "Use natural language to describe the changes you want to make to your code."
  },
  {
    number: "04",
    title: "Review & Save Changes",
    description: "Preview the changes before saving them back to your server with automatic backups."
  }
];

const HowItWorksSection = () => {
  return (
    <section className="py-16 px-4 bg-eznavy-light">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-ezgray max-w-2xl mx-auto">
            Updating your legacy websites has never been easier. Follow these simple steps to get started.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="p-6 bg-eznavy rounded-lg border border-ezgray-dark relative">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-ezblue text-4xl font-bold">{steps[0].number}</span>
              <div>
                <h3 className="text-xl font-semibold">{steps[0].title}</h3>
                <p className="text-ezgray">{steps[0].description}</p>
              </div>
            </div>
            <div className="bg-eznavy-dark p-4 rounded-md font-mono text-sm">
              <p className="text-ezgray">$ connect ftp://</p>
              <p className="text-ezblue">Username: <span className="text-ezwhite">admin</span></p>
              <p className="text-ezblue">Password: <span className="text-ezwhite">••••••••</span></p>
              <p className="text-green-400">Connection successful!</p>
            </div>
          </div>
          
          <div className="p-6 bg-eznavy rounded-lg border border-ezgray-dark relative">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-ezblue text-4xl font-bold">{steps[1].number}</span>
              <div>
                <h3 className="text-xl font-semibold">{steps[1].title}</h3>
                <p className="text-ezgray">{steps[1].description}</p>
              </div>
            </div>
            <div className="bg-eznavy-dark p-4 rounded-md font-mono text-sm h-[144px] flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-ezgray" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M5 2a1 1 0 00-1 1v14a1 1 0 001 1h10a1 1 0 001-1V3a1 1 0 00-1-1H5zm0 2h10v12H5V4z" clipRule="evenodd" />
                </svg>
                <span className="text-ezgray-light">public_html/</span>
              </div>
              <div className="flex items-center gap-2 mb-2 pl-4">
                <svg className="w-4 h-4 text-ezgray" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M5 2a1 1 0 00-1 1v14a1 1 0 001 1h10a1 1 0 001-1V3a1 1 0 00-1-1H5zm0 2h10v12H5V4z" clipRule="evenodd" />
                </svg>
                <span className="text-ezgray-light">css/</span>
              </div>
              <div className="flex items-center gap-2 mb-2 pl-4">
                <svg className="w-4 h-4 text-ezgray" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M5 2a1 1 0 00-1 1v14a1 1 0 001 1h10a1 1 0 001-1V3a1 1 0 00-1-1H5zm0 2h10v12H5V4z" clipRule="evenodd" />
                </svg>
                <span className="text-ezgray-light">js/</span>
              </div>
              <div className="flex items-center gap-2 pl-4">
                <svg className="w-4 h-4 text-ezblue" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                <span className="text-ezwhite">index.html</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-eznavy rounded-lg border border-ezgray-dark relative">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-ezblue text-4xl font-bold">{steps[2].number}</span>
              <div>
                <h3 className="text-xl font-semibold">{steps[2].title}</h3>
                <p className="text-ezgray">{steps[2].description}</p>
              </div>
            </div>
            <div className="bg-eznavy-dark p-4 rounded-md font-mono text-sm">
              <p className="text-ezwhite">&lt;div class=<span className="text-green-400">"header"</span>&gt;</p>
              <p className="text-ezwhite pl-4">&lt;h1&gt;Welcome&lt;/h1&gt;</p>
              <p className="text-ezwhite">&lt;/div&gt;</p>
              <div className="mt-2 p-2 bg-ezblue/10 rounded border border-ezblue/20">
                <p className="text-ezgray-light">"Update the h1 to say 'Welcome to Our Website'"</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-eznavy rounded-lg border border-ezgray-dark relative">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-ezblue text-4xl font-bold">{steps[3].number}</span>
              <div>
                <h3 className="text-xl font-semibold">{steps[3].title}</h3>
                <p className="text-ezgray">{steps[3].description}</p>
              </div>
            </div>
            <div className="bg-eznavy-dark p-4 rounded-md font-mono text-sm">
              <div className="flex mb-2">
                <div className="w-1/2 border-r border-ezgray-dark pr-2">
                  <p className="text-red-400">- &lt;h1&gt;Welcome&lt;/h1&gt;</p>
                </div>
                <div className="w-1/2 pl-2">
                  <p className="text-green-400">+ &lt;h1&gt;Welcome to Our Website&lt;/h1&gt;</p>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" size="sm" className="text-xs h-7">Cancel</Button>
                <Button size="sm" className="bg-ezblue text-eznavy hover:bg-ezblue-light text-xs h-7">Save Changes</Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <Button className="bg-ezblue text-eznavy hover:bg-ezblue-light">
            Try It Now
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
