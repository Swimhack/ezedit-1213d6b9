
import { Loader2 } from "lucide-react";

export function LoadingOverlay() {
  return (
    <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <Loader2 className="animate-spin" size={24} />
    </div>
  );
}
