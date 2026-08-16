import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  ['⌂', 'Dashboard', '/dashboard', 'Home'],
  ['☰', 'Portfolio', '/portfolio', 'Portfolio'],
  ['↗', 'Market', '/market', 'Market'],
  ['🎲', 'Trivia & Challenges', '/lessons', 'Trivia'],
  ['🤖', 'AI Coach', '/coach', 'Coach'],
  ['♙', 'Leaderboard', '/leaderboard', 'Ranks'],
];

export default function Navbar() {
  const { isAuthenticated, username, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  if (isAuthenticated) {
    return (
      <aside className="app-sidebar">
        <Link to="/dashboard" className="brand-mark"><span>i</span> InvestEd</Link>
        <nav className="sidebar-links">
          {links.map(([icon, label, path, shortLabel]) => (
            <NavLink key={path} to={path} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <span>{icon}</span>
              <span className="sidebar-link-desktop">{label}</span>
              <span className="sidebar-link-label">{shortLabel}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-user">
          <div className="avatar">{username?.slice(0, 1).toUpperCase()}</div>
          <div><p>{username}</p><small>Virtual investor</small></div>
          <button onClick={handleLogout} title="Log out">↗</button>
        </div>
      </aside>
    );
  }

  return null;
}
