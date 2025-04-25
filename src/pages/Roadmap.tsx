
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CalendarDays, CheckCircle } from "lucide-react";

const Roadmap = () => {
  const roadmapItems = [
    {
      title: "Q2 2025",
      description: "Enhancing Core Features",
      items: [
        { feature: "Advanced AI editing capabilities", completed: false },
        { feature: "Multi-site management", completed: false },
        { feature: "Automated backups", completed: false }
      ]
    },
    {
      title: "Q3 2025",
      description: "Team Collaboration",
      items: [
        { feature: "Real-time collaboration", completed: false },
        { feature: "Team permissions system", completed: false },
        { feature: "Activity audit logs", completed: false }
      ]
    },
    {
      title: "Q4 2025",
      description: "Enterprise Features",
      items: [
        { feature: "Custom workflows", completed: false },
        { feature: "Advanced security features", completed: false },
        { feature: "API improvements", completed: false }
      ]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <section className="py-16 px-4 bg-eznavy">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-ezwhite">
              Product Roadmap
            </h1>
            <p className="text-xl text-ezgray max-w-3xl mx-auto">
              Discover what's coming next to EzEdit. Our roadmap is shaped by user feedback and industry trends.
            </p>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {roadmapItems.map((quarter, index) => (
                <Card key={index} className="border-ezgray-dark">
                  <CardHeader>
                    <div className="flex items-center gap-2 text-ezblue mb-2">
                      <CalendarDays className="h-5 w-5" />
                      <span className="font-semibold">{quarter.title}</span>
                    </div>
                    <CardTitle>{quarter.description}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {quarter.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center gap-2">
                          <CheckCircle className={`h-5 w-5 ${item.completed ? 'text-ezblue' : 'text-ezgray'}`} />
                          <span className={item.completed ? 'text-ezwhite' : 'text-ezgray'}>
                            {item.feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-eznavy-light">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Shape Our Future</h2>
            <p className="text-ezgray max-w-2xl mx-auto mb-8">
              Your feedback helps us prioritize features and improvements. Share your thoughts and suggestions.
            </p>
            <Link to="/support">
              <Button className="bg-ezblue text-eznavy hover:bg-ezblue-light">
                Submit Feedback
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Roadmap;
