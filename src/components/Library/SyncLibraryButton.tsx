
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sync } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { usePlaylistOperations } from '@/hooks/usePlaylistOperations';

export function SyncLibraryButton() {
  const [isSyncing, setIsSyncing] = React.useState(false);
  const { user } = useAuth();
  const { syncExistingPlaylistsToHistory } = usePlaylistOperations();

  const handleSyncLibrary = async () => {
    if (!user) {
      toast.error("Please sign in to sync your library");
      return;
    }

    setIsSyncing(true);
    try {
      await syncExistingPlaylistsToHistory();
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSyncLibrary}
      disabled={isSyncing || !user}
    >
      <Sync className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
      {isSyncing ? 'Syncing...' : 'Sync Library'}
    </Button>
  );
}
