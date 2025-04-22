
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";

interface PlaylistSkeletonProps {
  count?: number;
}

export function PlaylistSkeleton({ count = 1 }: PlaylistSkeletonProps) {
  return Array(count)
    .fill(0)
    .map((_, i) => (
      <Card key={i} className="overflow-hidden">
        <AspectRatio ratio={1}>
          <Skeleton className="w-full h-full" />
        </AspectRatio>
        <CardHeader className="p-4">
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        </CardContent>
      </Card>
    ));
}
