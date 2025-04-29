
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();

  const handleRegisterTrial = async (email: string) => {
    try {
      // Register the trial user using our edge function
      const { data, error } = await supabase.functions.invoke('register-trial', {
        body: { email }
      });
      
      if (error) throw new Error(error.message || 'Failed to register trial');
      
      console.log('Trial registration successful:', data);
      
    } catch (error: any) {
      console.error('Error registering trial:', error);
      toast.error(error.message || "Failed to register trial. Please try again.");
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
      // Create the user account
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) throw error;

      // Register the trial in parallel
      await handleRegisterTrial(email);
      
      setIsRegistered(true);
      toast.success("Account created successfully! Please check your email to verify your account. Your 7-day trial has started.");
      
      // Redirect to login page after 5 seconds
      setTimeout(() => {
        navigate("/login");
      }, 5000);
    } catch (error: any) {
      toast.error(error.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isRegistered) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center py-16 px-4">
          <Card className="w-full max-w-md">
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
              <p className="text-sm text-muted-foreground text-center">
                You'll be redirected to the login page in a few moments...
              </p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => navigate("/login")}
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
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden">
      <Navbar />
      <div className="flex-grow flex items-center justify-center py-16 px-4 w-full">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-2">Create an account</h1>
          <p className="text-muted-foreground text-center mb-8">Start your 7-day free trial</p>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Sign Up</CardTitle>
              <CardDescription>
                Enter your information to create an account and start your free trial
              </CardDescription>
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
                      className="text-sm text-muted-foreground"
                    >
                      I agree to the{" "}
                      <Link to="/terms" className="text-primary hover:underline">
                        terms of service
                      </Link>{" "}
                      and{" "}
                      <Link to="/privacy" className="text-primary hover:underline">
                        privacy policy
                      </Link>
                    </label>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Creating your account...
                      </>
                    ) : (
                      "Start Free Trial"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col items-center">
              <div className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline">
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
