import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import investingPhone from '../assets/investing-phone-login.png';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError('No account exists? Sign up instead, or verify your credentials.');
    }
  }

  return <main className="login-showcase">
    <section className="login-story">
      <div className="story-topline">Smart investing, made simple — learn by doing.</div>
      <div className="story-copy"><span className="story-rings" /><h1>Manage<br />your money</h1><p>Build confidence with a portfolio that is always yours to explore.</p></div>
      <img src={investingPhone} className="login-phone" alt="A phone showing an investing portfolio" />
    </section>

    <section className="login-form-panel">
      <header className="login-form-header"><Link to="/" className="login-brand"><span>i</span>InvestEd</Link><Link to="/register">Create account</Link></header>
      <form className="login-form" onSubmit={handleSubmit}>
        <div>
          <p className="login-kicker">WELCOME BACK</p>
          <h2>Sign in</h2>
          <p className="login-intro">
            Continue your investing journey.
            <span style={{ display: 'block', marginTop: '6px', color: '#ff593c', fontWeight: 'bold', fontSize: '12px' }}>
              ⚠️ No account exists? Sign up/Register instead!
            </span>
          </p>
        </div>
        <label>Username<input placeholder="Email or username" value={username} onChange={(e) => setUsername(e.target.value)} required /></label>
        <label>Password<input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        {error && <p className="login-error">{error}</p>}
        <button type="submit">Sign in <span>→</span></button>
        <p className="mobile-register">New to InvestEd? <Link to="/register">Create an account</Link></p>
      </form>
      <footer className="login-legal">© 2026 InvestEd · Virtual investing, not financial advice.</footer>
    </section>
  </main>;
}
