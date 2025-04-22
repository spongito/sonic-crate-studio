
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { useLogger } from "@/hooks/useLogger";

interface ErrorFallbackProps {
  error?: Error;
  queryKey?: string[];
  children?: React.ReactNode;
}

export function ErrorFallback({ error, queryKey, children }: ErrorFallbackProps) {
  const queryClient = useQueryClient();
  const logger = useLogger("ErrorFallback");
  
  const handleRetry = () => {
    if (queryKey) {
      logger.info(`Retrying query with key: ${queryKey.join(', ')}`);
      queryClient.invalidateQueries({ queryKey });
    }
  };
  
  // Format error message for display
  const errorMessage = error?.message || 'An unknown error occurred';
  const isTimeout = errorMessage.includes('TIMEOUT');
  const isPgrstPlanError = errorMessage.includes('application/vnd.pgrst.plan+text');
  
  // Get a user-friendly error message
  const getUserFriendlyMessage = () => {
    if (isTimeout) {
      return 'The request took too long to complete. This may be due to a slow connection or high server load.';
    }
    
    if (isPgrstPlanError) {
      return 'There was an issue with the database query format. Our team has been notified.';
    }
    
    return errorMessage;
  };
  
  return (
    <div className="w-full py-8 space-y-4">
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertTitle className="text-lg font-semibold">
          {isTimeout ? 'Request Timeout' : 'Error Loading Data'}
        </AlertTitle>
        <AlertDescription className="mt-2 space-y-4">
          <p>{getUserFriendlyMessage()}</p>
          
          <div className="flex gap-4 pt-2">
            <Button onClick={handleRetry} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            
            {children}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
