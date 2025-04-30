
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImageUploader } from '../components/ui/ImageUploader';
import { toast } from 'sonner';

// Mock the toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  }
}));

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    storage: {
      from: () => ({
        upload: vi.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://test-url.com/image.jpg' } })
      })
    }
  }
}));

// Mock the auth context
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' }
  })
}));

describe('ImageUploader', () => {
  const mockOnImageUploaded = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock URL.createObjectURL and URL.revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => 'mock-url');
    global.URL.revokeObjectURL = vi.fn();
    
    // Mock Image
    global.Image = class {
      onload: () => void = () => {};
      onerror: () => void = () => {};
      src: string = '';
      width: number = 100;
      height: number = 100;
      
      constructor() {
        setTimeout(() => {
          this.onload();
        }, 0);
      }
    } as any;
  });
  
  it('should show an error for oversized files', async () => {
    render(
      <ImageUploader 
        onImageUploaded={mockOnImageUploaded} 
        maxSizeMB={1}
      />
    );
    
    const uploadButton = screen.getByText('Upload');
    fireEvent.click(uploadButton);
    
    // Create a file object with size over the limit
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    Object.defineProperty(file, 'size', { value: 2 * 1024 * 1024 }); // 2MB
    
    // Get the hidden file input and simulate a file selection
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Check that the error toast was called
    expect(toast.error).toHaveBeenCalledWith('File size must be less than 1MB');
    expect(mockOnImageUploaded).not.toHaveBeenCalled();
  });
  
  it('should show an error for non-square images', async () => {
    // Override the Image mock for this test
    global.Image = class {
      onload: () => void = () => {};
      onerror: () => void = () => {};
      src: string = '';
      width: number = 100;
      height: number = 200; // Different from width
      
      constructor() {
        setTimeout(() => {
          this.onload();
        }, 0);
      }
    } as any;
    
    render(
      <ImageUploader 
        onImageUploaded={mockOnImageUploaded} 
      />
    );
    
    const uploadButton = screen.getByText('Upload');
    fireEvent.click(uploadButton);
    
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    Object.defineProperty(file, 'size', { value: 1 * 1024 * 1024 }); // 1MB
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Check that the error toast was called
    expect(toast.error).toHaveBeenCalledWith('Image must be square (width equals height)');
    expect(mockOnImageUploaded).not.toHaveBeenCalled();
  });
  
  it('should show an error for invalid file types', async () => {
    render(
      <ImageUploader 
        onImageUploaded={mockOnImageUploaded} 
      />
    );
    
    const uploadButton = screen.getByText('Upload');
    fireEvent.click(uploadButton);
    
    const file = new File([''], 'test.txt', { type: 'text/plain' });
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Check that the error toast was called
    expect(toast.error).toHaveBeenCalledWith('Only JPG, PNG, or GIF files are allowed');
    expect(mockOnImageUploaded).not.toHaveBeenCalled();
  });
  
  it('should successfully upload a valid image', async () => {
    render(
      <ImageUploader 
        onImageUploaded={mockOnImageUploaded} 
      />
    );
    
    const uploadButton = screen.getByText('Upload');
    fireEvent.click(uploadButton);
    
    const file = new File([''], 'valid.jpg', { type: 'image/jpeg' });
    Object.defineProperty(file, 'size', { value: 1 * 1024 * 1024 }); // 1MB
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Wait for the async operations to complete
    await vi.waitFor(() => {
      expect(mockOnImageUploaded).toHaveBeenCalledWith('https://test-url.com/image.jpg');
    });
  });
});
