import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import { GoogleLogin } from '@react-oauth/google';
import { Eye, EyeOff } from 'lucide-react';

// Keeping the backdrop posters identical to your signup screen for UI continuity
const MOVIE_POSTERS = [
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1542204172-e7052809a86e?w=400&auto=format&fit=crop&q=60',
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // State to track password visibility
  const [showPassword, setShowPassword] = useState(false);
  
  const { setUser, loginWithGoogle } = useGame();
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
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-pitch-dark py-12 px-4">
      
      {/* --- Infinite Sliding Movie Poster Background --- */}
      <div className="absolute inset-0 z-0 opacity-15 pointer-events-none select-none flex items-center">
        <div className="animate-movie-slide gap-4 flex-nowrap">
          {/* Re-using the identical looped array for the layout styling */}
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

      {/* --- Sign In Card Container --- */}
      <div className="relative z-10 max-w-md w-full bg-pitch-card border border-gray-800 p-8 rounded-2xl shadow-gold-glow backdrop-blur-xs">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-white uppercase tracking-wider mt-2">Sign In</h2>
          <p className="text-xs text-gray-500 mt-1">Welcome back to PopcornClash.</p>
        </div>

        {/* Traditional Form Login */}
        <form onSubmit={handleLoginSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-pitch-over border border-gray-800 focus:border-popcorn-gold outline-none p-3 rounded-lg text-sm text-white transition-all" />
          </div>
          
          {/* Password Input with Visibility Toggle */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Password</label>
            <div className="relative flex items-center">
              <input 
                type={showPassword ? 'text' : 'password'} 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full bg-pitch-over border border-gray-800 focus:border-popcorn-gold outline-none p-3 pr-10 rounded-lg text-sm text-white transition-all" 
              />
              <button
                type="button" // Important! Keeps click from submitting the form
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-gray-400 hover:text-white transition-colors cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="text-right">
            <Link to="/forgot-password" className="text-xs text-popcorn-gold hover:underline">Forgot Password?</Link>
          </div>
          <button type="submit" className="w-full py-3 bg-linear-to-r from-popcorn-gold to-popcorn-glow text-pitch-dark font-black rounded-lg text-sm uppercase tracking-wider shadow-md hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer">
            Sign In
          </button>
        </form>

        {/* Structural Layout Context Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-800"></div>
          <span className="px-3 text-xs text-gray-500 uppercase font-bold tracking-widest">or</span>
          <div className="flex-1 border-t border-gray-800"></div>
        </div>

        {/* --- Google Sign In Button Block --- */}
        <div className="flex justify-center w-full">
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              loginWithGoogle(credentialResponse);
              navigate('/');
            }}
            onError={() => {
              console.error('Google Sign In Failed');
            }}
            text="signin_with" // Sets configuration button text layout to "Sign in with Google"
            theme="filled_dark"
            shape="pill"
            width="100%"
          />
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          New here? <Link to="/signup" className="text-popcorn-gold font-bold hover:underline">Create Account</Link>
        </p>
      </div>
    </div>
  );
}