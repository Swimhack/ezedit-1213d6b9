
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, FileText, Search, Book, ExternalLink, HelpCircle } from "lucide-react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Docs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("getting-started");

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

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

  const faqs = [
    {
      question: "How do I connect my FTP server?",
      answer: "You can connect your FTP server by navigating to the Dashboard > FTP Connections page and clicking 'Add Connection'. Enter your server details including hostname, username, password, and port. Click 'Test Connection' to verify, then save your connection."
    },
    {
      question: "Can I edit HTML/CSS/JS files with EzEdit?",
      answer: "Yes, EzEdit supports editing of all common web files including HTML, CSS, JavaScript, PHP, and more. Our AI assistant can help you make changes to any of these file types with natural language instructions."
    },
    {
      question: "How secure is my FTP connection?",
      answer: "EzEdit uses encrypted connections whenever possible (FTPS/SFTP) and stores your credentials securely. We never store passwords in plain text and use industry-standard encryption methods."
    },
    {
      question: "Can multiple team members use EzEdit?",
      answer: "Yes, our Professional and Enterprise plans support team collaboration features. You can add team members, assign different permission levels, and track edits made by each team member."
    },
    {
      question: "What happens if I make a mistake?",
      answer: "EzEdit keeps a version history of all your changes. You can easily roll back to previous versions if you make a mistake or need to restore earlier content."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow pt-16">
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

        {/* Documentation Navigation */}
        <section className="py-6 px-4 bg-eznavy-light border-b border-ezgray-dark">
          <div className="container mx-auto">
            <NavigationMenu className="justify-center w-full max-w-full">
              <NavigationMenuList className="flex flex-wrap justify-center gap-2">
                <NavigationMenuItem>
                  <Link to="#getting-started" onClick={() => setActiveSection("getting-started")}>
                    <Button variant={activeSection === "getting-started" ? "default" : "outline"}>
                      Getting Started
                    </Button>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="#api" onClick={() => setActiveSection("api")}>
                    <Button variant={activeSection === "api" ? "default" : "outline"}>
                      API Reference
                    </Button>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="#advanced" onClick={() => setActiveSection("advanced")}>
                    <Button variant={activeSection === "advanced" ? "default" : "outline"}>
                      Advanced Topics
                    </Button>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="#faq" onClick={() => setActiveSection("faq")}>
                    <Button variant={activeSection === "faq" ? "default" : "outline"}>
                      FAQ
                    </Button>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </section>

        {/* Main Documentation */}
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <Tabs defaultValue="getting-started" className="w-full" onValueChange={setActiveSection}>
              <div className="flex justify-center mb-8">
                <TabsList className="grid w-full max-w-md grid-cols-4">
                  <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
                  <TabsTrigger value="api">API</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  <TabsTrigger value="faq">FAQ</TabsTrigger>
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
                  <h2 className="text-2xl font-bold mb-6">Quick Start Guide</h2>
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

                <div className="mt-12">
                  <h2 className="text-2xl font-bold mb-6">Video Tutorials</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="bg-eznavy border-ezgray-dark">
                      <CardHeader>
                        <CardTitle>Getting Started with EzEdit</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="aspect-video bg-eznavy-light flex items-center justify-center rounded-md">
                          <PlayButton />
                        </div>
                        <p className="mt-4 text-ezgray">
                          Learn the basics of EzEdit in this comprehensive tutorial.
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-eznavy border-ezgray-dark">
                      <CardHeader>
                        <CardTitle>Advanced Editing Techniques</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="aspect-video bg-eznavy-light flex items-center justify-center rounded-md">
                          <PlayButton />
                        </div>
                        <p className="mt-4 text-ezgray">
                          Discover how to use AI-powered editing to transform your workflow.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
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
                  <h2 className="text-2xl font-bold mb-6">API Reference</h2>
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
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Plan</TableHead>
                              <TableHead>Rate Limit</TableHead>
                              <TableHead>Burst Limit</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell>Free</TableCell>
                              <TableCell>100 requests/hour</TableCell>
                              <TableCell>20 requests/minute</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Professional</TableCell>
                              <TableCell>1,000 requests/hour</TableCell>
                              <TableCell>100 requests/minute</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Enterprise</TableCell>
                              <TableCell>10,000 requests/hour</TableCell>
                              <TableCell>500 requests/minute</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>

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

                        <h3 className="mt-6">Endpoints</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Endpoint</TableHead>
                              <TableHead>Method</TableHead>
                              <TableHead>Description</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell>/v1/connections</TableCell>
                              <TableCell>GET</TableCell>
                              <TableCell>List all FTP connections</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>/v1/connections</TableCell>
                              <TableCell>POST</TableCell>
                              <TableCell>Create a new FTP connection</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>/v1/files</TableCell>
                              <TableCell>GET</TableCell>
                              <TableCell>List files in a directory</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>/v1/files/:path</TableCell>
                              <TableCell>GET</TableCell>
                              <TableCell>Get file content</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>/v1/files/:path</TableCell>
                              <TableCell>PUT</TableCell>
                              <TableCell>Update file content</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
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
      "files": ["$\{event.data.files}"]
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
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Role</TableHead>
                              <TableHead>Permissions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell>Admin</TableCell>
                              <TableCell>Full access to all features</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Editor</TableCell>
                              <TableCell>Can edit files but not manage connections</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Viewer</TableCell>
                              <TableCell>Read-only access to files</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                        
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

                        <h3 className="mt-6">Enterprise Security</h3>
                        <p className="text-ezgray">
                          Our Enterprise plan includes advanced security features such as:
                        </p>
                        <ul className="list-disc pl-5 text-ezgray">
                          <li>Single Sign-On (SSO) integration</li>
                          <li>IP address restrictions</li>
                          <li>Two-factor authentication</li>
                          <li>Audit logging</li>
                          <li>Data encryption at rest and in transit</li>
                          <li>Compliance certifications</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="faq" className="w-full">
                <Card>
                  <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                          <AccordionTrigger>{faq.question}</AccordionTrigger>
                          <AccordionContent>
                            <p className="text-ezgray">{faq.answer}</p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>

                <div className="mt-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Troubleshooting</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none">
                        <h3>Common Issues</h3>
                        
                        <h4 className="mt-4">Connection Failures</h4>
                        <p className="text-ezgray">
                          If you're experiencing connection failures, check that:
                        </p>
                        <ul className="list-disc pl-5 text-ezgray">
                          <li>Your FTP credentials are correct</li>
                          <li>Your server allows connections from external IP addresses</li>
                          <li>Firewall settings are not blocking connections</li>
                          <li>Your FTP server is running and accessible</li>
                        </ul>
                        
                        <h4 className="mt-4">File Upload Issues</h4>
                        <p className="text-ezgray">
                          If you're having trouble uploading files:
                        </p>
                        <ul className="list-disc pl-5 text-ezgray">
                          <li>Verify you have write permissions on the target directory</li>
                          <li>Check that your FTP user has sufficient permissions</li>
                          <li>Ensure the file doesn't exceed size limits</li>
                          <li>Try uploading in smaller batches for multiple files</li>
                        </ul>
                        
                        <h4 className="mt-4">Editor Problems</h4>
                        <p className="text-ezgray">
                          If the editor is not working as expected:
                        </p>
                        <ul className="list-disc pl-5 text-ezgray">
                          <li>Try clearing your browser cache</li>
                          <li>Ensure you're using a supported browser (Chrome, Firefox, Safari, Edge)</li>
                          <li>Check if your file format is supported</li>
                          <li>Try switching between editor modes</li>
                        </ul>
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
                    <Book className="h-12 w-12 text-ezblue" />
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
                    <HelpCircle className="h-12 w-12 text-ezblue" />
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

// Play button component for video tutorials
const PlayButton = () => (
  <div className="w-16 h-16 rounded-full bg-ezblue flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors">
    <div className="w-0 h-0 border-t-8 border-b-8 border-l-16 border-t-transparent border-b-transparent border-l-white ml-1"></div>
  </div>
);

export default Docs;
