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


export default function CPUusage({formattedData,stats}:{formattedData:any,stats:statsType}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>CPU Usage</CardTitle>
        <CardDescription>Real-time CPU utilization</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="timestamp" />
              <YAxis unit="%" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  border: "1px solid #e2e8f0",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="cpu_usage"
                stroke="#8884d8"
                strokeWidth={2}
                name="CPU Usage (%)"
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
              <p className="text-2xl font-bold">{stats.cpu.avg}%</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Maximum</p>
              <p className="text-2xl font-bold">{stats.cpu.max}%</p>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Minimum</p>
              <p className="text-2xl font-bold">{stats.cpu.min}%</p>
            </CardContent>
          </Card>
        </div>
      </CardFooter>
    </Card>
  );
}
