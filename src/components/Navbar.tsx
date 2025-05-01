
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LayoutDashboard, LogOut, Shield, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Navbar = () => {
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isSuperAdmin } = useSuperAdmin(user?.email);

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
        
        {/* Desktop Navigation */}
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
        
        {/* Auth Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle className="mr-1" />

          {/* Always visible logout button on mobile when signed in */}
          {user && (
            <Button 
              variant="ghost" 
              size="icon"
              className="md:hidden flex items-center justify-center"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              <span className="sr-only">Log out</span>
            </Button>
          )}

          {/* Mobile Menu */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[240px] py-12">
              <nav className="flex flex-col gap-4">
                <Link 
                  to="/features" 
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Features
                </Link>
                <Link 
                  to="/pricing" 
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link 
                  to="/docs" 
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Docs
                </Link>
                {user ? (
                  <>
                    <Link
                      to="/dashboard" 
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <Button 
                      variant="ghost" 
                      className="flex items-center justify-start gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4" />
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Log in
                    </Link>
                    <Link 
                      to="/register" 
                      className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
                {isSuperAdmin && (
                  <div className="flex items-center gap-1 text-amber-500 px-2 py-1 rounded-md bg-amber-100 dark:bg-amber-900/30">
                    <Shield className="w-4 h-4" />
                    <span className="text-xs font-medium">Admin</span>
                  </div>
                )}
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
      </div>
    </header>
  );
};

export default Navbar;
