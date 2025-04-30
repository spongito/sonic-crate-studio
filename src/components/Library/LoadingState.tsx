
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading your library..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
      <h3 className="text-xl font-medium text-center">{message}</h3>
      <p className="text-muted-foreground text-center mt-2">
        This may take a moment depending on the size of your collection.
      </p>
    </div>
  );
}
