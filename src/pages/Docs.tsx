
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, FileText, Search } from "lucide-react";

const Docs = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const gettingStartedGuides = [
    {
      title: "Creating your first connection",
      description: "Learn how to connect EzEdit to your FTP server",
      url: "/docs/getting-started/ftp-connection",
      icon: <FileText className="h-5 w-5 text-ezblue" />
    },
    {
      title: "Making your first edit",
      description: "How to use AI to make edits to your website",
      url: "/docs/getting-started/first-edit",
      icon: <FileText className="h-5 w-5 text-ezblue" />
    },
    {
      title: "Understanding version history",
      description: "How to view and restore previous versions",
      url: "/docs/getting-started/version-history",
      icon: <FileText className="h-5 w-5 text-ezblue" />
    },
    {
      title: "Security best practices",
      description: "Ensuring your connections remain secure",
      url: "/docs/getting-started/security",
      icon: <FileText className="h-5 w-5 text-ezblue" />
    }
  ];

  const apiDocs = [
    {
      title: "Authentication",
      description: "How to authenticate with the EzEdit API",
      url: "/docs/api/authentication",
      icon: <FileText className="h-5 w-5 text-ezblue" />
    },
    {
      title: "FTP Connections",
      description: "Manage FTP connections via the API",
      url: "/docs/api/ftp-connections",
      icon: <FileText className="h-5 w-5 text-ezblue" />
    },
    {
      title: "File Operations",
      description: "Upload, download, and manage files",
      url: "/docs/api/file-operations",
      icon: <FileText className="h-5 w-5 text-ezblue" />
    },
    {
      title: "AI Editing",
      description: "Integrate AI editing into your workflow",
      url: "/docs/api/ai-editing",
      icon: <FileText className="h-5 w-5 text-ezblue" />
    }
  ];

  const advancedGuides = [
    {
      title: "Custom Integrations",
      description: "Integrating EzEdit with your existing tools",
      url: "/docs/advanced/integrations",
      icon: <FileText className="h-5 w-5 text-ezblue" />
    },
    {
      title: "Team Collaboration",
      description: "How to work with your team effectively",
      url: "/docs/advanced/collaboration",
      icon: <FileText className="h-5 w-5 text-ezblue" />
    },
    {
      title: "Advanced Security",
      description: "Enterprise-grade security features",
      url: "/docs/advanced/security",
      icon: <FileText className="h-5 w-5 text-ezblue" />
    },
    {
      title: "Automation Workflows",
      description: "Creating automated publishing workflows",
      url: "/docs/advanced/automation",
      icon: <FileText className="h-5 w-5 text-ezblue" />
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-16 px-4 bg-eznavy">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-ezwhite">
              Documentation
            </h1>
            <p className="text-xl text-ezgray max-w-3xl mx-auto mb-10">
              Everything you need to know about using EzEdit for your legacy website management.
            </p>
            <div className="max-w-2xl mx-auto relative">
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-ezgray" />
                <Input
                  type="text"
                  placeholder="Search documentation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-eznavy-light border-ezgray-dark focus:border-ezblue"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Main Documentation */}
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <Tabs defaultValue="getting-started" className="w-full">
              <div className="flex justify-center mb-8">
                <TabsList className="grid w-full max-w-md grid-cols-3">
                  <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
                  <TabsTrigger value="api">API</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="getting-started" className="w-full">
                <div className="grid md:grid-cols-2 gap-6">
                  {gettingStartedGuides.map((guide, index) => (
                    <Link key={index} to={guide.url}>
                      <Card className="h-full hover:border-ezblue transition-colors cursor-pointer">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-3">
                            {guide.icon}
                            {guide.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-ezgray">{guide.description}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                <div className="mt-12">
                  <h2 className="text-2xl font-bold mb-6">Installation Guide</h2>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="prose max-w-none">
                        <h3>1. Create an Account</h3>
                        <p className="text-ezgray">
                          Start by signing up for EzEdit using your email and password. It takes less than a minute to get started.
                        </p>

                        <h3 className="mt-6">2. Set Up FTP Connection</h3>
                        <p className="text-ezgray">
                          Navigate to the FTP Connection page and enter your server details. EzEdit will securely store your credentials.
                        </p>
                        
                        <pre className="bg-eznavy p-4 rounded-md text-ezgray my-4 overflow-x-auto">
                          <code>
{`// Example FTP configuration
Host: ftp.yourwebsite.com
Username: your_username
Password: your_password
Port: 21`}
                          </code>
                        </pre>

                        <h3 className="mt-6">3. Browse Your Files</h3>
                        <p className="text-ezgray">
                          Once connected, you'll be able to browse your website's files and directories right from the EzEdit dashboard.
                        </p>

                        <h3 className="mt-6">4. Make Your First Edit</h3>
                        <p className="text-ezgray">
                          Select a file to edit, make your changes using our intuitive editor or AI-powered tools, and save the changes back to your server.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="api" className="w-full">
                <div className="grid md:grid-cols-2 gap-6">
                  {apiDocs.map((doc, index) => (
                    <Link key={index} to={doc.url}>
                      <Card className="h-full hover:border-ezblue transition-colors cursor-pointer">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-3">
                            {doc.icon}
                            {doc.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-ezgray">{doc.description}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                <div className="mt-12">
                  <h2 className="text-2xl font-bold mb-6">API Overview</h2>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="prose max-w-none">
                        <h3>Authentication</h3>
                        <p className="text-ezgray">
                          All API requests require authentication using an API key. You can generate an API key from your account settings.
                        </p>

                        <pre className="bg-eznavy p-4 rounded-md text-ezgray my-4 overflow-x-auto">
                          <code>
{`// Example API request
curl -X GET "https://api.ezedit.co/v1/files" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                          </code>
                        </pre>

                        <h3 className="mt-6">Rate Limits</h3>
                        <p className="text-ezgray">
                          API requests are subject to rate limiting based on your subscription plan:
                        </p>
                        <ul className="list-disc pl-5 text-ezgray">
                          <li>Free: 100 requests/hour</li>
                          <li>Professional: 1,000 requests/hour</li>
                          <li>Enterprise: 10,000 requests/hour</li>
                        </ul>

                        <h3 className="mt-6">Pagination</h3>
                        <p className="text-ezgray">
                          All list endpoints support pagination using the <code>limit</code> and <code>offset</code> parameters.
                        </p>
                        
                        <pre className="bg-eznavy p-4 rounded-md text-ezgray my-4 overflow-x-auto">
                          <code>
{`// Example paginated request
GET /v1/files?limit=25&offset=50`}
                          </code>
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="w-full">
                <div className="grid md:grid-cols-2 gap-6">
                  {advancedGuides.map((guide, index) => (
                    <Link key={index} to={guide.url}>
                      <Card className="h-full hover:border-ezblue transition-colors cursor-pointer">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-3">
                            {guide.icon}
                            {guide.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-ezgray">{guide.description}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                <div className="mt-12">
                  <h2 className="text-2xl font-bold mb-6">Advanced Configuration</h2>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="prose max-w-none">
                        <h3>Custom Workflows</h3>
                        <p className="text-ezgray">
                          EzEdit supports custom workflows for automating repetitive tasks. You can define workflows using our workflow editor.
                        </p>

                        <pre className="bg-eznavy p-4 rounded-md text-ezgray my-4 overflow-x-auto">
                          <code>
{`// Example workflow configuration
{
  "name": "Deploy to Production",
  "triggers": ["file.updated", "tag.created"],
  "actions": [
    {
      "type": "ftp.upload",
      "target": "production",
      "files": ["${event.files}"]
    },
    {
      "type": "notification.send",
      "channel": "slack",
      "message": "Files deployed to production"
    }
  ]
}`}
                          </code>
                        </pre>

                        <h3 className="mt-6">Team Permissions</h3>
                        <p className="text-ezgray">
                          Enterprise and Professional plans support fine-grained permissions for team members:
                        </p>
                        <ul className="list-disc pl-5 text-ezgray">
                          <li>Admin: Full access to all features</li>
                          <li>Editor: Can edit files but not manage connections</li>
                          <li>Viewer: Read-only access to files</li>
                        </ul>
                        
                        <h3 className="mt-6">Custom Integrations</h3>
                        <p className="text-ezgray">
                          EzEdit can integrate with your existing tools through webhooks and our API.
                        </p>
                        
                        <pre className="bg-eznavy p-4 rounded-md text-ezgray my-4 overflow-x-auto">
                          <code>
{`// Example webhook configuration
{
  "url": "https://your-service.com/webhooks/ezedit",
  "events": ["file.created", "file.updated", "file.deleted"],
  "secret": "your-webhook-secret"
}`}
                          </code>
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Help Section */}
        <section className="py-16 px-4 bg-eznavy-light">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Need More Help?</h2>
            <p className="text-ezgray max-w-2xl mx-auto mb-8">
              Our support team is ready to assist you with any questions you may have about using EzEdit.
            </p>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <Card className="bg-eznavy border-ezgray-dark text-center">
                <CardHeader>
                  <div className="flex justify-center">
                    <BookOpen className="h-12 w-12 text-ezblue" />
                  </div>
                  <CardTitle className="mt-4">Tutorial Videos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-ezgray mb-4">
                    Watch step-by-step tutorials to learn how to use EzEdit effectively
                  </p>
                  <Button variant="outline">Watch Tutorials</Button>
                </CardContent>
              </Card>

              <Card className="bg-eznavy border-ezgray-dark text-center">
                <CardHeader>
                  <div className="flex justify-center">
                    <BookOpen className="h-12 w-12 text-ezblue" />
                  </div>
                  <CardTitle className="mt-4">Community Forum</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-ezgray mb-4">
                    Connect with other users and share tips in our community forum
                  </p>
                  <Button variant="outline">Visit Forum</Button>
                </CardContent>
              </Card>

              <Card className="bg-eznavy border-ezgray-dark text-center">
                <CardHeader>
                  <div className="flex justify-center">
                    <BookOpen className="h-12 w-12 text-ezblue" />
                  </div>
                  <CardTitle className="mt-4">Contact Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-ezgray mb-4">
                    Get in touch with our dedicated support team for personalized help
                  </p>
                  <Button variant="outline">Contact Support</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Docs;
