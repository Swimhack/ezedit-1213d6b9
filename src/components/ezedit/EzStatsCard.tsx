
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getStats } from "@/lib/ftp";
import { Loader } from "lucide-react";
import { formatFileSize } from "@/lib/utils";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A569BD"];
const FILE_TYPE_COLORS: Record<string, string> = {
  html: "#E34C26",
  css: "#563D7C",
  js: "#F1E05A",
  php: "#4F5D95",
  json: "#000000",
  txt: "#333333",
  md: "#083fa1",
  svg: "#FFB13B",
  png: "#a074c4",
  jpg: "#a074c4",
  jpeg: "#a074c4",
  gif: "#a074c4",
};

interface StatsData {
  totalFiles: number;
  totalSize: number;
  extensions: Record<string, number>;
  recentFiles: {
    path: string;
    modified: string;
    size: number;
  }[];
  recentBackups: {
    path: string;
    created: string;
  }[];
}

export default function EzStatsCard({ connectionId }: { connectionId: string }) {
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await getStats(connectionId);
        
        if (error) {
          throw new Error(error);
        }
        
        setStatsData(data);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch stats:", err);
        setError(err.message || "Failed to load statistics");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, [connectionId]);
  
  const prepareExtensionData = () => {
    if (!statsData?.extensions) return [];
    
    return Object.entries(statsData.extensions)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };
  
  const getExtensionColor = (extension: string) => {
    return FILE_TYPE_COLORS[extension] || COLORS[Math.floor(Math.random() * COLORS.length)];
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Connection Statistics</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <Loader className="h-8 w-8 animate-spin text-blue-500" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Connection Statistics</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-red-500">
          <p>Failed to load statistics</p>
          <p className="text-sm mt-2">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const extensionData = prepareExtensionData();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Connection Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Total Files</span>
                <span className="font-medium">{statsData?.totalFiles || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Total Size</span>
                <span className="font-medium">{formatFileSize(statsData?.totalSize || 0)}</span>
              </div>
              <h4 className="font-medium mt-4">File Types</h4>
              <div className="h-[200px]">
                {extensionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={extensionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {extensionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getExtensionColor(entry.name)} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} files`, ""]} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex justify-center items-center h-full">
                    <p className="text-gray-500 dark:text-gray-400">No file type data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">Recently Modified Files</h4>
                <ul className="space-y-2">
                  {statsData?.recentFiles && statsData.recentFiles.length > 0 ? (
                    statsData.recentFiles.map((file, i) => (
                      <li key={i} className="text-sm">
                        <div className="flex justify-between">
                          <span className="truncate max-w-[200px]" title={file.path}>
                            {file.path.split('/').pop()}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(file.modified).toLocaleString()}
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-gray-500 dark:text-gray-400">No recent files</li>
                  )}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">Recent Backups</h4>
                <ul className="space-y-2">
                  {statsData?.recentBackups && statsData.recentBackups.length > 0 ? (
                    statsData.recentBackups.map((backup, i) => (
                      <li key={i} className="text-sm">
                        <div className="truncate max-w-[300px]" title={backup.path}>
                          {backup.path.split('/').pop()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(backup.created).toLocaleString()}
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-gray-500 dark:text-gray-400">No recent backups</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
