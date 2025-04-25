
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { CheckCircle, Building, Users, Globe } from "lucide-react";

const About = () => {
  const stats = [
    {
      number: "50,000+",
      label: "Websites Updated",
      icon: <Globe className="h-8 w-8 text-ezblue" />
    },
    {
      number: "10,000+",
      label: "Happy Users",
      icon: <Users className="h-8 w-8 text-ezblue" />
    },
    {
      number: "500+",
      label: "Enterprise Clients",
      icon: <Building className="h-8 w-8 text-ezblue" />
    }
  ];

  const values = [
    {
      title: "Innovation",
      description: "Pushing the boundaries of what's possible in website management"
    },
    {
      title: "Security",
      description: "Protecting our clients' data and websites is our top priority"
    },
    {
      title: "Simplicity",
      description: "Making complex tasks simple and accessible for everyone"
    },
    {
      title: "Reliability",
      description: "Providing stable and dependable services you can count on"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <section className="py-16 px-4 bg-eznavy">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-ezwhite">
              About EzEdit
            </h1>
            <p className="text-xl text-ezgray max-w-3xl mx-auto">
              We're revolutionizing how legacy websites are managed and updated.
            </p>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                <p className="text-ezgray mb-4">
                  Founded in 2024, EzEdit was born from a simple observation: updating legacy websites 
                  was unnecessarily complicated and risky. We set out to change that.
                </p>
                <p className="text-ezgray mb-4">
                  Our team of experienced developers and AI specialists created a platform that combines 
                  cutting-edge artificial intelligence with robust website management tools, making it 
                  easy for anyone to update their legacy websites safely and efficiently.
                </p>
                <p className="text-ezgray">
                  Today, we're proud to serve thousands of clients worldwide, from small businesses 
                  to large enterprises, helping them maintain and update their websites with confidence.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <Card key={index} className="border-ezgray-dark p-6">
                    <CardContent className="text-center p-0">
                      <div className="flex justify-center mb-4">
                        {stat.icon}
                      </div>
                      <div className="text-2xl font-bold mb-2">{stat.number}</div>
                      <div className="text-sm text-ezgray">{stat.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-eznavy-light">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Values</h2>
            <div className="grid md:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="border-ezgray-dark">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                    <p className="text-ezgray">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Join Our Team</h2>
            <p className="text-ezgray max-w-2xl mx-auto mb-8">
              We're always looking for talented individuals who share our passion for 
              making website management easier and more accessible.
            </p>
            <Button className="bg-ezblue text-eznavy hover:bg-ezblue-light">
              View Open Positions
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
