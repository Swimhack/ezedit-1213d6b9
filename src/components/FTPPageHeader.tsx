
import { PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface FTPPageHeaderProps {
  onConnect: () => void;
}

export function FTPPageHeader({ onConnect }: FTPPageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">My Sites</h1>
        <p className="text-ezgray mt-2">
          <Badge variant="outline" className="mr-2 bg-eznavy text-ezwhite">Beta</Badge>
          Manage your FTP connections and site files
        </p>
      </div>
      <Button onClick={onConnect} className="bg-ezblue hover:bg-ezblue/90">
        <PlusCircle className="mr-2" size={16} /> Connect a Site
      </Button>
    </div>
  );
}
