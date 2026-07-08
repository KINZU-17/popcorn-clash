import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  return (
    <div className="max-w-md mx-auto mt-16 bg-pitch-card border border-gray-800 p-8 rounded-2xl">
      <h2 className="text-xl font-black text-white uppercase tracking-wide mb-2">Reset Password</h2>
      {done ? (
        <div className="bg-pitch-over p-4 border-l-2 border-popcorn-gold text-sm text-gray-300">
          Check your email for a password reset link.
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); setDone(true); }} className="space-y-4">
          <p className="text-xs text-gray-400">Enter your email address and we'll send you a reset link.</p>
          <input type="email" required placeholder="Your email address..." value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-pitch-over border border-gray-800 focus:border-popcorn-gold outline-none p-3 rounded-lg text-sm text-white" />
          <button type="submit" className="w-full py-3 bg-pitch-over border border-popcorn-gold text-popcorn-gold hover:bg-popcorn-gold hover:text-pitch-dark font-black rounded-lg text-sm uppercase tracking-wider transition-all">
            Send Reset Link
          </button>
        </form>
      )}
      <div className="text-center mt-6">
        <Link to="/login" className="text-xs text-gray-500 hover:text-white underline">Back to Sign In</Link>
      </div>
    </div>
  );
}