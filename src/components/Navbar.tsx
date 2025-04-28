
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LayoutDashboard, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

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
    <header className="w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 fixed top-0 z-50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4 md:px-6">
        <Link to="/" className="flex items-center">
          <Logo />
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/features" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            Features
          </Link>
          <Link to="/pricing" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            Pricing
          </Link>
          <Link to="/docs" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            Docs
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  Log in
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
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
