
import React, { useState, useEffect, useRef } from 'react';
import MonacoEditor from 'react-monaco-editor';
import { Editor } from '@tinymce/tinymce-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSubscription } from '@/hooks/useSubscription';

interface CodeEditorProps {
  connection: any;
  file: any;
}

export function CodeEditorWithPreview({ connection, file }: CodeEditorProps) {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('code');
  const [language, setLanguage] = useState('javascript');
  const { isPremium } = useSubscription();
  const editorRef = useRef<any>(null);
  const hasUnsavedChanges = useRef(false);
  const originalContent = useRef<string>('');

  useEffect(() => {
    if (file && connection) {
      loadFileContent();
    }
  }, [file, connection]);

  useEffect(() => {
    // Detect language based on file extension
    if (file && file.name) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      switch (ext) {
        case 'html':
        case 'htm':
          setLanguage('html');
          break;
        case 'css':
          setLanguage('css');
          break;
        case 'js':
          setLanguage('javascript');
          break;
        case 'json':
          setLanguage('json');
          break;
        case 'php':
          setLanguage('php');
          break;
        case 'md':
          setLanguage('markdown');
          break;
        default:
          setLanguage('plaintext');
      }
    }
  }, [file]);

  const loadFileContent = async () => {
    if (!file || !connection) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('getFtpFile', {
        body: {
          host: connection.host,
          user: connection.username,
          pass: connection.password,
          path: file.path,
          port: connection.port || 21,
          sftp: false
        }
      });

      if (error) {
        toast.error(`Error loading file: ${error.message}`);
        return;
      }

      if (data.success) {
        const fileContent = data.isBinary ? atob(data.content) : data.content;
        setContent(fileContent);
        originalContent.current = fileContent;
        hasUnsavedChanges.current = false;
      }
    } catch (err: any) {
      toast.error(`Failed to load file: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const saveFile = async () => {
    if (!isPremium) {
      toast.error("Saving files requires a premium subscription");
      return;
    }

    if (!file || !connection) return;
    
    setIsSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('saveFtpFile', {
        body: {
          host: connection.host,
          user: connection.username,
          pass: connection.password,
          path: file.path,
          content: content,
          port: connection.port || 21,
          sftp: false
        }
      });

      if (error) {
        toast.error(`Error saving file: ${error.message}`);
        return;
      }

      if (data.success) {
        toast.success("File saved successfully");
        originalContent.current = content;
        hasUnsavedChanges.current = false;
      }
    } catch (err: any) {
      toast.error(`Failed to save file: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditorChange = (newValue: string) => {
    setContent(newValue);
    hasUnsavedChanges.current = newValue !== originalContent.current;
  };

  const handleTinyMCEChange = (content: string) => {
    setContent(content);
    hasUnsavedChanges.current = content !== originalContent.current;
  };

  const editorOptions = {
    selectOnLineNumbers: true,
    roundedSelection: false,
    readOnly: false,
    cursorStyle: 'line',
    automaticLayout: true,
    minimap: { enabled: false },
  };

  if (!file) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Please select a file to edit
      </div>
    );
  }

  if (isLoading) {
    return (
      <Card className="h-full p-4">
        <Skeleton className="h-6 w-1/4 mb-4" />
        <Skeleton className="h-full w-full" />
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-100 p-2 flex items-center justify-between">
        <div className="text-sm font-medium truncate max-w-md">
          {file.path}
        </div>
        <div className="flex items-center">
          {hasUnsavedChanges.current && (
            <div className="text-orange-500 mr-2 text-sm">● Unsaved changes</div>
          )}
          <Button
            size="sm"
            onClick={saveFile}
            disabled={isSaving || !hasUnsavedChanges.current || !isPremium}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>

      {language === 'html' ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="px-4 bg-gray-100 border-b">
            <TabsTrigger value="code">Code</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="visual">Visual Editor</TabsTrigger>
          </TabsList>
          
          <TabsContent value="code" className="flex-1 h-full">
            <MonacoEditor
              width="100%"
              height="100%"
              language={language}
              theme="vs-dark"
              value={content}
              options={editorOptions}
              onChange={handleEditorChange}
              editorDidMount={(editor) => {
                editorRef.current = editor;
              }}
            />
          </TabsContent>
          
          <TabsContent value="preview" className="h-full">
            <iframe
              srcDoc={content}
              title="Preview"
              className="w-full h-full border-0"
              sandbox="allow-scripts"
            />
          </TabsContent>
          
          <TabsContent value="visual" className="h-full">
            <Editor
              apiKey="no-api-key"
              initialValue={content}
              init={{
                height: '100%',
                menubar: true,
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                  'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                  'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                ],
                toolbar: 'undo redo | formatselect | ' +
                  'bold italic backcolor | alignleft aligncenter ' +
                  'alignright alignjustify | bullist numlist outdent indent | ' +
                  'removeformat | help',
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
              }}
              onEditorChange={handleTinyMCEChange}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="flex-1 h-full">
          <MonacoEditor
            width="100%"
            height="100%"
            language={language}
            theme="vs-dark"
            value={content}
            options={editorOptions}
            onChange={handleEditorChange}
            editorDidMount={(editor) => {
              editorRef.current = editor;
            }}
          />
        </div>
      )}
    </div>
  );
}
