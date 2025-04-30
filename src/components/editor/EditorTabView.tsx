
import React from 'react';
import { Tabs, TabList, Tab } from 'react-tabs';
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
      <Tabs selectedIndex={tabIndex} onSelect={(index) => setTabIndex(index)}>
        <TabList className="flex gap-2 mb-0">
          <Tab className="flex items-center gap-1 px-3 py-2 rounded-t cursor-pointer border-b-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800">
            <Code size={16} />
            <span>Code</span>
          </Tab>
          {!readOnly && isHtmlFile && (
            <Tab className="flex items-center gap-1 px-3 py-2 rounded-t cursor-pointer border-b-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800">
              <Columns size={16} />
              <span>Visual</span>
            </Tab>
          )}
          <Tab className="flex items-center gap-1 px-3 py-2 rounded-t cursor-pointer border-b-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800">
            <Eye size={16} />
            <span>Preview</span>
          </Tab>
        </TabList>
      </Tabs>
    </div>
  );
}
