
import { Navigate, Outlet } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';

export const ProtectedRoute = () => {
  const { user } = useGame();
  return user.isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
