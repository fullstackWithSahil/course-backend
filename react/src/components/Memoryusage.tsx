import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { statsType } from '@/types';

export default function Memoryusage({formattedData,stats}:{formattedData:any,stats:statsType}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Memory Usage</CardTitle>
        <CardDescription>Real-time memory utilization</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="timestamp" />
              <YAxis unit="GB" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  border: "1px solid #e2e8f0",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="memory_usage_gb"
                stroke="#82ca9d"
                strokeWidth={2}
                name="Memory Usage (GB)"
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter>
        <div className="grid grid-cols-3 w-full gap-4">
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Average</p>
              <p className="text-2xl font-bold">{stats.memory.avg} GB</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Maximum</p>
              <p className="text-2xl font-bold">{stats.memory.max} GB</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Minimum</p>
              <p className="text-2xl font-bold">{stats.memory.min} GB</p>
            </CardContent>
          </Card>
        </div>
      </CardFooter>
    </Card>
  );
}
