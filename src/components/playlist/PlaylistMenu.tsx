
import * as React from "react";
import { MoreVertical, Download, Copy, Save, Edit, Share } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface PlaylistMenuProps {
  onSave?: () => void;
  onCopy?: () => void;
  onDownload?: () => void;
  onRename?: () => void;
  onShare?: () => void;
  onEdit?: () => void;
}

export function PlaylistMenu({ 
  onSave, 
  onCopy, 
  onDownload, 
  onRename, 
  onShare,
  onEdit
}: PlaylistMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-10 h-10 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onSave && (
          <DropdownMenuItem onClick={onSave}>
            <Save className="mr-2 h-4 w-4" /> Save Playlist
          </DropdownMenuItem>
        )}
        {onCopy && (
          <DropdownMenuItem onClick={onCopy}>
            <Copy className="mr-2 h-4 w-4" /> Copy Playlist
          </DropdownMenuItem>
        )}
        {onDownload && (
          <DropdownMenuItem onClick={onDownload}>
            <Download className="mr-2 h-4 w-4" /> Download CSV
          </DropdownMenuItem>
        )}
        {onRename && (
          <DropdownMenuItem onClick={onRename}>
            <Edit className="mr-2 h-4 w-4" /> Rename
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" /> Edit Details
          </DropdownMenuItem>
        )}
        {onShare && (
          <DropdownMenuItem onClick={onShare}>
            <Share className="mr-2 h-4 w-4" /> Share
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
