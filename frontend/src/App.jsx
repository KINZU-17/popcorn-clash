import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import CineMatch from './pages/CineMatch';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<CineMatch />} />
          <Route path="/movies" element={<CineMatch />} />
          <Route path="/leaderboard" element={<CineMatch />} />
          <Route path="/analytics" element={<CineMatch />} />
          <Route path="/profile" element={<CineMatch />} />
          <Route path="/match/:id" element={<CineMatch />} />
          <Route path="/fixtures/create" element={<CineMatch />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
