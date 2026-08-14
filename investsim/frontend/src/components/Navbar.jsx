import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  ['⌂', 'Dashboard', '/dashboard'],
  ['☰', 'Portfolio', '/portfolio'],
  ['↗', 'Market', '/market'],
  ['◈', 'Lessons', '/lessons'],
  ['🤖', 'AI Coach', '/coach'],
  ['♙', 'Leaderboard', '/leaderboard'],
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
          {links.map(([icon, label, path]) => (
            <NavLink key={path} to={path} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <span>{icon}</span>{label}
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
