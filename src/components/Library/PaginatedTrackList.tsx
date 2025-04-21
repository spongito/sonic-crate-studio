
import React, { useState } from 'react';
import { Track } from '@/types/table';
import { GeneratedPlaylistTable } from '@/components/GeneratedPlaylistTable';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { useLogger } from '@/hooks/useLogger';

interface PaginatedTrackListProps {
  tracks: Track[];
  pageSize?: number;
  onLikeToggle: (trackId: string, liked: boolean) => void;
  showControls?: boolean;
}

export function PaginatedTrackList({
  tracks,
  pageSize = 10,
  onLikeToggle,
  showControls = false,
}: PaginatedTrackListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const logger = useLogger('PaginatedTrackList');
  
  // Calculate total number of pages
  const totalPages = Math.max(1, Math.ceil(tracks.length / pageSize));
  
  // Calculate start and end indices
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, tracks.length);
  
  // Get current page tracks
  const currentTracks = tracks.slice(startIndex, endIndex);
  
  logger.debug(`Showing tracks ${startIndex + 1}-${endIndex} of ${tracks.length} (Page ${currentPage}/${totalPages})`);
  
  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    logger.debug(`Changing to page ${page}`);
    setCurrentPage(page);
  };
  
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // If we have fewer pages than our max, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first and last page
      pages.push(1);
      
      // Add pages around current page
      const leftSide = Math.max(2, currentPage - 1);
      const rightSide = Math.min(totalPages - 1, currentPage + 1);
      
      // If current page is not near start, add ellipsis
      if (leftSide > 2) {
        pages.push(-1); // -1 represents ellipsis
      }
      
      // Add pages around current
      for (let i = leftSide; i <= rightSide; i++) {
        pages.push(i);
      }
      
      // If current page is not near end, add ellipsis
      if (rightSide < totalPages - 1) {
        pages.push(-2); // -2 represents ellipsis
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="space-y-4">
      <GeneratedPlaylistTable
        tracks={currentTracks}
        showControls={showControls}
        fullWidth={true}
        onLikeChange={onLikeToggle}
      />
      
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => handlePageChange(currentPage - 1)}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {getPageNumbers().map((page, index) => (
              <PaginationItem key={index}>
                {page < 0 ? (
                  <span className="px-2.5">...</span>
                ) : (
                  <PaginationLink 
                    isActive={currentPage === page}
                    onClick={() => handlePageChange(page)}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => handlePageChange(currentPage + 1)}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
      
      <div className="text-xs text-muted-foreground text-center">
        Showing {startIndex + 1}-{endIndex} of {tracks.length} tracks
      </div>
    </div>
  );
}
