
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import FTPConnection from "./pages/FTPConnection";
import Settings from "./pages/Settings";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import Docs from "./pages/Docs";
import Blog from "./pages/Blog";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Roadmap from "./pages/Roadmap";
import Support from "./pages/Support";
import MySites from "@/pages/MySites";
import CodeEditor from "@/pages/CodeEditor";
import Demo from "./pages/Demo";
import Logs from "./pages/Logs";
import TrialProtection from "./components/TrialProtection";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      setIsLoading(false);
    };
    
    getSession();
    
    // Set up auth change listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {isLoading ? (
            <div className="flex items-center justify-center h-screen">
              <p className="animate-pulse">Loading...</p>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/features" element={<Features />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/docs" element={<Docs />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/roadmap" element={<Roadmap />} />
              <Route path="/support" element={<Support />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="/demo" element={<Demo />} />
              
              {/* Protected Dashboard Routes */}
              <Route path="/dashboard" element={user ? <Navigate to="/dashboard/sites" replace /> : <Navigate to="/login" replace />} />
              <Route path="/dashboard/ftp" element={user ? <FTPConnection /> : <Navigate to="/login" replace />} />
              <Route path="/dashboard/settings" element={user ? <Settings /> : <Navigate to="/login" replace />} />
              <Route path="/dashboard/sites" element={user ? <MySites /> : <Navigate to="/login" replace />} />
              <Route path="/dashboard/editor" element={user ? <CodeEditor /> : <Navigate to="/login" replace />} />
              <Route path="/dashboard/logs" element={user ? <Logs /> : <Navigate to="/login" replace />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          )}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
