
import { Badge } from "@/components/ui/badge";

interface ConnectionBadgeProps {
  connected: boolean | undefined;
}

export function ConnectionBadge({ connected }: ConnectionBadgeProps) {
  if (connected === undefined) {
    return null;
  }
  
  return connected ? (
    <Badge className="bg-green-500">
      Connected
    </Badge>
  ) : (
    <Badge variant="destructive">
      Failed
    </Badge>
  );
}
