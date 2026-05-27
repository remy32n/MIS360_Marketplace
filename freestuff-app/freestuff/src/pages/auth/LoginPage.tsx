import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from '../../hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.endsWith('@depaul.edu')) {
      toast({ title: 'Invalid email', description: 'Please use a valid @depaul.edu email address.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const { user: loggedInUser } = await login(email, password);
      const role = loggedInUser?.role;
      const dest = from || (role === 'ADMIN' ? '/admin/approvals' : role === 'ORG' ? '/org/listings' : '/browse');
      navigate(dest, { replace: true });
    } catch (err: any) {
      toast({ title: 'Login failed', description: err.response?.data?.message || 'Invalid credentials', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-5xl">🎁</span>
          <h1 className="text-2xl font-bold tracking-tight text-[#0a0a0a]">Free Stuff</h1>
          <p className="text-[14px] text-gray-500">Free giveaways at DePaul University</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          <input
            id="email"
            type="email"
            placeholder="name@depaul.edu"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
            data-testid="input-email"
            className="w-full bg-gray-100 rounded-xl px-4 py-3 text-[14px] text-[#0a0a0a] placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#0095f6]/40 transition"
          />
          <input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            data-testid="input-password"
            className="w-full bg-gray-100 rounded-xl px-4 py-3 text-[14px] text-[#0a0a0a] placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#0095f6]/40 transition"
          />
          <button
            type="submit"
            disabled={isLoading}
            data-testid="button-submit"
            className="w-full bg-[#0095f6] hover:bg-[#0086e0] active:bg-[#0077c9] text-white font-semibold text-[14px] py-3 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Log In'}
          </button>
        </form>

        {/* Divider */}
        <div className="w-full flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Sign up link */}
        <p className="text-[14px] text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#0095f6] font-semibold hover:opacity-70" data-testid="link-signup">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
