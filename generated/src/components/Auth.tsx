import React, { useState } from 'react';
import { Lock, Mail, ArrowLeft, CheckCircle, KeyRound } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const Auth: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
      const adminPasswordHash = import.meta.env.VITE_ADMIN_PASSWORD_HASH;

      if (!adminEmail || !adminPasswordHash) {
        throw new Error('Admin credentials not configured. Check environment variables.');
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 600));

      const inputHash = await hashPassword(password);

      if (email === adminEmail && inputHash === adminPasswordHash) {
        localStorage.setItem('admin_auth', 'true');
        window.location.reload();
      } else {
        throw new Error('Invalid login credentials');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/kiran-panel`,
        });
        if (resetError) throw resetError;
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 600));

      setSuccessMessage(`Password reset instructions have been sent to ${email}. Please check your inbox.`);
    } catch (err: any) {
      setError(err.message || 'An error occurred while requesting password reset');
    } finally {
      setLoading(false);
    }
  };

  const switchToMode = (newMode: 'login' | 'forgot') => {
    setMode(newMode);
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-gray-300 p-4">
      <div className="w-full max-w-md p-8 rounded-2xl border border-gray-800 bg-[#111] shadow-2xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00FFAB] to-transparent opacity-50"></div>

        {mode === 'login' ? (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#00FFAB]/10 text-[#00FFAB] mb-4 border border-[#00FFAB]/20">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Admin Access
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                Sign in to access the admin panel
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-5">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-xl bg-black/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FFAB]/50 focus:border-transparent transition-all"
                    placeholder="Email address"
                  />
                </div>

                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-xl bg-black/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FFAB]/50 focus:border-transparent transition-all"
                      placeholder="Password"
                    />
                  </div>
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={() => switchToMode('forgot')}
                      className="text-xs text-[#00FFAB] hover:underline focus:outline-none transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-black bg-[#00FFAB] hover:bg-[#00FFAB]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00FFAB] focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#00FFAB]/10 text-[#00FFAB] mb-4 border border-[#00FFAB]/20">
                <KeyRound className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Forgot Password
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                Enter your registered email address to receive password reset instructions
              </p>
            </div>

            {successMessage ? (
              <div className="text-center space-y-6">
                <div className="p-4 rounded-xl bg-[#00FFAB]/10 border border-[#00FFAB]/20 text-gray-200 text-sm flex flex-col items-center gap-3">
                  <CheckCircle className="w-10 h-10 text-[#00FFAB]" />
                  <p className="leading-relaxed">{successMessage}</p>
                </div>

                <button
                  type="button"
                  onClick={() => switchToMode('login')}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-gray-700 rounded-xl text-sm font-medium text-white hover:bg-gray-800 focus:outline-none transition-all"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-5">
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-xl bg-black/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FFAB]/50 focus:border-transparent transition-all"
                      placeholder="Email address"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-black bg-[#00FFAB] hover:bg-[#00FFAB]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00FFAB] focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending Link...' : 'Send Reset Link'}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => switchToMode('login')}
                    className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Sign In
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};
