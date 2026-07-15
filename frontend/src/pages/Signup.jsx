import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import { GoogleLogin } from '@react-oauth/google';
import { Eye, EyeOff } from 'lucide-react';

// Sample movie poster backdrop grid URLs (Replace these with your favorites!)
const MOVIE_POSTERS = [
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1542204172-e7052809a86e?w=400&auto=format&fit=crop&q=60',
];

export default function Signup() {
  const [form, setForm] = useState({ username: '', email: '', password: '', favorite_club: 'Arsenal FC' });
  // State to track password visibility
  const [showPassword, setShowPassword] = useState(false);
  
  const { setUser, loginWithGoogle } = useGame();
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
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-pitch-dark py-12 px-4">
      
      {/* --- Infinite Sliding Movie Poster Background --- */}
      <div className="absolute inset-0 z-0 opacity-15 pointer-events-none select-none flex items-center">
        <div className="animate-movie-slide gap-4 flex-nowrap">
          {/* Render array twice to create a seamless infinite loop visual effect */}
          {[...MOVIE_POSTERS, ...MOVIE_POSTERS, ...MOVIE_POSTERS].map((src, idx) => (
            <img 
              key={idx} 
              src={src} 
              alt="Movie Poster Backdrop Item" 
              className="h-64 w-44 object-cover rounded-xl shadow-lg transform -rotate-6"
            />
          ))}
        </div>
      </div>

      {/* --- Sign Up Card Container --- */}
      <div className="relative z-10 max-w-md w-full bg-pitch-card border border-gray-800 p-8 rounded-2xl shadow-gold-glow backdrop-blur-xs">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-white uppercase tracking-wider">Create Account</h2>
          <p className="text-xs text-gray-500 mt-1">Set up your PopcornClash profile.</p>
        </div>

        {/* Traditional Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Username</label>
            <input type="text" required value={form.username} onChange={e => setForm({...form, username: e.target.value})} className="w-full bg-pitch-over border border-gray-800 focus:border-popcorn-gold outline-none p-2.5 rounded-lg text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address</label>
            <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-pitch-over border border-gray-800 focus:border-popcorn-gold outline-none p-2.5 rounded-lg text-sm text-white" />
          </div>
          
          {/* Password Input Area */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Password</label>
            <div className="relative flex items-center">
              <input 
                type={showPassword ? 'text' : 'password'} 
                required 
                value={form.password} 
                onChange={e => setForm({...form, password: e.target.value})} 
                className="w-full bg-pitch-over border border-gray-800 focus:border-popcorn-gold outline-none p-2.5 pr-10 rounded-lg text-sm text-white" 
              />
              <button
                type="button" // Critical! This stops the form from submitting on click
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-gray-400 hover:text-white transition-colors cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
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
          <button type="submit" className="w-full py-3 bg-linear-to-r from-popcorn-gold to-popcorn-glow text-pitch-dark font-black rounded-lg text-sm uppercase tracking-wider mt-4 cursor-pointer hover:brightness-110 progression-all duration-200">
            Create Account
          </button>
        </form>

        {/* Structural Context Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-800"></div>
          <span className="px-3 text-xs text-gray-500 uppercase font-bold tracking-widest">or</span>
          <div className="flex-1 border-t border-gray-800"></div>
        </div>

        {/* --- Google Sign Up Block --- */}
        <div className="flex justify-center w-full">
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              loginWithGoogle(credentialResponse);
              navigate('/');
            }}
            onError={() => {
              console.error('Google Auth Failed');
            }}
            text="signup_with"
            theme="filled_dark"
            shape="pill"
            width="100%"
          />
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Already have an account? <Link to="/login" className="text-popcorn-gold font-bold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}