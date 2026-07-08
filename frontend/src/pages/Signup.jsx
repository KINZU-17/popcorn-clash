import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';

export default function Signup() {
  const [form, setForm] = useState({ username: '', email: '', password: '', favorite_club: '' });
  const { setUser } = useGame();
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    setUser({
      isAuthenticated: true,
      username: form.username,
      role: 'member',
      streak_count: 1,
      current_level: 1,
      current_xp: 60,
      xp_to_next_level: 240,
      favorite_club: form.favorite_club
    });
    navigate('/');
  };

  return (
    <div className="max-w-md mx-auto mt-6 bg-pitch-card border border-gray-800 p-8 rounded-2xl shadow-gold-glow">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-white uppercase tracking-wider">Create Account</h2>
        <p className="text-xs text-gray-500 mt-1">Set up your PopcornClash profile.</p>
      </div>
      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Username</label>
          <input type="text" required value={form.username} onChange={e => setForm({...form, username: e.target.value})} className="w-full bg-pitch-over border border-gray-800 focus:border-popcorn-gold outline-none p-2.5 rounded-lg text-sm text-white" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address</label>
          <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-pitch-over border border-gray-800 focus:border-popcorn-gold outline-none p-2.5 rounded-lg text-sm text-white" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Password</label>
          <input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full bg-pitch-over border border-gray-800 focus:border-popcorn-gold outline-none p-2.5 rounded-lg text-sm text-white" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Favorite Club (for match predictions)</label>
          <select value={form.favorite_club} onChange={e => setForm({...form, favorite_club: e.target.value})} className="w-full bg-pitch-over border border-gray-800 focus:border-popcorn-gold outline-none p-2.5 rounded-lg text-sm text-white">
            <option value="Arsenal FC">Arsenal FC</option>
            <option value="Chelsea FC">Chelsea FC</option>
            <option value="Manchester City">Manchester City</option>
            <option value="Liverpool FC">Liverpool FC</option>
          </select>
        </div>
        <button type="submit" className="w-full py-3 bg-linear-to-r from-popcorn-gold to-popcorn-glow text-pitch-dark font-black rounded-lg text-sm uppercase tracking-wider mt-4">
          Create Account
        </button>
      </form>
      <p className="text-center text-xs text-gray-400 mt-4">
        Already have an account? <Link to="/login" className="text-popcorn-gold font-bold hover:underline">Sign In</Link>
      </p>
    </div>
  );
}