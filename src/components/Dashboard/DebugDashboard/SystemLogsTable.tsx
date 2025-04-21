
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchQuery } from "./types";
import { SystemLogItem } from "./SystemLogItem";

export function SystemLogsTable() {
  const [queries, setQueries] = useState<SearchQuery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('search_queries')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);
      if (!error) setQueries(data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array(5).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {queries.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No logs found</div>
      ) : (
        <div className="space-y-4">
          {queries.map((query) => (
            <SystemLogItem query={query} key={query.id} />
          ))}
        </div>
      )}
    </div>
  );
}
