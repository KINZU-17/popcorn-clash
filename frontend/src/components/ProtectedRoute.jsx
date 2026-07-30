
import { Navigate, Outlet } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';

export const ProtectedRoute = () => {
  const gameContext = useGame();
  const { user } = gameContext || {};
  return user?.isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};