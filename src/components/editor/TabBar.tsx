
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
          className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
        >
          index.html
        </TabsTrigger>
        <TabsTrigger 
          value="style.css"
          className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
        >
          style.css
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
