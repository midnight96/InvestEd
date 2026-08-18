import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  Dices,
  Bot,
  Trophy,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const links = [
  { icon: LayoutDashboard, label: 'Dashboard', short: 'Home', to: '/dashboard' },
  { icon: Wallet, label: 'Portfolio', short: 'Wallet', to: '/portfolio' },
  { icon: TrendingUp, label: 'Market', short: 'Market', to: '/market' },
  { icon: Dices, label: 'Trivia & Quests', short: 'Trivia', to: '/lessons' },
  { icon: Bot, label: 'AI Coach', short: 'Coach', to: '/coach' },
  { icon: Trophy, label: 'Leaderboard', short: 'Ranks', to: '/leaderboard' },
];

export function BrandMark({ className = '' }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <span className="grid size-8 place-items-center rounded-xl bg-coin font-display text-base font-extrabold text-coin-ink shadow-[0_3px_0_0_#a37200]">
        i
      </span>
      <span className="font-display text-lg font-extrabold tracking-tight text-foreground">
        InvestEd
      </span>
    </span>
  );
}

export default function Navbar() {
  const { isAuthenticated, username, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  if (!isAuthenticated) return null;

  const initial = username?.slice(0, 1).toUpperCase();

  return (
    <>
      {/* ── Desktop rail ─────────────────────────────────────────────── */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r border-border bg-surface px-5 py-7 lg:flex">
        <Link to="/dashboard" aria-label="InvestEd home">
          <BrandMark />
        </Link>

        <nav className="mt-10 flex flex-col gap-1.5" aria-label="Main navigation">
          {links.map(({ icon: Icon, label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 font-display text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-coin text-coin-ink shadow-[0_3px_0_0_#a37200]'
                    : 'text-muted hover:bg-elevated hover:text-foreground'
                }`
              }
            >
              <Icon className="size-[18px] shrink-0" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex items-center gap-3 rounded-xl border border-border bg-elevated p-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-coin/15 font-display text-sm font-extrabold text-coin">
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-sm font-bold text-foreground">{username}</p>
            <p className="text-[11px] text-muted">Virtual investor</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Log out"
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-coral-soft hover:text-coral"
          >
            <LogOut className="size-4" aria-hidden="true" />
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ───────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-surface/95 px-5 py-3.5 backdrop-blur lg:hidden">
        <Link to="/dashboard" aria-label="InvestEd home">
          <BrandMark />
        </Link>
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-coin/15 font-display text-xs font-extrabold text-coin">
            {initial}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Log out"
            className="rounded-lg p-2 text-muted transition-colors hover:bg-coral-soft hover:text-coral"
          >
            <LogOut className="size-4" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* ── Mobile bottom tab bar ────────────────────────────────────── */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-border bg-surface/95 px-1.5 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
        aria-label="Main navigation"
      >
        {links.map(({ icon: Icon, short, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2.5 font-display text-[10px] font-bold transition-colors ${
                isActive ? 'text-coin' : 'text-muted'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`grid w-full max-w-[46px] place-items-center rounded-lg py-1 transition-colors ${
                    isActive ? 'bg-coin/15' : ''
                  }`}
                >
                  <Icon className="size-[19px]" aria-hidden="true" />
                </span>
                {short}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
