import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

const GithubIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.28 1.15-.28 2.35 0 3.5-.73 1.02-1.08 2.25-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
);

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('dev@flippy.studio');
  const [password, setPassword] = useState('dev1234');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate network delay
    setTimeout(() => {
      login({ email, password });
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-flippy-blue/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-flippy-purple/20 blur-[120px] rounded-full"></div>

      <div className="max-w-md w-full relative">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M8 8l8 4-8 4V8z" fill="black" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent font-outfit">Flippy Studio</h1>
          <p className="text-white/40 text-sm mt-2">Design, Build, and Sync to Engine</p>
        </div>

        <div className="bg-flippy-panel/40 backdrop-blur-2xl border border-white/5 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-white/30 uppercase tracking-widest pl-1">Email Address</label>
              <div className="relative group">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-flippy-blue transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 bg-black/40 border border-white/5 rounded-xl pl-12 pr-4 text-sm text-white focus:outline-none focus:border-flippy-blue/40 transition-all"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center pl-1">
                <label className="text-[11px] font-bold text-white/30 uppercase tracking-widest">Password</label>
                <a href="#" className="text-[10px] text-flippy-blue hover:underline">Forgot password?</a>
              </div>
              <div className="relative group">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-flippy-blue transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 bg-black/40 border border-white/5 rounded-xl pl-12 pr-4 text-sm text-white focus:outline-none focus:border-flippy-blue/40 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-white/90 transition-all active:scale-[0.98] disabled:opacity-50 mt-4 overflow-hidden relative group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold"><span className="bg-[#141414] px-4 text-white/20">Authorized Access Only</span></div>
          </div>

          <button className="w-full h-12 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center gap-3 text-sm text-white/80 hover:bg-white/10 transition-all">
            <GithubIcon size={18} />
            Continue with GitHub
          </button>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-[11px] text-white/20">
          <Sparkles size={12} className="text-flippy-purple" />
          Powered by Flippy AI Node-01
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
