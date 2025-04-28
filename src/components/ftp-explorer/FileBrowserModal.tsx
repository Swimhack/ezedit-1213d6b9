
// src/components/ftp-connections/ftpConnector.ts
import { Client } from "basic-ftp";

class FTPConnector {
  private client: Client;

  constructor() {
    this.client = new Client();
    // optional: this.client.ftp.verbose = true;
  }

  async get(path: string): Promise<string> {
    await this.client.access({
      host: process.env.FTP_HOST!,
      user: process.env.FTP_USER!,
      password: process.env.FTP_PASS!,
      secure: false,    // or true for FTPS
    });
    const stream = await this.client.downloadTo(Buffer.alloc(0), path);
    // if downloadTo into a buffer isn’t available, use downloadToTemp or similar,
    // then read that temp file back into a string.
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk as Buffer);
    }
    await this.client.close();
    return Buffer.concat(chunks).toString("utf-8");
  }

  // You can also add .put(path, data) for saving files back to FTP.
}

export default new FTPConnector();
wserModalProps) {
  // Use store to access activeConnection
  const activeConnection = useFileExplorerStore(state => state.activeConnection);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  
  // Enhanced onSelectFile handler that opens the editor modal for files
  const handleSelectFile = async (file: { key: string; isDir: boolean }) => {
    if (file.isDir) {
      // For directories, just use original handler
      onSelectFile(file);
    } else {
      // For files, store the path and open the editor modal
      setSelectedFile(file.key);
      // Still call the original handler to load file content
      await onSelectFile(file);
    }
  };
  
  // Effect to ensure files are loaded when the modal is opened
  useEffect(() => {
    let timeout: number;
    
    if (isOpen && files.length === 0 && !isLoading) {
      // If modal is opened but no files are loaded yet, trigger navigation to current path
      timeout = window.setTimeout(() => {
        onNavigate(currentPath);
      }, 100);
    }
    
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [isOpen, files.length, isLoading, currentPath, onNavigate]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0">
          <FileExplorerHeader serverName={serverName} onClose={onClose} />
          <div className="flex-1 overflow-hidden">
            <div className="p-3 border-b border-ezgray-dark">
              <DialogTitle className="text-sm font-medium text-ezwhite">
                {serverName} - File Explorer
              </DialogTitle>
            </div>
            <div className="flex-1 overflow-y-auto h-[calc(80vh-8rem)]">
              <FTPFileList
                currentPath={currentPath}
                files={files}
                onNavigate={onNavigate}
                onSelectFile={handleSelectFile}
                isLoading={isLoading}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {activeConnection && selectedFile && (
        <FileEditorModal
          isOpen={!!selectedFile}
          onClose={() => setSelectedFile(null)}
          connectionId={activeConnection.id}
          filePath={selectedFile}
        />
      )}
    </>
  );
}
