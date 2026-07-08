import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useGame();
  const navigate = useNavigate();

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setUser({
      isAuthenticated: true,
      username: email.split('@')[0],
      role: 'member',
      streak_count: 1,
      current_level: 2,
      current_xp: 175,
      xp_to_next_level: 325,
      favorite_club: 'Arsenal FC'
    });
    navigate('/');
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-pitch-card border border-gray-800 p-8 rounded-2xl shadow-gold-glow">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-white uppercase tracking-wider mt-2">Sign In</h2>
      </div>
      <form onSubmit={handleLoginSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-pitch-over border border-gray-800 focus:border-popcorn-gold outline-none p-3 rounded-lg text-sm text-white transition-all" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Password</label>
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-pitch-over border border-gray-800 focus:border-popcorn-gold outline-none p-3 rounded-lg text-sm text-white transition-all" />
        </div>
        <div className="text-right">
          <Link to="/forgot-password" className="text-xs text-popcorn-gold hover:underline">Forgot Password?</Link>
        </div>
        <button type="submit" className="w-full py-3 bg-linear-to-r from-popcorn-gold to-popcorn-glow text-pitch-dark font-black rounded-lg text-sm uppercase tracking-wider shadow-md hover:opacity-90 active:scale-[0.99] transition-all">
          Sign In
        </button>
      </form>
      <p className="text-center text-xs text-gray-400 mt-6">
        New here? <Link to="/signup" className="text-popcorn-gold font-bold hover:underline">Create Account</Link>
      </p>
    </div>
  );
}