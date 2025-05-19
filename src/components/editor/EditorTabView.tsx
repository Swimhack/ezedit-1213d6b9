
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Columns, Eye } from 'lucide-react';

interface EditorTabViewProps {
  tabIndex: number;
  setTabIndex: (index: number) => void;
  readOnly?: boolean;
  isHtmlFile: boolean;
}

export function EditorTabView({ 
  tabIndex, 
  setTabIndex, 
  readOnly = false,
  isHtmlFile
}: EditorTabViewProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 pb-1">
      <Tabs value={String(tabIndex)} onValueChange={(value) => setTabIndex(parseInt(value))}>
        <TabsList className="flex gap-2 mb-0">
          <TabsTrigger value="0" className="flex items-center gap-1 px-3 py-2 rounded-t cursor-pointer border-b-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800">
            <Code size={16} />
            <span>Code</span>
          </TabsTrigger>
          {!readOnly && isHtmlFile && (
            <TabsTrigger value="1" className="flex items-center gap-1 px-3 py-2 rounded-t cursor-pointer border-b-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800">
              <Columns size={16} />
              <span>Visual</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="2" className="flex items-center gap-1 px-3 py-2 rounded-t cursor-pointer border-b-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800">
            <Eye size={16} />
            <span>Preview</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
