import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import RadiantLogo from './RadiantLogo';

const LoginView = ({ onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!supabase) {
      setError('Supabase 설정이 완료되지 않았습니다. .env.local 파일을 확인해주세요.');
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-md glass-panel p-10 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl -ml-24 -mb-24"></div>

        <div className="relative z-10">
          <div className="flex flex-col items-center mb-10">
            <RadiantLogo className="w-40 h-10 mb-4" />
            <h2 className="text-sm font-black italic tracking-widest text-primary uppercase">Admin Access</h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] text-dim font-black uppercase tracking-widest ml-1">Email</label>
              <input
                type="email"
                required
                className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-primary/50 transition-all"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-dim font-black uppercase tracking-widest ml-1">Password</label>
              <input
                type="password"
                required
                className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-primary/50 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="bg-error/10 border border-error/20 p-4 rounded-xl">
                <p className="text-[11px] text-error font-bold text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-5 text-sm font-black italic tracking-widest shadow-2xl relative overflow-hidden group"
            >
              <span className="relative z-10">{loading ? 'CONNECTING...' : 'SIGN IN'}</span>
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500"></div>
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2 text-[10px] text-dim font-bold uppercase tracking-widest hover:text-white transition-colors"
            >
              Cancel & Return to Live
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
