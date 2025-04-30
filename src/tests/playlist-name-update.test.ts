
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from "@/integrations/supabase/client";

// Mock the Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn()
  }
}));

// Mock the toast functions
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('Playlist name update', () => {
  const testPlaylist = {
    id: 'test-playlist-id',
    name: 'Original Playlist Name',
    user_id: 'test-user-id',
    created_at: new Date().toISOString()
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful response
    (supabase.from as any).mockReturnThis();
    (supabase.update as any).mockReturnThis();
    (supabase.eq as any).mockReturnThis();
    (supabase.single as any).mockResolvedValue({ 
      data: testPlaylist, 
      error: null 
    });
  });

  it('should update playlist name successfully', async () => {
    // Mock the update function specifically for this test
    (supabase.eq as any).mockResolvedValueOnce({ 
      data: { ...testPlaylist, name: 'New Playlist Name' }, 
      error: null 
    });
    
    // Create an update function similar to what we'd use in components
    const updatePlaylistName = async (playlistId: string, newName: string) => {
      const { error } = await supabase
        .from('playlists')
        .update({ name: newName })
        .eq('id', playlistId);
        
      return !error;
    };
    
    const result = await updatePlaylistName('test-playlist-id', 'New Playlist Name');
    
    expect(result).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith('playlists');
    expect(supabase.update).toHaveBeenCalledWith({ name: 'New Playlist Name' });
    expect(supabase.eq).toHaveBeenCalledWith('id', 'test-playlist-id');
  });

  it('should handle errors when updating playlist name', async () => {
    // Mock error response
    (supabase.eq as any).mockResolvedValueOnce({ 
      data: null, 
      error: { message: 'Error updating playlist' }
    });
    
    const updatePlaylistName = async (playlistId: string, newName: string) => {
      const { error } = await supabase
        .from('playlists')
        .update({ name: newName })
        .eq('id', playlistId);
        
      return !error;
    };
    
    const result = await updatePlaylistName('test-playlist-id', 'New Playlist Name');
    
    expect(result).toBe(false);
    expect(supabase.from).toHaveBeenCalledWith('playlists');
    expect(supabase.update).toHaveBeenCalledWith({ name: 'New Playlist Name' });
    expect(supabase.eq).toHaveBeenCalledWith('id', 'test-playlist-id');
  });
});
