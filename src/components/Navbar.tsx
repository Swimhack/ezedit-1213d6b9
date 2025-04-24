
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { Link } from "react-router-dom";

const Navbar = () => {
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
        </div>
      </div>
    </header>
  );
};

export default Navbar;
