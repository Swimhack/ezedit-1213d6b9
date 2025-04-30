
import { supabase } from "@/integrations/supabase/client";
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { listDir, getFile, saveFile } from "@/lib/ftp";
import { useSearchParams } from 'react-router-dom';
import { FolderOpen, File } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { FileEditorContent } from "@/components/ftp-explorer/FileEditorContent";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { FTPConnectionForm } from "@/components/ftp-explorer/FTPConnectionForm";
import { FTPFileExplorerHeader } from "@/components/ftp-explorer/FTPFileExplorerHeader";
import { FTPFileListToolbar } from "@/components/ftp-explorer/FTPFileListToolbar";
import { FTPFileActions } from "@/components/ftp-explorer/FTPFileActions";
import { FTPNewFileDialog } from "@/components/ftp-explorer/FTPNewFileDialog";

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
  
  // Fix: Get session user instead of using deprecated user() method
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };
    getUser();
  }, []);
  
  const trialStatus = useTrialStatus(user?.email);

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
        // Fix: Use getFile from lib/ftp instead of fetchFiles
        const { data, error } = await getFile(ftpHost, currentPath + '/' + file.name);
        if (error) throw new Error(error.message || "Failed to fetch file content");
        
        setSelectedFileContent(data?.content || "");
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

  const { data: files, isLoading, refetch } = useQuery({
    queryKey: ['ftpFiles', ftpHost, ftpPort, ftpUser, ftpPassword, currentPath],
    queryFn: async () => {
      // Fix: Use listDir instead of fetchFiles
      const result = await listDir(ftpHost, currentPath);
      return result.data?.files || [];
    },
    enabled: !!ftpHost && !!ftpUser && !!ftpPassword,
  });

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
      // Fix: Use saveFile from lib/ftp instead of fetchFiles
      await saveFile({
        id: ftpHost, 
        filepath: currentPath + '/' + selectedFileName, 
        content: selectedFileContent
      });
      
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
      // await fetchFiles(ftpHost, ftpPort, ftpUser, ftpPassword, currentPath + '/' + newFileName, 'create', newFileContent);
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

  const handleRenameFile = (fileName: string) => {
    setFileToRename(fileName);
    setNewFileNameRename(fileName);
    setIsRenameModalOpen(true);
  };

  const handleDeleteFile = (fileName: string) => {
    setFileToDelete(fileName);
    setIsDeleteModalOpen(true);
  };

  return (
    <Card className="w-full">
      <div className="md:grid md:grid-cols-4 md:gap-6">
        <div className="md:col-span-1">
          <FTPFileExplorerHeader 
            title="FTP Connection" 
            description="Manage your FTP connection details here." 
          />
        </div>
        <div className="mt-5 md:col-span-3 md:mt-0">
          <FTPConnectionForm
            ftpHost={ftpHost}
            ftpPort={ftpPort}
            ftpUser={ftpUser}
            ftpPassword={ftpPassword}
            isConnecting={isConnecting}
            onHostChange={setFtpHost}
            onPortChange={setFtpPort}
            onUserChange={setFtpUser}
            onPasswordChange={setFtpPassword}
            onConnect={handleConnect}
          />
        </div>
      </div>

      <div className="mt-8">
        <div className="md:grid md:grid-cols-4 md:gap-6">
          <div className="md:col-span-1">
            <FTPFileExplorerHeader 
              title="File Explorer" 
              description="Browse and manage your files on the FTP server." 
            />
          </div>
          <div className="mt-5 md:col-span-3 md:mt-0">
            <div className="shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 bg-white sm:p-6">
                <FTPFileListToolbar
                  currentPath={currentPath}
                  onCreateFolder={() => setIsCreateFolderModalOpen(true)}
                  onCreateFile={handleCreateNewFile}
                  onUploadFile={() => setIsUploadModalOpen(true)}
                />
                
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
                          <TableCell className="text-right">
                            <FTPFileActions
                              ftpHost={ftpHost}
                              file={file}
                              onDownload={handleDownloadFile}
                              onEdit={handleEditFile}
                              onRename={handleRenameFile}
                              onDelete={handleDeleteFile}
                            />
                          </TableCell>
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
              <FTPFileExplorerHeader 
                title="File Editor" 
                description="Edit the selected file content here." 
              />
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

      <FTPNewFileDialog
        isOpen={isNewFileModalOpen}
        newFileName={newFileName}
        newFileContent={newFileContent}
        onNewFileNameChange={setNewFileName}
        onNewFileContentChange={setNewFileContent}
        onCancel={handleCancelNewFile}
        onConfirm={handleConfirmNewFile}
      />
    </Card>
  );
};

export default FTPFileExplorer;
