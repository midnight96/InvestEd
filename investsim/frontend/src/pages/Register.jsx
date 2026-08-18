import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import { Alert } from '../components/ui';

const STATS = [
  { label: 'Free cash', value: '₹1L' },
  { label: 'Quests', value: '6+' },
  { label: 'Setup', value: '30s' },
];

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    setSubmitting(true);
    try {
      await register(username.trim(), email.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      const detail = err?.response?.data;
      const firstError =
        detail && typeof detail === 'object'
          ? Object.entries(detail)
              .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages[0] : messages}`)
              .join(' ')
          : null;
      setError(firstError || 'Registration failed. Make sure the server is running and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      headline="Your first ₹1,00,000 is on us."
      story="It is virtual, but the market data is not. Build a portfolio, watch it move, and find out what kind of investor you actually are."
      stats={STATS}
      altLinkLabel="Sign in"
      altLinkTo="/login"
    >
      <p className="eyebrow">Create your account</p>
      <h1 className="mt-2 font-display text-3xl font-extrabold text-foreground">Join InvestEd</h1>
      <p className="mt-2.5 text-sm leading-relaxed text-muted">
        Start with ₹1,00,000 in virtual cash and level up from there.
      </p>

      <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2">
          <span className="font-display text-xs font-bold uppercase tracking-wider text-muted">
            Username
          </span>
          <input
            className="field"
            placeholder="Choose a username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            minLength="1"
            required
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-display text-xs font-bold uppercase tracking-wider text-muted">
            Email <span className="font-medium normal-case text-muted/70">(optional)</span>
          </span>
          <input
            className="field"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-display text-xs font-bold uppercase tracking-wider text-muted">
            Password
          </span>
          <input
            className="field"
            type="password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength="8"
            required
          />
        </label>

        {error && <Alert>{error}</Alert>}

        <button type="submit" className="btn-coin mt-2 w-full py-3" disabled={submitting}>
          {submitting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <>
              Create account
              <ArrowRight className="size-4" aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted lg:hidden">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-coin hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
