
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";

interface RegistrationSuccessProps {
  email: string;
}

const RegistrationSuccess = ({ email }: RegistrationSuccessProps) => {
  const navigate = useNavigate();

  return (
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
  );
};

export default RegistrationSuccess;
