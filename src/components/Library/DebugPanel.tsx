
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTracks } from "@/context/TracksContext";
import { LoggingService, LogLevel } from "@/services/LoggingService";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DebugPanelProps {
  userId?: string;
  filters: any;
  activeTab: string;
}

export function DebugPanel({ userId, filters, activeTab }: DebugPanelProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const { allTracks, recentTracks, likedTracks } = useTracks();
  const [activeLogTab, setActiveLogTab] = useState<string>("system");
  
  useEffect(() => {
    // Subscribe to log updates
    const unsubscribe = LoggingService.getInstance().subscribe(updatedLogs => {
      setLogs(updatedLogs);
    });
    
    return () => unsubscribe();
  }, []);
  
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Debug Information</span>
          <Tabs value={activeLogTab} onValueChange={setActiveLogTab} className="w-[400px]">
            <TabsList>
              <TabsTrigger value="system">System</TabsTrigger>
              <TabsTrigger value="tracks">Tracks</TabsTrigger>
              <TabsTrigger value="filters">Filters</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="text-xs font-mono overflow-auto max-h-[300px]">
        <TabsContent value="system">
          <div>
            <strong>User ID:</strong> {userId || 'Not logged in'}
          </div>
          <div>
            <strong>Active Tab:</strong> {activeTab}
          </div>
          <div>
            <strong>Application Time:</strong> {new Date().toLocaleString()}
          </div>
        </TabsContent>
        
        <TabsContent value="tracks">
          <div>
            <strong>All Tracks Loaded:</strong> {allTracks.length}
          </div>
          <div>
            <strong>Recent Tracks:</strong> {recentTracks.length}
          </div>
          <div>
            <strong>Liked Tracks:</strong> {likedTracks.length}
          </div>
          <div className="mt-2">
            <strong>Sample Tracks:</strong>
            <pre className="mt-1 p-2 bg-muted/30 rounded overflow-auto max-h-[150px]">
              {JSON.stringify(allTracks.slice(0, 2), null, 2)}
            </pre>
          </div>
        </TabsContent>
        
        <TabsContent value="filters">
          <div>
            <strong>Filter State:</strong>
            <pre className="mt-1 p-2 bg-muted/30 rounded overflow-auto">
              {JSON.stringify(filters, null, 2)}
            </pre>
          </div>
        </TabsContent>
        
        <TabsContent value="logs">
          <div className="space-y-1 max-h-[200px] overflow-y-auto p-2 bg-muted/30 rounded">
            {logs.slice(0, 50).map((log, idx) => (
              <div 
                key={idx} 
                className={`
                  ${log.level === LogLevel.ERROR ? 'text-red-500' : ''}
                  ${log.level === LogLevel.WARNING ? 'text-amber-500' : ''}
                  ${log.level === LogLevel.INFO ? 'text-blue-500' : ''}
                  ${log.level === LogLevel.SUCCESS ? 'text-green-500' : ''}
                  ${log.level === LogLevel.DEBUG ? 'text-gray-500' : ''}
                `}
              >
                [{log.timestamp.toLocaleTimeString()}] [{LogLevel[log.level]}] [{log.module}] {log.message}
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-muted-foreground">No logs recorded yet</div>
            )}
          </div>
        </TabsContent>
      </CardContent>
    </Card>
  );
}
