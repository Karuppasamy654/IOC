import React, { useState } from 'react';
import { loginUser, registerUser } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userData: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [targetRole, setTargetRole] = useState('Software Development Engineer (SDE)');
  const [targetCompany, setTargetCompany] = useState('Amazon');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let res: any;
      if (mode === 'login') {
        res = await loginUser({ email, password });
      } else {
        res = await registerUser({
          email,
          name,
          password,
          target_role: targetRole,
          target_company: targetCompany
        });
      }
      onSuccess(res);
      onClose();
    } catch (err: any) {
      console.warn("Auth error caught in UI:", err);
      setError(err?.message || 'Authentication error. Initializing student environment...');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4">
      <div className="glass-modal rounded-3xl shadow-2xl max-w-md w-full p-6 border border-white/20 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center pb-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-extrabold text-white">
              {mode === 'login' ? 'Sign In to PlacementEvolve' : 'Create Student Account'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {mode === 'login'
                ? 'Enter your credentials to access your adaptive learning environment.'
                : 'Start your personalized adaptive placement preparation.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white rounded-xl p-1.5 hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 subtle-badge-rose rounded-xl text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ananya Roy"
                className="w-full px-3 py-2.5 bg-slate-900/70 border border-white/15 rounded-xl text-sm text-white placeholder-slate-500 focus:border-indigo-400 outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@university.edu"
              className="w-full px-3 py-2.5 bg-slate-900/70 border border-white/15 rounded-xl text-sm text-white placeholder-slate-500 focus:border-indigo-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 bg-slate-900/70 border border-white/15 rounded-xl text-sm text-white placeholder-slate-500 focus:border-indigo-400 outline-none"
            />
          </div>

          {mode === 'register' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Role</label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900/70 border border-white/15 rounded-xl text-xs text-white focus:border-indigo-400 outline-none"
                  >
                    <option value="Software Development Engineer (SDE)" className="bg-slate-900 text-white">SDE / Backend</option>
                    <option value="Full Stack Developer" className="bg-slate-900 text-white">Full Stack</option>
                    <option value="Frontend Engineer" className="bg-slate-900 text-white">Frontend</option>
                    <option value="Data Engineer" className="bg-slate-900 text-white">Data Engineer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Company</label>
                  <select
                    value={targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900/70 border border-white/15 rounded-xl text-xs text-white focus:border-indigo-400 outline-none"
                  >
                    <option value="Amazon" className="bg-slate-900 text-white">Amazon</option>
                    <option value="Google" className="bg-slate-900 text-white">Google</option>
                    <option value="Microsoft" className="bg-slate-900 text-white">Microsoft</option>
                    <option value="TCS Digital" className="bg-slate-900 text-white">TCS Digital</option>
                    <option value="Atlassian" className="bg-slate-900 text-white">Atlassian</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all disabled:opacity-50 border border-indigo-400/30 mt-2"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Register & Start Preparation'}
          </button>
        </form>

        <div className="mt-5 text-center pt-4 border-t border-white/10 text-xs text-slate-400">
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('register'); setError(null); }}
                className="text-indigo-400 font-semibold hover:underline"
              >
                Register New Account
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); }}
                className="text-indigo-400 font-semibold hover:underline"
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
