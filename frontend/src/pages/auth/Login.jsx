import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/AuthLayout';
import { Mail, Lock, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await loginUser(email, password);
      if (res?.success) {
        navigate('/dashboard');
      } else {
        setError(res?.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        setError(Object.values(errors).flat().join(' '));
      } else {
        setError(err.response?.data?.message || 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      pageType="login"
      error={error}
      footerLink={
        <div className="flex flex-col gap-2">
          <div>
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-deep-green font-black hover:text-growth-green transition-colors"
            >
              Create account
            </Link>
          </div>
          <div>
            <Link
              to="/forgot-password"
              className="text-muted-text hover:text-deep-green transition-colors text-xs font-bold"
            >
              Forgot password?
            </Link>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <nav className="flex gap-8 border-b border-border-color">
          <button
            type="button"
            className="pb-3 text-sm font-black border-b-2 border-deep-green text-deep-green"
          >
            Sign In
          </button>
          <button
            type="button"
            className="pb-3 text-sm font-medium border-b-2 border-transparent text-muted-text hover:text-deep-green transition-colors"
            onClick={() => navigate('/register')}
          >
            Create Account
          </button>
        </nav>

        <form className="space-y-5" onSubmit={handleLogin}>
          <div className="space-y-1.5">
            <label className="text-label-caps text-deep-green block font-bold">EMAIL ADDRESS</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
              <input
                className="auth-input auth-input-icon"
                placeholder="name@agency.com"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-label-caps text-deep-green block font-bold">PASSWORD</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
              <input
                className="auth-input auth-input-icon"
                placeholder="••••••••"
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            className="w-full h-12 bg-deep-green text-white font-black rounded-xl hover:bg-growth-green hover:text-deep-green hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60 cursor-pointer text-sm"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
              </>
            ) : (
              'Secure Access'
            )}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
