
import { ExternalLink, Trash2, Settings } from "lucide-react";

interface SiteCardProps {
  connection: {
    id: string;
    server_name: string;
    host: string;
    web_url?: string | null;
  };
  testResult?: boolean;
  onTest: () => void;
  onViewFiles: () => void;
  onEdit: () => void;
}

export function SiteCard({ connection, onTest, onViewFiles, onEdit }: SiteCardProps) {
  return (
    <div
      className="group relative flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition
                 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:shadow-lg"
    >
      {/* Quick action bar */}
      <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100 md:opacity-100">
        <button
          onClick={onEdit}
          className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-blue-600 hover:text-white dark:bg-slate-700 dark:text-slate-300"
          aria-label="Settings"
        >
          <Settings size={16} />
        </button>
        <button
          onClick={onTest}
          className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-red-600 hover:text-white dark:bg-slate-700 dark:text-slate-300"
          aria-label="Test Connection"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Site icon / initial */}
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950">
        {connection.server_name[0].toUpperCase()}
      </div>

      <h3 className="mb-1 truncate text-lg font-semibold text-slate-800 dark:text-slate-100">
        {connection.server_name}
      </h3>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
        Host: {connection.host}
      </p>

      <button
        onClick={onViewFiles}
        className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
      >
        View files <ExternalLink size={14} />
      </button>
    </div>
  );
}
