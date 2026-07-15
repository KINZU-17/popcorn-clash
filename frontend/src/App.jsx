import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import CineMatch from './pages/CineMatch';
import { ProtectedRoute } from './components/ProtectedRoute';
import { GameStateProvider } from './context/GameStateContext'; 
import MoviePlayer from './components/MoviePlayer'; // Import your streaming player

export default function App() {
  const GOOGLE_CLIENT_ID = "707340882974-lc2sfbr2f886fhv9n52t4h48e921c75m.apps.googleusercontent.com";
  
  // State to track if a stream overlay is active across the app
  const [activePlayingMovie, setActivePlayingMovie] = useState(null);

  const handleProgressUpdate = (id, progress, status) => {
    console.log(`Movie ID: ${id} progress updated to ${progress}% | Status: ${status}`);
    // If you add a library backend context sync later, handle it here!
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <GameStateProvider>
        <Router>
          {/* 
            We pass setActivePlayingMovie as a global down to CineMatch.
            Inside CineMatch, you can pass it right down to DiscoverView!
          */}
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<CineMatch onPlayMovie={setActivePlayingMovie} />} />
              <Route path="/movies" element={<CineMatch onPlayMovie={setActivePlayingMovie} />} />
              <Route path="/leaderboard" element={<CineMatch onPlayMovie={setActivePlayingMovie} />} />
              <Route path="/analytics" element={<CineMatch onPlayMovie={setActivePlayingMovie} />} />
              <Route path="/profile" element={<CineMatch onPlayMovie={setActivePlayingMovie} />} />
              <Route path="/match/:id" element={<CineMatch onPlayMovie={setActivePlayingMovie} />} />
              <Route path="/fixtures/create" element={<CineMatch onPlayMovie={setActivePlayingMovie} />} />
            </Route>
            
            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>

        {/* CINEMATIC OVERLAY LAYER */}
        {activePlayingMovie && (
          <MoviePlayer 
            movie={activePlayingMovie} 
            onClose={() => setActivePlayingMovie(null)} 
            onProgressUpdate={handleProgressUpdate}
          />
        )}
      </GameStateProvider>
    </GoogleOAuthProvider>
  );
}