// Import the supabase client properly
import { supabase } from "@/integrations/supabase/client";
import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Shell } from "@/components/Shell";
import { useQuery } from "@tanstack/react-query";
import { fetchFiles } from "@/lib/ftp";
import { useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { FolderOpen, File, MoreHorizontal, Copy, Download, Edit, Trash2, Upload } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { FileEditorContent } from "@/components/ftp-explorer/FileEditorContent";
import { useEditorStore } from "@/store/editorStore";
import { UploadDialog } from "@/components/ftp-explorer/UploadDialog";
import { CreateFolderDialog } from "@/components/ftp-explorer/CreateFolderDialog";
import { RenameFileDialog } from "@/components/ftp-explorer/RenameFileDialog";
import { DeleteFileDialog } from "@/components/ftp-explorer/DeleteFileDialog";
import { useTrialStatus } from "@/hooks/useTrialStatus";

interface FileInfo {
  name: string;
  type: 'file' | 'directory';
  size: number;
  modified: string;
}

const FTPFileExplorer: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [ftpHost, setFtpHost] = useState('');
  const [ftpPort, setFtpPort] = useState(21);
  const [ftpUser, setFtpUser] = useState('');
  const [ftpPassword, setFtpPassword] = useState('');
  const [currentPath, setCurrentPath] = useState('');
  const [selectedFileContent, setSelectedFileContent] = useState('');
	const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileContent, setNewFileContent] = useState('');
  const [isEditorReadOnly, setIsEditorReadOnly] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [fileToRename, setFileToRename] = useState<string | null>(null);
  const [newFileNameRename, setNewFileNameRename] = useState('');
  const user = supabase.auth.user();
  const trialStatus = useTrialStatus(user?.email);
  const { setContent } = useEditorStore();

  const [connectionDetailsVisible, setConnectionDetailsVisible] = useState(false);

  const toggleConnectionDetailsVisibility = () => {
    setConnectionDetailsVisible(!connectionDetailsVisible);
  };

  const handleEditorContentChange = (content: string) => {
    setSelectedFileContent(content);
  };

  const handleApplyResponse = (text: string) => {
    setSelectedFileContent(text);
  };

  const handleFileSelect = (name: string) => {
    setSelectedFileName(name);
  };

  const handlePathClick = (path: string) => {
    setCurrentPath(path);
    setSearchParams({ path });
  };

  const handleFileClick = async (file: FileInfo) => {
    if (file.type === 'file') {
      setSelectedFileName(file.name);
      try {
        const fileContent = await fetchFiles(ftpHost, ftpPort, ftpUser, ftpPassword, currentPath + '/' + file.name, 'fileContent');
        setSelectedFileContent(fileContent as string);
        setContent(fileContent as string);
        setIsEditorReadOnly(true);
      } catch (error: any) {
        console.error("Error fetching file content:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to fetch content for ${file.name}: ${error.message}`,
        });
      }
    } else {
      setCurrentPath(currentPath + '/' + file.name);
      setSearchParams({ path: currentPath + '/' + file.name });
    }
  };

  const { data: files, isLoading, refetch } = useQuery(
    ['ftpFiles', ftpHost, ftpPort, ftpUser, ftpPassword, currentPath],
    () => fetchFiles(ftpHost, ftpPort, ftpUser, ftpPassword, currentPath, 'list'),
    {
      enabled: !!ftpHost && !!ftpUser && !!ftpPassword,
      onError: (error: any) => {
        console.error("Error fetching files:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to fetch files: ${error.message}`,
        });
      },
    }
  );

  useEffect(() => {
    const storedHost = localStorage.getItem('ftpHost') || '';
    const storedPort = localStorage.getItem('ftpPort') || '21';
    const storedUser = localStorage.getItem('ftpUser') || '';
    const storedPassword = localStorage.getItem('ftpPassword') || '';

    setFtpHost(storedHost);
    setFtpPort(parseInt(storedPort, 10));
    setFtpUser(storedUser);
    setFtpPassword(storedPassword);

    const pathFromURL = searchParams.get('path') || '';
    setCurrentPath(pathFromURL);
  }, [searchParams]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      localStorage.setItem('ftpHost', ftpHost);
      localStorage.setItem('ftpPort', ftpPort.toString());
      localStorage.setItem('ftpUser', ftpUser);
      localStorage.setItem('ftpPassword', ftpPassword);

      await refetch();
      toast({
        title: "Success",
        description: "Connected to FTP server successfully!",
      });
    } catch (error: any) {
      console.error("Connection error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to connect to FTP server: ${error.message}`,
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSaveFile = async () => {
    if (!selectedFileName) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No file selected to save.",
      });
      return;
    }

    setIsSaving(true);
    try {
      await fetchFiles(ftpHost, ftpPort, ftpUser, ftpPassword, currentPath + '/' + selectedFileName, 'save', selectedFileContent);
      toast({
        title: "Success",
        description: `${selectedFileName} saved successfully!`,
      });
    } catch (error: any) {
      console.error("Error saving file:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to save ${selectedFileName}: ${error.message}`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNewFile = async () => {
    setIsNewFileModalOpen(true);
  };

  const handleConfirmNewFile = async () => {
    setIsNewFileModalOpen(false);
    try {
      await fetchFiles(ftpHost, ftpPort, ftpUser, ftpPassword, currentPath + '/' + newFileName, 'create', newFileContent);
      toast({
        title: "Success",
        description: `${newFileName} created successfully!`,
      });
      setNewFileName('');
      setNewFileContent('');
      await refetch();
    } catch (error: any) {
      console.error("Error creating file:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to create ${newFileName}: ${error.message}`,
      });
    }
  };

  const handleCancelNewFile = () => {
    setIsNewFileModalOpen(false);
    setNewFileName('');
    setNewFileContent('');
  };

  const handleDownloadFile = async (fileName: string) => {
    try {
      const fileContent = await fetchFiles(ftpHost, ftpPort, ftpUser, ftpPassword, currentPath + '/' + fileName, 'fileContent');
      const blob = new Blob([fileContent as string], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: `${fileName} downloaded successfully!`,
      });
    } catch (error: any) {
      console.error("Error downloading file:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to download ${fileName}: ${error.message}`,
      });
    }
  };

  const handleEditFile = () => {
    setIsEditorReadOnly(false);
  };

  const handleUploadComplete = useCallback(() => {
    refetch();
  }, [refetch]);

  const renderFileActions = (file: FileInfo) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(ftpHost)}>
          <Copy className="mr-2 h-4 w-4" />
          Copy FTP Host
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleDownloadFile(file.name)}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleEditFile()}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {
          setFileToRename(file.name);
          setNewFileNameRename(file.name);
          setIsRenameModalOpen(true);
        }}>
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {
          setFileToDelete(file.name);
          setIsDeleteModalOpen(true);
        }}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <Shell>
      <div className="md:grid md:grid-cols-4 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-gray-900">FTP Connection</h3>
            <p className="mt-1 text-sm text-gray-600">
              Manage your FTP connection details here.
            </p>
          </div>
        </div>
        <div className="mt-5 md:col-span-3 md:mt-0">
          <div className="shadow sm:overflow-hidden sm:rounded-md">
            <div className="bg-white px-4 py-5 sm:p-6">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-3">
                  <Label htmlFor="ftp-host">FTP Host</Label>
                  <Input
                    type="text"
                    name="ftp-host"
                    id="ftp-host"
                    value={ftpHost}
                    onChange={(e) => setFtpHost(e.target.value)}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <Label htmlFor="ftp-port">FTP Port</Label>
                  <Input
                    type="number"
                    name="ftp-port"
                    id="ftp-port"
                    value={ftpPort}
                    onChange={(e) => setFtpPort(parseInt(e.target.value, 10))}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <Label htmlFor="ftp-user">FTP User</Label>
                  <Input
                    type="text"
                    name="ftp-user"
                    id="ftp-user"
                    value={ftpUser}
                    onChange={(e) => setFtpUser(e.target.value)}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <Label htmlFor="ftp-password">FTP Password</Label>
                  <Input
                    type="password"
                    name="ftp-password"
                    id="ftp-password"
                    value={ftpPassword}
                    onChange={(e) => setFtpPassword(e.target.value)}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button onClick={handleConnect} disabled={isConnecting}>
                  {isConnecting ? "Connecting..." : "Connect"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="md:grid md:grid-cols-4 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-gray-900">File Explorer</h3>
              <p className="mt-1 text-sm text-gray-600">
                Browse and manage your files on the FTP server.
              </p>
            </div>
          </div>
          <div className="mt-5 md:col-span-3 md:mt-0">
            <div className="shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 bg-white sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-semibold text-gray-700">Current Path: {currentPath || '/'}</h4>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setIsCreateFolderModalOpen(true)}>
                      <FolderOpen className="mr-2 h-4 w-4" />
                      Create Folder
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCreateNewFile}>
                      <File className="mr-2 h-4 w-4" />
                      New File
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setIsUploadModalOpen(true)}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload File
                    </Button>
                  </div>
                </div>
                {isLoading ? (
                  <div className="text-center">Loading files...</div>
                ) : files && Array.isArray(files) ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Modified</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentPath !== '' && (
                        <TableRow>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => {
                              const pathParts = currentPath.split('/');
                              pathParts.pop();
                              const newPath = pathParts.join('/');
                              setCurrentPath(newPath);
                              setSearchParams({ path: newPath });
                            }}>
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="mr-2 h-4 w-4"><path fillRule="evenodd" d="M9.72 5.72a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 11-1.06-1.06L12.69 10 9.72 7.03a.75.75 0 010-1.31z" clipRule="evenodd" /></svg>
                              ..
                            </Button>
                          </TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>-</TableCell>
                        </TableRow>
                      )}
                      {files.map((file: FileInfo) => (
                        <TableRow key={file.name}>
                          <TableCell className="font-medium">
                            <Button variant="ghost" size="sm" onClick={() => handleFileClick(file)}>
                              {file.type === 'directory' ?
                                <FolderOpen className="mr-2 h-4 w-4" /> :
                                <File className="mr-2 h-4 w-4" />}
                              {file.name}
                            </Button>
                          </TableCell>
                          <TableCell>{file.type}</TableCell>
                          <TableCell>{file.size}</TableCell>
                          <TableCell>{file.modified}</TableCell>
                          <TableCell className="text-right">{renderFileActions(file)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center">No files found.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedFileName && (
        <div className="mt-8">
          <div className="md:grid md:grid-cols-4 md:gap-6">
            <div className="md:col-span-1">
              <div className="px-4 sm:px-0">
                <h3 className="text-lg font-medium leading-6 text-gray-900">File Editor</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Edit the selected file content here.
                </p>
              </div>
            </div>
            <div className="mt-5 md:col-span-3 md:mt-0">
              <div className="shadow sm:rounded-md">
                <div className="px-4 py-5 bg-white sm:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-semibold text-gray-700">Editing: {selectedFileName}</h4>
                    <div className="space-x-2">
                      <Button variant="outline" size="sm" onClick={handleEditFile} disabled={!isEditorReadOnly}>
                        Edit
                      </Button>
                      <Button onClick={handleSaveFile} disabled={isSaving || isEditorReadOnly}>
                        {isSaving ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </div>
                  <FileEditorContent
                    filePath={currentPath + '/' + selectedFileName}
                    content={selectedFileContent}
                    onContentChange={handleEditorContentChange}
                    onApplyResponse={handleApplyResponse}
                    readOnly={isEditorReadOnly}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={isNewFileModalOpen} onOpenChange={setIsNewFileModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create New File</AlertDialogTitle>
            <AlertDialogDescription>
              Enter the name and content for the new file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                File Name
              </Label>
              <Input id="name" value={newFileName} onChange={(e) => setNewFileName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="content" className="text-right">
                Content
              </Label>
              <Textarea id="content" value={newFileContent} onChange={(e) => setNewFileContent(e.target.value)} className="col-span-3" />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelNewFile}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmNewFile}>Create</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UploadDialog
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        ftpHost={ftpHost}
        ftpPort={ftpPort}
        ftpUser={ftpUser}
        ftpPassword={ftpPassword}
        currentPath={currentPath}
        onUploadComplete={handleUploadComplete}
      />

      <CreateFolderDialog
        isOpen={isCreateFolderModalOpen}
        onClose={() => setIsCreateFolderModalOpen(false)}
        ftpHost={ftpHost}
        ftpPort={ftpPort}
        ftpUser={ftpUser}
        ftpPassword={ftpPassword}
        currentPath={currentPath}
        onUploadComplete={refetch}
      />

      <RenameFileDialog
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        ftpHost={ftpHost}
        ftpPort={ftpPort}
        ftpUser={ftpUser}
        ftpPassword={ftpPassword}
        currentPath={currentPath}
        fileToRename={fileToRename}
        newFileName={newFileNameRename}
        setNewFileName={setNewFileNameRename}
        onUploadComplete={refetch}
      />

      <DeleteFileDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        ftpHost={ftpHost}
        ftpPort={ftpPort}
        ftpUser={ftpUser}
        ftpPassword={ftpPassword}
        currentPath={currentPath}
        fileToDelete={fileToDelete}
        onUploadComplete={refetch}
      />
    </Shell>
  );
};

export default FTPFileExplorer;
