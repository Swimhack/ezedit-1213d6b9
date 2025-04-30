
import React from "react";

interface FTPFileExplorerHeaderProps {
  title: string;
  description: string;
}

export function FTPFileExplorerHeader({ title, description }: FTPFileExplorerHeaderProps) {
  return (
    <div className="px-4 sm:px-0">
      <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-600">
        {description}
      </p>
    </div>
  );
}
