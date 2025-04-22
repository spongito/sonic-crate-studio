
export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <div className="h-12 w-12 rounded-full border-4 border-gold border-t-transparent animate-spin"></div>
      <p className="mt-4 text-muted-foreground">Loading playlist...</p>
    </div>
  );
}
