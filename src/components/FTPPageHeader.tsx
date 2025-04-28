
import { PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface FTPPageHeaderProps {
  onConnect: () => void;
}

export function FTPPageHeader({ onConnect }: FTPPageHeaderProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">My Sites</h1>
        <p className="text-gray-600 mt-1 md:mt-2">
          <Badge variant="outline" className="mr-2 bg-blue-500 text-white">Beta</Badge>
          {!isMobile && "Manage your FTP connections and site files"}
        </p>
      </div>
      <Button onClick={onConnect} className="bg-blue-500 hover:bg-blue-600 text-white">
        {isMobile ? (
          <PlusCircle size={20} />
        ) : (
          <>
            <PlusCircle className="mr-2" size={16} /> Connect a Site
          </>
        )}
      </Button>
    </div>
  );
}
