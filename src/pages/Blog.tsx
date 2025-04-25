
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Clock, User } from "lucide-react";
import { Link } from "react-router-dom";

const Blog = () => {
  const blogPosts = [
    {
      title: "Introducing AI-Powered Website Editing",
      description: "Learn how our AI technology makes website updates easier than ever before.",
      author: "Sarah Johnson",
      date: "April 20, 2025",
      readTime: "5 min read",
      category: "Product Updates"
    },
    {
      title: "Best Practices for Legacy Website Management",
      description: "Tips and tricks for maintaining and updating legacy websites effectively.",
      author: "Michael Chen",
      date: "April 18, 2025",
      readTime: "8 min read",
      category: "Tutorials"
    },
    {
      title: "Security First: Protecting Your Website Updates",
      description: "Understanding the security measures in EzEdit and how they protect your website.",
      author: "Emma Wilson",
      date: "April 15, 2025",
      readTime: "6 min read",
      category: "Security"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <section className="py-16 px-4 bg-eznavy">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-ezwhite">
              EzEdit Blog
            </h1>
            <p className="text-xl text-ezgray max-w-3xl mx-auto">
              Stay updated with the latest news, tutorials, and insights about website management.
            </p>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {blogPosts.map((post, index) => (
                <Card key={index} className="border-ezgray-dark hover:border-ezblue transition-colors">
                  <CardHeader>
                    <div className="text-xs text-ezgray mb-2">{post.category}</div>
                    <CardTitle className="text-xl mb-2">{post.title}</CardTitle>
                    <CardDescription>{post.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-ezgray mb-4">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                    <Button className="w-full" variant="outline">
                      Read More
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-eznavy-light">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
            <p className="text-ezgray max-w-2xl mx-auto mb-8">
              Get the latest updates and articles delivered directly to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Input 
                type="email" 
                placeholder="Enter your email"
                className="flex-grow"
              />
              <Button className="bg-ezblue text-eznavy hover:bg-ezblue-light">
                Subscribe
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
