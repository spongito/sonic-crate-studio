
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, LibraryBig } from "lucide-react";

interface ErrorStateProps {
  error: Error;
  onRetry: () => void;
  onSync: () => void;
}

export function ErrorState({ error, onRetry, onSync }: ErrorStateProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="p-8 text-center max-w-2xl mx-auto">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
        </div>
        <h2 className="text-2xl font-semibold mb-2">Error Loading Library</h2>
        <p className="text-muted-foreground mb-6">
          There was an error loading your music library: {error.message}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={onRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry Loading
          </Button>
          <Button variant="outline" onClick={onSync}>
            <LibraryBig className="mr-2 h-4 w-4" />
            Sync Library Manually
          </Button>
        </div>
      </Card>
    </div>
  );
}
