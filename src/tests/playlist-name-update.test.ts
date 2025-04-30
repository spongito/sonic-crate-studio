
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from "@/integrations/supabase/client";

// Mock the Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn()
          }))
        }))
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
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
    const mockedFrom = supabase.from as unknown as ReturnType<typeof vi.fn>;
    mockedFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ 
              data: testPlaylist, 
              error: null 
            })
          })
        })
      }),
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ 
            data: testPlaylist, 
            error: null 
          })
        })
      })
    });
  });

  it('should update playlist name successfully', async () => {
    // Mock the update function specifically for this test
    const mockedFrom = supabase.from as unknown as ReturnType<typeof vi.fn>;
    mockedFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ 
              data: { ...testPlaylist, name: 'New Playlist Name' }, 
              error: null 
            })
          })
        })
      })
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
  });

  it('should handle errors when updating playlist name', async () => {
    // Mock error response
    const mockedFrom = supabase.from as unknown as ReturnType<typeof vi.fn>;
    mockedFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ 
              data: null, 
              error: { message: 'Error updating playlist' }
            })
          })
        })
      })
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
  });
});
