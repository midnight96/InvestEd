import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import { Alert } from '../components/ui';

const STATS = [
  { label: 'Start with', value: '₹1L' },
  { label: 'Quests', value: 'XP' },
  { label: 'Real risk', value: '₹0' },
];

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch {
      setError('Those credentials did not match. Check them, or create an account instead.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      headline="Play the market. Keep the lesson."
      story="Trade real stocks and mutual funds with virtual cash, clear trivia quests for XP, and climb the class leaderboard — without risking a rupee."
      stats={STATS}
      altLinkLabel="Create account"
      altLinkTo="/register"
    >
      <p className="eyebrow">Welcome back</p>
      <h1 className="mt-2 font-display text-3xl font-extrabold text-foreground">Sign in</h1>
      <p className="mt-2.5 text-sm leading-relaxed text-muted">
        Pick up your streak where you left it.{' '}
        <Link to="/register" className="font-semibold text-coin hover:underline">
          No account yet?
        </Link>
      </p>

      <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2">
          <span className="font-display text-xs font-bold uppercase tracking-wider text-muted">
            Username
          </span>
          <input
            className="field"
            placeholder="Email or username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-display text-xs font-bold uppercase tracking-wider text-muted">
            Password
          </span>
          <input
            className="field"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {error && <Alert>{error}</Alert>}

        <button type="submit" className="btn-coin mt-2 w-full py-3" disabled={submitting}>
          {submitting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <>
              Sign in
              <ArrowRight className="size-4" aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted lg:hidden">
        New to InvestEd?{' '}
        <Link to="/register" className="font-semibold text-coin hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
