
import { ConnectionCard } from "./connections/ConnectionCard";
import type { FtpConnection } from "@/hooks/use-ftp-connections";

interface FTPConnectionCardProps {
  connection: FtpConnection;
  testResult: boolean | undefined;
  onTest: () => void;
  onViewFiles: () => void;
  onEdit: () => void;
}

// Re-export the ConnectionCard as FTPConnectionCard for backward compatibility
export function FTPConnectionCard(props: FTPConnectionCardProps) {
  return <ConnectionCard {...props} />;
}
