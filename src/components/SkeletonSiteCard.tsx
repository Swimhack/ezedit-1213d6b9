
export function SkeletonSiteCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 h-10 w-10 rounded-lg bg-slate-200 dark:bg-slate-700"></div>
      <div className="mb-2 h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700"></div>
      <div className="mb-6 h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-700"></div>
      <div className="h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-700"></div>
    </div>
  );
}
