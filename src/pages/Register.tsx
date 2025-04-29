
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RegisterForm from "@/components/auth/RegisterForm";
import RegistrationSuccess from "@/components/auth/RegistrationSuccess";
import { useTheme } from "@/hooks/use-theme";

const Register = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();

  // Redirect to login page after successful registration
  useEffect(() => {
    if (isRegistered) {
      const timer = setTimeout(() => {
        navigate("/login");
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isRegistered, navigate]);

  const handleRegisterSuccess = (email: string) => {
    setRegisteredEmail(email);
    setIsRegistered(true);
  };

  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden">
      <Navbar />
      <div className="flex-grow flex items-center justify-center py-16 px-4 w-full">
        <div className="w-full max-w-md">
          {!isRegistered ? (
            <>
              <h1 className="text-2xl font-bold text-center mb-2">Create an account</h1>
              <p className="text-muted-foreground text-center mb-8">Start your 7-day free trial</p>
              <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
            </>
          ) : (
            <RegistrationSuccess email={registeredEmail} />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Register;
