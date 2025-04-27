
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const TabBar = ({ activeTab, onTabChange }: TabBarProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="w-full justify-start rounded-none border-b bg-background">
        <TabsTrigger 
          value="index.html"
          className="rounded-t-md rounded-b-none border-b-2 border-transparent px-6 py-3 text-sm font-medium transition-all data-[state=active]:border-primary data-[state=active]:text-primary"
        >
          index.html
        </TabsTrigger>
        <TabsTrigger 
          value="style.css"
          className="rounded-t-md rounded-b-none border-b-2 border-transparent px-6 py-3 text-sm font-medium transition-all data-[state=active]:border-primary data-[state=active]:text-primary"
        >
          style.css
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
