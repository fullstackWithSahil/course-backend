import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

// Define proper TypeScript interfaces
interface Log {
  id: number;
  timestamp: string;
  message: string;
  level: 'info' | 'warning' | 'error';
}

export default function Logs() {
  const [logs, setLogs] = useState<Log[]>([]);

  // Use useEffect for data fetching to prevent infinite loops
  useEffect(() => {
    fetchLogs();
  }, []); // Empty dependency array means this runs once on mount

  const fetchLogs = () => {
    // Mock logs data with different severity levels
    const mockLogs: Log[] = [
      { id: 1, timestamp: new Date().toISOString(), message: "Server started successfully", level: "info" },
      { id: 2, timestamp: new Date(Date.now() - 120000).toISOString(), message: "Database connection established", level: "info" },
      { id: 3, timestamp: new Date(Date.now() - 180000).toISOString(), message: "High CPU usage detected (82%)", level: "warning" },
      { id: 4, timestamp: new Date(Date.now() - 240000).toISOString(), message: "Failed to connect to cache server", level: "error" },
      { id: 5, timestamp: new Date(Date.now() - 300000).toISOString(), message: "User authentication successful", level: "info" },
      { id: 6, timestamp: new Date(Date.now() - 360000).toISOString(), message: "Low memory warning (85% used)", level: "warning" },
      { id: 7, timestamp: new Date(Date.now() - 420000).toISOString(), message: "File system check completed", level: "info" },
      { id: 8, timestamp: new Date(Date.now() - 480000).toISOString(), message: "API rate limit approaching", level: "warning" },
      { id: 9, timestamp: new Date(Date.now() - 540000).toISOString(), message: "Database query timeout", level: "error" },
      { id: 10, timestamp: new Date(Date.now() - 600000).toISOString(), message: "Scheduled backup completed", level: "info" },
    ];
    
    setLogs(mockLogs);
  };

  // Helper function to get log icon based on level
  const getLogIcon = (level: Log['level']) => {
    switch(level) {
      case 'info':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-yellow-500" />;
      case 'error':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return null;
    }
  };

  // Helper function to get log row class based on level
  const getLogRowClass = (level: Log['level']) => {
    switch(level) {
      case 'info':
        return 'text-green-700 bg-green-50 dark:bg-green-950 dark:text-green-300';
      case 'warning':
        return 'text-yellow-700 bg-yellow-50 dark:bg-yellow-950 dark:text-yellow-300';
      case 'error':
        return 'text-red-700 bg-red-50 dark:bg-red-950 dark:text-red-300';
      default:
        return '';
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Server Logs</h2>
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b flex justify-between items-center">
          <div className="font-medium">Recent System Logs</div>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Info</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span>Warning</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span>Error</span>
            </div>
          </div>
        </div>
        <div className="divide-y max-h-96 overflow-y-auto">
          {logs.length > 0 ? (
            logs.map((log) => (
              <div 
                key={log.id} 
                className={`px-4 py-2 flex items-start gap-2 ${getLogRowClass(log.level)}`}
              >
                <div className="mt-1">{getLogIcon(log.level)}</div>
                <div className="flex-1">
                  <div className="font-medium">{log.message}</div>
                  <div className="text-xs opacity-70">
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-8 text-center text-gray-500">
              No logs available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}