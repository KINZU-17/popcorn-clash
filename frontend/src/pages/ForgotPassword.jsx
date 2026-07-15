import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const MOVIE_POSTERS = [
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1542204172-e7052809a86e?w=400&auto=format&fit=crop&q=60',
];

export default function ForgotPassword() {
  // Navigation states
  const [step, setStep] = useState(1); // step 1: Request code, step 2: Verify & Reset
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // Simulated verification tracking
  const [generatedCode, setGeneratedCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();

  // --- STEP 1: Request Code ---
  const handleRequestCode = (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Simulate creating a random 6-digit code
    const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(mockCode);
    
    // Alert the code to the screen since we don't have a backend mailer
    alert(`[MOCK EMAIL SENT TO ${email}]: Your PopcornClash verification code is: ${mockCode}`);
    
    setSuccessMessage(`A 6-digit verification code was sent to ${email}`);
    setStep(2); // Move to verification step
  };

  // --- STEP 2: Verify Code and Update Password ---
  const handleVerifyAndReset = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (verificationCode !== generatedCode) {
      setErrorMessage('Invalid verification code. Please try again.');
      return;
    }

    // Success simulation
    alert('Password updated successfully!');
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-pitch-dark py-12 px-4">
      
      {/* Infinite Sliding Movie Poster Background */}
      <div className="absolute inset-0 z-0 opacity-15 pointer-events-none select-none flex items-center">
        <div className="animate-movie-slide gap-4 flex-nowrap">
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

      {/* Main Container Card */}
      <div className="relative z-10 max-w-md w-full bg-pitch-card border border-gray-800 p-8 rounded-2xl shadow-gold-glow backdrop-blur-xs">
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-white uppercase tracking-wider mt-2">Reset Password</h2>
          <p className="text-xs text-gray-500 mt-1">
            {step === 1 ? "Get a verification code sent to your email." : "Enter your verification details below."}
          </p>
        </div>

        {/* Global Feedback Notifications */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-950/50 border border-red-800 rounded-lg text-xs font-semibold text-red-400">
            {errorMessage}
          </div>
        )}
        {successMessage && step === 2 && (
          <div className="mb-4 p-3 bg-emerald-950/50 border border-emerald-800 rounded-lg text-xs font-semibold text-emerald-400">
            {successMessage}
          </div>
        )}

        {/* --- FORM STEP 1: Enter Email --- */}
        {step === 1 && (
          <form onSubmit={handleRequestCode} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full bg-pitch-over border border-gray-800 focus:border-popcorn-gold outline-none p-3 rounded-lg text-sm text-white transition-all"
                placeholder="name@example.com"
              />
            </div>
            <button type="submit" className="w-full py-3 bg-linear-to-r from-popcorn-gold to-popcorn-glow text-pitch-dark font-black rounded-lg text-sm uppercase tracking-wider shadow-md hover:brightness-110 cursor-pointer transition-all">
              Send Code
            </button>
          </form>
        )}

        {/* --- FORM STEP 2: Verify Code & Change Password --- */}
        {step === 2 && (
          <form onSubmit={handleVerifyAndReset} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">6-Digit Code</label>
              <input 
                type="text" 
                required 
                maxLength={6}
                value={verificationCode} 
                onChange={e => setVerificationCode(e.target.value)} 
                className="w-full tracking-widest text-center font-mono bg-pitch-over border border-gray-800 focus:border-popcorn-gold outline-none p-3 rounded-lg text-lg text-white transition-all"
                placeholder="000000"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">New Password</label>
              <input 
                type="password" 
                required 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                className="w-full bg-pitch-over border border-gray-800 focus:border-popcorn-gold outline-none p-3 rounded-lg text-sm text-white transition-all"
                placeholder="••••••••"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="w-1/3 py-3 border border-gray-800 text-gray-400 font-bold rounded-lg text-sm uppercase tracking-wider hover:bg-pitch-over transition-all cursor-pointer"
              >
                Back
              </button>
              <button 
                type="submit" 
                className="w-2/3 py-3 bg-linear-to-r from-popcorn-gold to-popcorn-glow text-pitch-dark font-black rounded-lg text-sm uppercase tracking-wider shadow-md hover:brightness-110 transition-all cursor-pointer"
              >
                Reset Password
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
          Remember your details? <Link to="/login" className="text-popcorn-gold font-bold hover:underline">Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}