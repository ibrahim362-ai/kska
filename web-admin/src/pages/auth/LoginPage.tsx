import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { LogIn, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoChecking, setAutoChecking] = useState(true);
  const [rememberMe, setRememberMe] = useState(true);
  const autoSubmitted = useRef(false);
  const { login, verifySession } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      api.get('/auth/me')
        .then((res) => {
          verifySession(res.data.data);
          navigate('/', { replace: true });
        })
        .catch(() => {
          localStorage.clear();
          setAutoChecking(false);
        });
      return;
    }

    const savedEmail = localStorage.getItem('savedEmail');
    const savedPass = localStorage.getItem('savedPass');
    if (savedEmail && savedPass) {
      setEmail(savedEmail);
      setPassword(savedPass);
      setAutoChecking(false);
      return;
    }

    setAutoChecking(false);
  }, []);

  useEffect(() => {
    if (!autoChecking && email && password && !autoSubmitted.current) {
      autoSubmitted.current = true;
      handleSubmit();
    }
  }, [autoChecking, email, password]);

  if (autoChecking) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email || !password) return;
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/signin', { email, password });
      login(data.data.user, data.data.accessToken, data.data.refreshToken);
      if (rememberMe) {
        localStorage.setItem('savedEmail', email);
        localStorage.setItem('savedPass', password);
      } else {
        localStorage.removeItem('savedEmail');
        localStorage.removeItem('savedPass');
      }
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-2xl mb-4 transform hover:scale-110 transition-transform duration-300">
            <LogIn size={36} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">KSKA</h1>
          <p className="text-indigo-200 text-lg">Admin Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20">
          {error && (
            <div className="bg-red-500/20 border border-red-400/50 text-red-100 rounded-xl p-3.5 mb-6 text-sm backdrop-blur-sm animate-shake">
              <span className="font-medium">⚠️ {error}</span>
            </div>
          )}

          <div className="mb-5">
            <label className="block text-sm font-semibold text-white mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all duration-200"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-white mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all duration-200 pr-12"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="mb-6 flex items-center gap-2">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-400 focus:ring-offset-0 cursor-pointer"
            />
            <label htmlFor="rememberMe" className="text-sm text-white/80 cursor-pointer select-none">
              Remember me for next time
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <LogIn size={20} />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-white/60 text-sm mt-6">
          Secure admin access • All rights reserved
        </p>
      </div>
    </div>
  );
}
