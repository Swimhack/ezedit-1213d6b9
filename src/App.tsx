
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { EzEditCodeEditor } from "@/components/EzEditCodeEditor";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";

// For this example, we'll use mock connection data
const MOCK_CONNECTION = {
  id: "demo-connection-1",
  host: "ftp.example.com",
  username: "demo",
  password: "password",
};

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="ez-edit-theme">
      <TooltipProvider>
        <div className="min-h-screen flex flex-col">
          <header className="bg-white dark:bg-gray-900 border-b px-4 py-3 flex items-center justify-between">
            <h1 className="text-lg font-medium">ezEdit Code Editor</h1>
          </header>
          
          <main className="flex-grow overflow-hidden p-0">
            <div className="h-[calc(100vh-60px)]">
              <EzEditCodeEditor connection={MOCK_CONNECTION} />
            </div>
          </main>
          
          <Toaster />
        </div>
      </TooltipProvider>
    </ThemeProvider>
  );
}
