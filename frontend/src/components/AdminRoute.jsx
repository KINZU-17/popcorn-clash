import { Navigate, Outlet } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';

export const AdminRoute = () => {
  const { user } = useGame();
  if (!user.isAuthenticated) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return <Outlet />;
};
