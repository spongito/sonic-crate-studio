
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProtectedRoute from "@/components/ProtectedRoute";
import Debug from './pages/Debug';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import MusicFinder from './pages/MusicFinder';
import CurationAssistant from './pages/CurationAssistant';
import Playlists from './pages/Playlists';
import PlaylistDetail from './pages/PlaylistDetail';
import Export from './pages/Export';
import Community from './pages/Community';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Library from './pages/Library';
import { TracksProvider } from "@/context/TracksContext";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <TracksProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/library" element={
                <ProtectedRoute>
                  <Library />
                </ProtectedRoute>
              } />
              <Route path="/music-finder" element={
                <ProtectedRoute>
                  <MusicFinder />
                </ProtectedRoute>
              } />
              <Route path="/curation-assistant" element={
                <ProtectedRoute>
                  <CurationAssistant />
                </ProtectedRoute>
              } />
              <Route path="/playlists" element={
                <ProtectedRoute>
                  <Playlists />
                </ProtectedRoute>
              } />
              <Route path="/playlists/:id" element={
                <ProtectedRoute>
                  <PlaylistDetail />
                </ProtectedRoute>
              } />
              <Route path="/export" element={
                <ProtectedRoute>
                  <Export />
                </ProtectedRoute>
              } />
              <Route path="/community" element={
                <ProtectedRoute>
                  <Community />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/debug" element={
                <ProtectedRoute>
                  <Debug />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TracksProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
