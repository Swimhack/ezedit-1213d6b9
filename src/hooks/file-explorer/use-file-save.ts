
import { useState } from 'react';
import { toast } from 'sonner';

export function useFileSave() {
  const [isSaving, setIsSaving] = useState(false);

  const saveFileContent = async (
    connectionId: string,
    filePath: string,
    content: string
  ): Promise<{
    success: boolean;
    content: string;
  }> => {
    if (!connectionId || !filePath || content === undefined) {
      toast.error('Missing required data for saving');
      return { success: false, content: '' };
    }

    setIsSaving(true);

    try {
      console.log(`[useFileSave] Saving file: ${filePath}, content length: ${content.length}`);

      const response = await fetch(`/api/saveFile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: connectionId,
          filepath: filePath,
          content,
          username: 'editor-user',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save: ${response.status} ${errorText}`);
      }

      toast.success('File saved successfully');

      // After successful save, fetch the latest version to ensure consistency
      const refreshResponse = await fetch(
        `/api/readFile?path=${encodeURIComponent(connectionId + ':' + filePath)}&t=${Date.now()}`,
        {
          method: 'GET',
          cache: 'no-store',
          headers: {
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache',
          },
        }
      );

      if (refreshResponse.ok) {
        const refreshedContent = await refreshResponse.text();
        return { success: true, content: refreshedContent };
      }

      return { success: true, content };
    } catch (error: any) {
      console.error('[useFileSave] Error saving file:', error);
      toast.error(`Error saving file: ${error.message}`);
      return { success: false, content: '' };
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    saveFileContent,
  };
}
