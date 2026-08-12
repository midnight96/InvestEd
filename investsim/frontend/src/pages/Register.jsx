import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import investingPhone from '../assets/investing-phone-login.png';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    try {
      await register(username.trim(), email.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      const detail = err?.response?.data;
      const firstError = detail && typeof detail === 'object'
        ? Object.entries(detail).map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages[0] : messages}`).join(' ')
        : null;
      setError(firstError || 'Registration failed. Make sure the server is running and try again.');
    }
  }

  return <main className="login-showcase register-showcase">
    <section className="login-story">
      <div className="story-topline">Start small, learn quickly — your virtual portfolio begins here.</div>
      <div className="story-copy"><span className="story-rings" /><h1>Start your<br />money story</h1><p>Practice investing with virtual cash and discover what works for you.</p></div>
      <img src={investingPhone} className="login-phone" alt="A phone showing an investing portfolio" />
    </section>

    <section className="login-form-panel register-form-panel">
      <header className="login-form-header"><Link to="/" className="login-brand"><span>i</span>InvestEd</Link><Link to="/login">Sign in</Link></header>
      <form className="login-form register-form" onSubmit={handleSubmit}>
        <div><p className="login-kicker">CREATE YOUR ACCOUNT</p><h2>Join InvestEd</h2><p className="login-intro">Start with ₹1,00,000 in virtual cash.</p></div>
        <label>Username<input placeholder="Choose a username" value={username} onChange={(e) => setUsername(e.target.value)} minLength="1" required /></label>
        <label>Email <span className="optional">(optional)</span><input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label>Password<input type="password" placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} minLength="8" required /></label>
        {error && <p className="login-error">{error}</p>}
        <button type="submit">Create account <span>→</span></button>
        <p className="mobile-register">Already have an account? <Link to="/login">Sign in</Link></p>
      </form>
      <footer className="login-legal">© 2026 · Learn, practise, invest virtually.</footer>
    </section>
  </main>;
}
