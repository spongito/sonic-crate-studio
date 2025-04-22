
export function LoadingState() {
  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="w-full flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your tracks...</p>
        </div>
      </div>
    </div>
  );
}
