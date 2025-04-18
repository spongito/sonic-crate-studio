
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  className?: string;
  children: React.ReactNode;
}

export function StatCard({ title, className, children }: StatCardProps) {
  return (
    <Card className={cn("neo-card h-full flex flex-col", className)}>
      <CardHeader className="pb-2 flex-none">
        <CardTitle className="text-lg font-medium text-white/80">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">{children}</CardContent>
    </Card>
  );
}
