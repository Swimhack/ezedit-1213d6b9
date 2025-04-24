
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LayoutDashboard, LogOut } from "lucide-react";

const Navbar = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is authenticated
    const getUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };
    
    getUser();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
    }
  };

  return (
    <header className="w-full border-b border-ezgray-dark bg-eznavy/80 backdrop-blur-md fixed top-0 z-50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4 md:px-6">
        <Link to="/" className="flex items-center">
          <Logo />
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/features" className="text-ezgray hover:text-ezwhite transition-colors">
            Features
          </Link>
          <Link to="/pricing" className="text-ezgray hover:text-ezwhite transition-colors">
            Pricing
          </Link>
          <Link to="/docs" className="text-ezgray hover:text-ezwhite transition-colors">
            Docs
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" className="flex items-center gap-2 text-ezwhite hover:text-ezblue hover:bg-eznavy-light">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                className="text-ezwhite hover:text-ezblue hover:bg-eznavy-light"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="text-ezwhite hover:text-ezblue hover:bg-eznavy-light">
                  Log in
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-ezblue text-eznavy hover:bg-ezblue-light">
                  Sign up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
