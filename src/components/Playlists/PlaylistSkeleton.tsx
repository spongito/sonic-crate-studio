
import React from 'react';

interface PlaylistSkeletonProps {
  count?: number;
}

export const PlaylistSkeleton = ({ count = 3 }: PlaylistSkeletonProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse bg-gray-700 rounded-md h-16 mb-4"
          aria-label="Loading playlist skeleton"
        />
      ))}
    </>
  );
};
