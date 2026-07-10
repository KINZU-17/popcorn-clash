import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import CineMatch from './pages/CineMatch';
import { ProtectedRoute } from './components/ProtectedRoute';
import { GameStateProvider } from './context/GameStateContext'; 

export default function App() {
  return (
    // 2. Wrap the entire app structure inside the provider
    <GameStateProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<CineMatch />} />
            <Route path="/movies" element={<CineMatch />} />
            <Route path="/leaderboard" element={<CineMatch />} />
            <Route path="/analytics" element={<CineMatch />} />
            <Route path="/profile" element={<CineMatch />} />
            <Route path="/match/:id" element={<CineMatch />} />
            <Route path="/fixtures/create" element={<CineMatch />} />
          </Route>
          
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </GameStateProvider>
  );
}