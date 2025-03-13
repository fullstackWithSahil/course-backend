import { useState, useEffect } from 'react';
import { Clock, RefreshCw, Server} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import CPUusage from './components/CPUusage';
import Memoryusage from './components/Memoryusage';
import Logs from './components/Logs';
import { responseTypes } from './types';

export default function App() {
  const [metricsData, setMetricsData] = useState([]);
  const [timeRange, setTimeRange] = useState('1hr');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/metrics/data?range=${timeRange}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setMetricsData(data);
      setLastUpdated(new Date().toLocaleTimeString());
      setError("");
    } catch (err) {
      setError('Error fetching metrics data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Format data for charts
  const formatData = (data:any) => {
    return data.map((item:any) => ({
      ...item,
      timestamp: new Date(item.timestamp).toLocaleTimeString(),
    }));
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
    // Set up interval for periodic updates
    const intervalId = setInterval(fetchData, 60000); // Refresh every minute
    
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [timeRange]);

  // Calculate statistics
  const calculateStats = () => {
    if (!metricsData.length) return { cpu: {}, memory: {} };
    
    const cpuValues = metricsData.map((item:responseTypes) => item.cpu_usage);
    const memValues = metricsData.map((item:responseTypes) => item.memory_usage_gb);
    
    return {
      cpu: {
        avg: (cpuValues.reduce((sum, val) => sum + val, 0) / cpuValues.length).toFixed(2),
        max: Math.max(...cpuValues).toFixed(2),
        min: Math.min(...cpuValues).toFixed(2),
      },
      memory: {
        avg: (memValues.reduce((sum, val) => sum + val, 0) / memValues.length).toFixed(2),
        max: Math.max(...memValues).toFixed(2),
        min: Math.min(...memValues).toFixed(2),
      }
    };
  };

  const stats = calculateStats();
  const formattedData = formatData(metricsData);

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Server className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Server Health Dashboard</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock size={16} />
            <span className="text-sm">Last updated: {lastUpdated}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData} className="gap-2">
            <RefreshCw size={16} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue={timeRange} onValueChange={setTimeRange} className="mb-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="1hr">Last Hour</TabsTrigger>
          <TabsTrigger value="24hr">Last Day</TabsTrigger>
          <TabsTrigger value="3d">Last 3 Days</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {loading && metricsData.length === 0 ? (
        <div className="flex justify-center items-center p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading metrics data...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <CPUusage formattedData={formattedData} stats={stats}/>
          <Memoryusage formattedData={formattedData} stats={stats}/>
        </div>
      )}
      
      {/* Server Logs Section */}
      <Logs/>
    </main>
  );
}