import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';

const formatMoney = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

function MiniLine({ positive = true }) {
  return <svg viewBox="0 0 130 42" className={`mini-line ${positive ? 'up' : 'down'}`} aria-hidden="true">
    <polyline points="2,34 15,33 25,9 38,8 48,24 61,23 70,35 84,34 95,18 109,18 119,7 128,14" />
  </svg>;
}

export default function Dashboard() {
  const [portfolio, setPortfolio] = useState(null);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [p, g] = await Promise.all([client.get('/portfolio/'), client.get('/gamification/profile/')]);
        setPortfolio(p.data);
        setProfile(g.data);
      } catch (error) {
        console.error('Failed to load dashboard', error);
        setError('Failed to load dashboard data. Please try again.');
      }
    }
    load();
  }, []);

  const invested = useMemo(() => portfolio?.holdings?.reduce((sum, h) => sum + Number(h.avg_price) * Number(h.quantity), 0) || 0, [portfolio]);
  
  if (error) return <div className="dashboard-page error-state" style={{ padding: '2rem', color: '#ef4444' }}>{error}</div>;
  if (!portfolio || !profile) return <div className="dashboard-page loading-state">Loading your investor dashboard...</div>;

  const totalPnl = portfolio.holdings.reduce((sum, h) => sum + Number(h.pnl), 0);
  const holdings = portfolio.holdings.slice(0, 6);

  return <main className="dashboard-page">
    <header className="dashboard-header">
      <div><p className="eyebrow">YOUR VIRTUAL WEALTH</p><h1>Dashboard</h1></div>
      <div className="header-actions"><Link to="/market" className="quiet-button">Explore market</Link><Link to="/market" className="accent-button">+ Make a trade</Link></div>
    </header>

    <section className="dashboard-grid">
      <div className="panel portfolio-panel">
        <div className="panel-title"><div><p className="eyebrow">PORTFOLIO OVERVIEW</p><h2>{formatMoney(portfolio.total_portfolio_value)}</h2></div><span className={totalPnl >= 0 ? 'trend positive' : 'trend negative'}>{totalPnl >= 0 ? '+' : ''}{formatMoney(totalPnl)} all time</span></div>
        <div className="portfolio-chart" aria-label="Decorative portfolio performance chart">
          <div className="chart-labels"><span>Today</span><span>1W</span><span className="selected-range">1M</span><span>1Y</span></div>
          <svg viewBox="0 0 700 190" preserveAspectRatio="none"><defs><linearGradient id="portfolioFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff3f70" stopOpacity=".35"/><stop offset="1" stopColor="#ff3f70" stopOpacity="0"/></linearGradient></defs><path className="area" d="M0 160 L45 148 L85 157 L130 118 L185 128 L235 92 L282 109 L330 65 L375 86 L420 58 L475 78 L528 40 L580 55 L630 24 L700 42 L700 190 L0 190Z"/><path className="chart-stroke" d="M0 160 L45 148 L85 157 L130 118 L185 128 L235 92 L282 109 L330 65 L375 86 L420 58 L475 78 L528 40 L580 55 L630 24 L700 42"/></svg>
        </div>
        <div className="chart-summary"><div><small>Cash available</small><strong>{formatMoney(portfolio.cash_balance)}</strong></div><div><small>Invested amount</small><strong>{formatMoney(invested)}</strong></div><div><small>Assets owned</small><strong>{portfolio.holdings.length}</strong></div></div>
      </div>

      <aside className="metrics-column">
        <div className="panel metric-card"><div className="metric-heading"><span>Portfolio P&L</span><b className={totalPnl >= 0 ? 'positive' : 'negative'}>{totalPnl >= 0 ? '▲' : '▼'} {Math.abs(totalPnl).toFixed(0)}</b></div><strong>{formatMoney(totalPnl)}</strong><MiniLine positive={totalPnl >= 0} /></div>
        <div className="panel metric-card"><div className="metric-heading"><span>Investor level</span><b className="positive">Level {profile.level}</b></div><strong>{profile.xp} XP</strong><div className="xp-bar"><span style={{ width: `${Math.min(profile.xp % 100 || 18, 100)}%` }} /></div></div>
        <div className="panel metric-card"><div className="metric-heading"><span>Buying power</span><b className="positive">Ready</b></div><strong>{formatMoney(portfolio.cash_balance)}</strong><MiniLine /></div>
      </aside>

      <section className="panel holdings-panel">
        <div className="section-heading"><div><h2>Your holdings</h2><p>Live virtual positions and performance</p></div><Link to="/market">View market →</Link></div>
        {holdings.length ? <div className="holdings-table"><div className="table-row table-head"><span>Asset</span><span>Quantity</span><span>Current value</span><span>Return</span></div>{holdings.map((holding) => <div className="table-row" key={holding.symbol}><div><b className="truncate block max-w-[180px]" title={holding.name || holding.symbol}>{holding.name || holding.symbol}</b><small>{holding.symbol} • {holding.asset_type === 'mutual_fund' ? 'Mutual fund' : 'Stock'}</small></div><span>{holding.quantity}</span><span>{formatMoney(Number(holding.current_price) * Number(holding.quantity))}</span><span className={Number(holding.pnl) >= 0 ? 'positive' : 'negative'}>{Number(holding.pnl) >= 0 ? '+' : ''}{holding.pnl_pct.toFixed(2)}%</span></div>)}</div> : <div className="empty-holdings"><div>◌</div><h3>Your portfolio is waiting</h3><p>Make your first virtual investment and watch it grow here.</p><Link to="/market" className="accent-button">Browse investments</Link></div>}
      </section>

      <section className="panel progress-panel"><div className="section-heading"><div><h2>Learning progress</h2><p>Keep building your investing confidence</p></div><Link to="/lessons">Continue learning →</Link></div><div className="progress-orbit"><div><b>{profile.level}</b><small>LEVEL</small></div></div><p className="progress-copy"><b>{profile.xp} XP earned</b><br />Complete lessons and make thoughtful trades to unlock new badges.</p></section>
    </section>
  </main>;
}
