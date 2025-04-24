import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader } from "lucide-react";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const navigate = useNavigate();

  const sendWelcomeEmail = async (email: string, name: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: email,
          subject: "Welcome to EzEdit!",
          text: `Hi ${name}, welcome to EzEdit! We're excited to have you on board.`,
          html: `
            <h1>Welcome to EzEdit!</h1>
            <p>Hi ${name},</p>
            <p>Thank you for registering with EzEdit. We're excited to have you on board!</p>
            <p>Start editing your websites with AI today.</p>
            <p>Best regards,<br>The EzEdit Team</p>
          `
        }
      });

      if (error) throw error;
      console.log('Welcome email sent:', data);
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // We don't show this error to the user since registration was successful
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreedToTerms) {
      toast.error("You must agree to the terms and conditions");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Here you would add your registration logic
      // For now, we'll just simulate success and send the welcome email
      await sendWelcomeEmail(email, name);
      setIsRegistered(true);
      toast.success("Account created successfully! Please check your email to verify your account.");
      
      // Redirect to login page after 5 seconds
      setTimeout(() => {
        navigate("/login");
      }, 5000);
    } catch (error) {
      toast.error("Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isRegistered) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center py-16 px-4">
          <Card className="w-full max-w-md bg-eznavy-light border-ezgray-dark">
            <CardHeader>
              <CardTitle className="text-xl text-center">Registration Successful! 🎉</CardTitle>
              <CardDescription className="text-center">
                Just one more step to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription className="text-center">
                  We've sent a verification email to <span className="font-medium">{email}</span>
                  <br />Please check your inbox and click the verification link.
                </AlertDescription>
              </Alert>
              <p className="text-sm text-ezgray text-center">
                You'll be redirected to the login page in a few moments...
              </p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => navigate("/login")}
                className="text-ezblue hover:text-ezblue-light"
              >
                Go to Login Page
              </Button>
            </CardFooter>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Logo className="mx-auto" />
            <h1 className="text-2xl font-bold mt-4">Create an account</h1>
            <p className="text-ezgray mt-2">Start editing your websites with AI</p>
          </div>
          
          <Card className="bg-eznavy-light border-ezgray-dark">
            <CardHeader>
              <CardTitle className="text-xl">Sign Up</CardTitle>
              <CardDescription>Enter your information to create an account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="bg-eznavy border-ezgray-dark text-ezwhite"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-eznavy border-ezgray-dark text-ezwhite"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-eznavy border-ezgray-dark text-ezwhite"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="terms" 
                      checked={agreedToTerms} 
                      onCheckedChange={(checked) => setAgreedToTerms(checked === true)} 
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm text-ezgray"
                    >
                      I agree to the{" "}
                      <Link to="/terms" className="text-ezblue hover:underline">
                        terms of service
                      </Link>{" "}
                      and{" "}
                      <Link to="/privacy" className="text-ezblue hover:underline">
                        privacy policy
                      </Link>
                    </label>
                  </div>
                  <Button 
                    type="submit" 
                    className="bg-ezblue text-eznavy hover:bg-ezblue-light" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Creating your account...
                      </>
                    ) : (
                      "Create account"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col items-center">
              <div className="text-sm text-ezgray">
                Already have an account?{" "}
                <Link to="/login" className="text-ezblue hover:underline">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Register;
