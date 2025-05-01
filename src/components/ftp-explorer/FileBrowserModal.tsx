
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FileBrowser } from "@/components/ftp-connections/FileBrowser";
import { FtpConnection } from "@/hooks/use-ftp-connections";

interface FileBrowserModalProps {
  isOpen: boolean;
  connection: FtpConnection | null;
  onClose: () => void;
  onSelectFile: (file: { key: string; isDir: boolean }) => void;
  title?: string;
}

export function FileBrowserModal({
  isOpen,
  connection,
  onClose,
  onSelectFile,
  title = "File Browser"
}: FileBrowserModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl">
        <div className="space-y-4">
          <div className="border-b pb-2">
            <h2 className="text-lg font-medium">{title}</h2>
            <p className="text-sm text-muted-foreground">
              {connection ? `Connected to ${connection.server_name || connection.host}` : 'No active connection'}
            </p>
          </div>

          <FileBrowser
            connection={connection}
            onSelectFile={onSelectFile}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
