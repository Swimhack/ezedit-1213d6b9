import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import About from "@/pages/About";
import Features from "@/pages/Features";
import Pricing from "@/pages/Pricing";
import Register from "@/pages/Register";
import Login from "@/pages/Login";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import Docs from "@/pages/Docs";
import Support from "@/pages/Support";
import Blog from "@/pages/Blog";
import Roadmap from "@/pages/Roadmap";
import Dashboard from "@/pages/Dashboard";
import Files from "@/pages/Files";
import Settings from "@/pages/Settings";
import MySites from "@/pages/MySites";
import Logs from "@/pages/Logs";
import Upload from "@/pages/Upload";
import NotFound from "@/pages/NotFound";
import Editor from "@/pages/Editor";
import CodeEditor from "@/pages/CodeEditor";

function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/support" element={<Support />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/files" element={<Files />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/mysites" element={<MySites />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/editor/:connectionId" element={<Editor />} />
        <Route path="/code-editor" element={<CodeEditor />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
