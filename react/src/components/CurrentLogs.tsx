import { useState, useEffect } from "react";

// Define proper TypeScript interfaces
interface Log {
  id: number;
  timestamp: string;
  message: string;
}

export default function CurrentLogs() {
  const [logs, setLogs] = useState<Log[]>([]);

  // Use useEffect for data fetching to prevent infinite loops
  useEffect(() => {
    fetchLogs();
  }, []); // Empty dependency array means this runs once on mount

  const fetchLogs = () => {
    // Mock logs data with different severity levels
    const mockLogs: Log[] = [
      { id: 1, timestamp: new Date().toISOString(), message: "Server started successfully"},
      { id: 2, timestamp: new Date(Date.now() - 120000).toISOString(), message: "Database connection established" },
      { id: 3, timestamp: new Date(Date.now() - 180000).toISOString(), message: "High CPU usage detected (82%)"},
      { id: 4, timestamp: new Date(Date.now() - 240000).toISOString(), message: "Failed to connect to cache server"},
      { id: 5, timestamp: new Date(Date.now() - 300000).toISOString(), message: "User authentication successful"},
      { id: 6, timestamp: new Date(Date.now() - 360000).toISOString(), message: "Low memory warning (85% used)"},
      { id: 7, timestamp: new Date(Date.now() - 420000).toISOString(), message: "File system check completed"},
      { id: 8, timestamp: new Date(Date.now() - 480000).toISOString(), message: "API rate limit approaching"},
      { id: 9, timestamp: new Date(Date.now() - 540000).toISOString(), message: "Database query timeout"},
      { id: 10, timestamp: new Date(Date.now() - 600000).toISOString(), message: "Scheduled backup completed"},
    ];
    
    setLogs(mockLogs);
  };


  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Current Logs</h2>
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b flex justify-between items-center">
          <div className="font-medium">Recent System Logs</div>
        </div>
        <div className="divide-y max-h-96 overflow-y-auto">
          {logs.length > 0 ? (
            logs.map((log) => (
              <div 
                key={log.id} 
                className={`px-4 py-2 flex items-start gap-2 text-yellow-700 bg-yellow-50 dark:bg-yellow-950 dark:text-yellow-300`}
              >
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