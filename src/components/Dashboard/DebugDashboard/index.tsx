import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { SearchQueryTable } from "./SearchQueryTable";
import { SystemLogsTable } from "./SystemLogsTable";

export function DebugDashboard() {
  const [activeTab, setActiveTab] = useState("search-queries");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Developer Dashboard</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="search-queries">Search Queries</TabsTrigger>
          <TabsTrigger value="system-logs">System Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="search-queries">
          <Card>
            <CardContent className="pt-6">
              <SearchQueryTable />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="system-logs">
          <Card>
            <CardContent className="pt-6">
              <SystemLogsTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
