
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquarePlus, Clock, Award } from "lucide-react";

const Support = () => {
  const supportChannels = [
    {
      title: "Community Support",
      description: "Get help from our community of users",
      icon: <MessageSquarePlus className="h-8 w-8 text-ezblue" />,
      response: "Usually within 24 hours"
    },
    {
      title: "Priority Support",
      description: "Professional plan users get priority assistance",
      icon: <Clock className="h-8 w-8 text-ezblue" />,
      response: "Within 4 hours"
    },
    {
      title: "Enterprise Support",
      description: "Dedicated support team for enterprise clients",
      icon: <Award className="h-8 w-8 text-ezblue" />,
      response: "24/7 availability"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <section className="py-16 px-4 bg-eznavy">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-ezwhite">
              Support Center
            </h1>
            <p className="text-xl text-ezgray max-w-3xl mx-auto">
              Need help? We're here to assist you with any questions or issues you might have.
            </p>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {supportChannels.map((channel, index) => (
                <Card key={index} className="border-ezgray-dark">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      {channel.icon}
                    </div>
                    <CardTitle className="text-center">{channel.title}</CardTitle>
                    <CardDescription className="text-center">{channel.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-ezgray">
                      Response time: {channel.response}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="max-w-2xl mx-auto">
              <Card className="border-ezgray-dark">
                <CardHeader>
                  <CardTitle>Contact Support</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">
                        Name
                      </label>
                      <Input id="name" placeholder="Your name" />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        Email
                      </label>
                      <Input id="email" type="email" placeholder="Your email" />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium mb-2">
                        Subject
                      </label>
                      <Input id="subject" placeholder="What's this about?" />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-2">
                        Message
                      </label>
                      <Textarea
                        id="message"
                        placeholder="Describe your issue or question"
                        className="min-h-[150px]"
                      />
                    </div>
                    <Button className="w-full bg-ezblue text-eznavy hover:bg-ezblue-light">
                      Send Message
                    </Button>
                  </form>
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

export default Support;
