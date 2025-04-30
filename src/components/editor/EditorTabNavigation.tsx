
import React from 'react';
import { Code, Edit3 } from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EditorTabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isHtmlFile: boolean;
}

export function EditorTabNavigation({ 
  activeTab, 
  setActiveTab, 
  isHtmlFile 
}: EditorTabNavigationProps) {
  return (
    <TabsList>
      <TabsTrigger 
        value="code" 
        onClick={() => setActiveTab("code")}
        className="flex items-center gap-1"
        data-state={activeTab === 'code' ? 'active' : ''}
      >
        <Code className="w-4 h-4" />
        Code
      </TabsTrigger>
      {isHtmlFile && (
        <TabsTrigger 
          value="visual" 
          onClick={() => setActiveTab("visual")}
          className="flex items-center gap-1"
          data-state={activeTab === 'visual' ? 'active' : ''}
        >
          <Edit3 className="w-4 h-4" />
          Visual
        </TabsTrigger>
      )}
    </TabsList>
  );
}
