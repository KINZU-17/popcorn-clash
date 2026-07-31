import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../utils/backendApi';
import { Eye, EyeOff, ShieldCheck, Mail } from 'lucide-react';
import logo from '../assets/logo.png';
import AuthBackground from '../components/AuthBackground';

export default function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get('token') || '';

  const [step, setStep] = useState(tokenParam ? 2 : 1); // 1: request code, 2: verify code/token & reset
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [token, setToken] = useState(tokenParam);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (tokenParam) {
      setToken(tokenParam);
      setStep(2);
    }
  }, [tokenParam]);


  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await api.auth.forgotPassword(email);
      // Handle development fallback where email is not sent
      if (res.dev_fallback) {
        setMessage(`DEV MODE: Code: ${res.reset_code}`);
        setCode(res.reset_code);
        setToken(res.reset_token); // Set the token from the response
      } else {
        setMessage(res.message || 'Verification code sent to your email.');
      }
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await api.auth.resetPassword({ email, code, token, newPassword });
      setMessage(res.message || 'Password reset successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Password reset failed');
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
          <h2 className="text-2xl font-black text-white uppercase tracking-wider">Reset Password</h2>
          <p className="text-xs text-on-surface-variant mt-1">
            {step === 1 ? 'Enter your email to receive a 6-digit verification code.' : 'Enter the code sent to your email and your new password.'}
          </p>
        </div>

        <div className="glass-panel p-8 rounded-2xl shadow-card-glow">
          {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg">{error}</div>}
          {message && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-lg">{message}</div>}

          {step === 1 ? (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-surface-container-low border border-surface-container-high focus:border-warm-gold outline-none p-2.5 rounded-lg text-sm text-white pl-10"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-warm-gold to-warm-gold-light text-on-primary-container font-black rounded-lg text-sm uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Sending Code...' : 'Send Verification Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Verification Code (6-digit)</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-surface-container-low border border-surface-container-high focus:border-warm-gold outline-none p-2.5 rounded-lg text-sm text-white font-mono tracking-widest text-center"
                  />
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-surface-container-low border border-surface-container-high focus:border-warm-gold outline-none p-2.5 rounded-lg text-sm text-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3 bg-surface-container-low border border-surface-container-high text-on-surface-variant font-bold rounded-lg text-xs uppercase tracking-wider cursor-pointer"
                >
                  Resend Code
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-3 bg-gradient-to-r from-warm-gold to-warm-gold-light text-on-primary-container font-black rounded-lg text-sm uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Updating Password...' : 'Reset Password'}
                </button>
              </div>
            </form>
          )}

          <div className="text-center mt-6">
            <Link to="/login" className="text-xs text-on-surface-variant hover:text-white underline">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
