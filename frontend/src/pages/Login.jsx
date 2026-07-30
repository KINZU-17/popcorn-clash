import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import { api } from '../utils/backendApi';
import { GoogleLogin } from '@react-oauth/google';
import AuthBackground from '../components/AuthBackground';
import logo from '../assets/logo.png';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser, loginWithGoogle } = useGame();
  const navigate = useNavigate();

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => { navigate('/'); }, 1200);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const data = await api.auth.login({ username, password });
      localStorage.setItem('token', data.token);
      setUser({
        isAuthenticated: true,
        username: data.user.username,
        role: data.user.role,
        streak_count: data.user.prediction_streak,
        current_level: data.user.current_level,
        current_xp: data.user.total_xp,
        xp_to_next_level: 100,
        favorite_club: data.user.favorite_club,
      });
      setSuccess('Sign in successful! Welcome back.');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0a09] flex items-center justify-center relative overflow-hidden px-4">
      <AuthBackground api={api} />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0c0a09]/80 via-[#0c0a09]/60 to-[#0c0a09]/90 pointer-events-none" />
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logo} alt="PopcornClash" className="w-16 h-16 mx-auto mb-4 rounded-2xl shadow-lg" />
          <h2 className="text-2xl font-black text-white uppercase tracking-wider">Sign In</h2>
        </div>
        <div className="max-w-md mx-auto glass-panel p-8 rounded-2xl shadow-card-glow">
          {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs">{error}</div>}
          {success && <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">{success}</div>}
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Username</label>
              <input type="text" required value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-surface-container-low border border-surface-container-high focus:border-warm-gold outline-none p-3 rounded-lg text-sm text-white transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-surface-container-low border border-surface-container-high focus:border-warm-gold outline-none p-3 rounded-lg text-sm text-white transition-all" />
            </div>
            <div className="text-right">
              <Link to="/forgot-password" className="text-xs text-warm-gold hover:underline">Forgot Password?</Link>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-warm-gold to-warm-gold-light text-on-primary-container font-black rounded-lg text-sm uppercase tracking-wider shadow-md hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-surface-container-high"></div></div>
            <div className="relative bg-surface-container px-4"><span className="text-xs text-on-surface-variant font-mono uppercase tracking-wider">or</span></div>
          </div>
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              try {
                const data = await loginWithGoogle(credentialResponse.credential);
                localStorage.setItem('token', data.token);
                setUser({
                  isAuthenticated: true,
                  username: data.user.username,
                  role: data.user.role,
                  streak_count: data.user.prediction_streak,
                  current_level: data.user.current_level,
                  current_xp: data.user.total_xp,
                  xp_to_next_level: 100,
                  favorite_club: data.user.favorite_club,
                });
                navigate('/');
              } catch (err) {
                setError(err.message || 'Google sign-in failed');
              }
            }}
            onError={() => setError('Google sign-in failed')}
            useOneTap
          />
          <p className="text-center text-xs text-on-surface-variant mt-6">
            New here? <Link to="/signup" className="text-warm-gold font-bold hover:underline">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
