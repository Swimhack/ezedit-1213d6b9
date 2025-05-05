
import React, { useState, useEffect, useRef } from 'react';
import MonacoEditor from 'react-monaco-editor';
import { Editor } from '@tinymce/tinymce-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useSubscription } from '@/hooks/useSubscription';
import { Loader, Save, SplitSquareVertical, Code, FileEdit } from 'lucide-react';
import Split from 'react-split';
import '@/split-styles.css';

interface CodeEditorWithPreviewProps {
  filePath: string;
  initialContent: string;
  readOnly?: boolean;
  onSave?: (content: string) => Promise<void>;
}

const CodeEditorWithPreview: React.FC<CodeEditorWithPreviewProps> = ({
  filePath,
  initialContent,
  readOnly = false,
  onSave
}) => {
  const [content, setContent] = useState(initialContent);
  const [mode, setMode] = useState<'code' | 'wysiwyg'>('code');
  const [isSplitView, setIsSplitView] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const editorRef = useRef<any>(null);
  const { isPremium } = useSubscription();
  const isHtmlFile = filePath.toLowerCase().endsWith('.html') || filePath.toLowerCase().endsWith('.htm');

  useEffect(() => {
    setContent(initialContent);
    setHasChanges(false);
  }, [initialContent, filePath]);

  const handleEditorChange = (newValue: string) => {
    setContent(newValue);
    setHasChanges(true);
  };

  const handleWysiwygChange = (content: string) => {
    setContent(content);
    setHasChanges(true);
  };

  const getLanguage = (filePath: string) => {
    const extension = filePath.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'js':
        return 'javascript';
      case 'jsx':
        return 'javascript';
      case 'ts':
        return 'typescript';
      case 'tsx':
        return 'typescript';
      case 'html':
      case 'htm':
        return 'html';
      case 'css':
        return 'css';
      case 'scss':
        return 'scss';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      case 'php':
        return 'php';
      default:
        return 'plaintext';
    }
  };

  const handleSave = async () => {
    if (!isPremium) {
      toast.error("Saving is only available for premium subscribers");
      return;
    }

    if (!onSave) {
      toast.error("Save functionality not available");
      return;
    }

    try {
      setIsSaving(true);
      await onSave(content);
      setHasChanges(false);
      toast.success("File saved successfully");
    } catch (error: any) {
      toast.error(`Error saving file: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const renderPreview = () => {
    if (!isHtmlFile) {
      return (
        <div className="flex items-center justify-center h-full p-4 text-gray-500 bg-gray-100">
          <p>Preview not available for non-HTML files</p>
        </div>
      );
    }

    return (
      <div className="h-full overflow-auto bg-white">
        <iframe
          title="Preview"
          srcDoc={content}
          className="w-full h-full border-0"
          sandbox="allow-scripts"
        />
      </div>
    );
  };

  const editorOptions = {
    selectOnLineNumbers: true,
    roundedSelection: true,
    readOnly: readOnly,
    cursorStyle: 'line' as const,
    automaticLayout: true,
    minimap: {
      enabled: false
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center space-x-2">
          {isHtmlFile && (
            <Tabs value={mode} onValueChange={(value) => setMode(value as 'code' | 'wysiwyg')}>
              <TabsList>
                <TabsTrigger value="code" className="flex items-center">
                  <Code className="w-4 h-4 mr-1" />
                  Code
                </TabsTrigger>
                <TabsTrigger value="wysiwyg" className="flex items-center">
                  <FileEdit className="w-4 h-4 mr-1" />
                  WYSIWYG
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSplitView(!isSplitView)}
            title={isSplitView ? "Hide preview" : "Show preview"}
          >
            <SplitSquareVertical className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={readOnly || isSaving || !hasChanges || !isPremium}
            className={!isPremium ? "opacity-60" : ""}
          >
            {isSaving ? <Loader className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
            Save
          </Button>
        </div>
      </div>

      {!isPremium && (
        <div className="bg-yellow-50 text-yellow-800 p-2 text-sm text-center">
          Free Trial Mode: View and edit files, but saving requires a premium subscription.
        </div>
      )}

      {mode === 'code' ? (
        isSplitView ? (
          <Split
            className="split-container"
            direction="vertical"
            sizes={[60, 40]}
            minSize={100}
            gutterSize={8}
            gutterAlign="center"
          >
            <div className="flex-grow overflow-hidden">
              <MonacoEditor
                language={getLanguage(filePath)}
                value={content}
                options={editorOptions}
                onChange={handleEditorChange}
                editorDidMount={(editor) => {
                  editorRef.current = editor;
                }}
                height="100%"
              />
            </div>
            <div className="overflow-hidden">
              {renderPreview()}
            </div>
          </Split>
        ) : (
          <div className="flex-grow overflow-hidden">
            <MonacoEditor
              language={getLanguage(filePath)}
              value={content}
              options={editorOptions}
              onChange={handleEditorChange}
              editorDidMount={(editor) => {
                editorRef.current = editor;
              }}
              height="100%"
            />
          </div>
        )
      ) : (
        <div className="flex-grow">
          <Editor
            apiKey="your-tinymce-api-key"
            init={{
              height: '100%',
              menubar: true,
              plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
              ],
              toolbar: 'undo redo | blocks | ' +
                'bold italic forecolor | alignleft aligncenter ' +
                'alignright alignjustify | bullist numlist outdent indent | ' +
                'removeformat | help',
              content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
            }}
            value={content}
            onEditorChange={handleWysiwygChange}
            disabled={readOnly}
          />
        </div>
      )}
    </div>
  );
};

export default CodeEditorWithPreview;
