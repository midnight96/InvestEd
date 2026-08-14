import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';

const formatMoney = (value) =>
  `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const formatDate = (timestamp) => {
  const d = new Date(timestamp);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const assetLabel = (type) => (type === 'mutual_fund' ? 'Mutual fund' : 'Stock');

export default function Portfolio() {
  const [portfolio, setPortfolio] = useState(null);
  const [transactions, setTransactions] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [p, t] = await Promise.all([
          client.get('/portfolio/'),
          client.get('/portfolio/transactions/'),
        ]);
        setPortfolio(p.data);
        setTransactions(t.data);
      } catch (err) {
        console.error('Failed to load portfolio:', err);
        setError('Failed to load your portfolio. Please try again.');
      }
    }
    load();
  }, []);

  const invested = useMemo(
    () => portfolio?.holdings?.reduce((sum, h) => sum + Number(h.avg_price) * Number(h.quantity), 0) || 0,
    [portfolio],
  );

  if (error) {
    return <main className="app-page page-loading">{error}</main>;
  }

  if (!portfolio || !transactions) {
    return <main className="app-page page-loading">Loading your portfolio...</main>;
  }

  const totalPnl = portfolio.holdings.reduce((sum, h) => sum + Number(h.pnl), 0);
  const pnlPct = invested > 0 ? (totalPnl / invested) * 100 : 0;

  const stats = [
    { label: 'Total portfolio value', value: formatMoney(portfolio.total_portfolio_value), accent: true },
    { label: 'Invested amount', value: formatMoney(invested) },
    { label: 'Cash available', value: formatMoney(portfolio.cash_balance) },
    { label: 'Total return', value: `${totalPnl >= 0 ? '+' : ''}${formatMoney(totalPnl)}`, pnl: true },
  ];

  return (
    <main className="app-page portfolio-page">
      <div className="flex items-center justify-between pb-7 border-b border-white/10">
        <div>
          <p className="eyebrow">YOUR VIRTUAL WEALTH</p>
          <h1 className="mt-1 text-2xl font-bold text-white tracking-tight">Portfolio</h1>
        </div>
        <Link to="/market" className="accent-button">+ Make a trade</Link>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-xl p-5">
            <p className="text-xs text-slate-400">{stat.label}</p>
            <p className={`mt-2 text-2xl font-bold tracking-tight ${stat.accent ? 'text-emerald-400' : 'text-white'} ${stat.pnl ? (totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400') : ''}`}>
              {stat.value}
            </p>
            {stat.pnl && (
              <p className={`text-xs mt-1 ${totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {totalPnl >= 0 ? '▲' : '▼'} {pnlPct.toFixed(2)}%
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        {/* HOLDINGS */}
        <section className="bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-xl p-5">
          <h2 className="font-semibold text-white">Holdings</h2>
          <p className="text-xs text-slate-400 mt-1">All your open positions with live prices</p>

          {portfolio.holdings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-red-400 text-3xl">◌</div>
              <h3 className="mt-3 font-medium text-white">No holdings yet</h3>
              <p className="text-sm text-slate-400 mt-1 mb-4">Make your first virtual investment.</p>
              <Link to="/market" className="accent-button">Browse investments</Link>
            </div>
          ) : (
            <div className="mt-4">
              <div className="grid grid-cols-[1.4fr_.6fr_.9fr_.7fr] gap-2 text-[10px] uppercase tracking-wide text-slate-500 px-2 pb-2 border-b border-white/10">
                <span>Asset</span><span>Quantity</span><span>Value</span><span className="text-right">Return</span>
              </div>
              {portfolio.holdings.map((h) => (
                <div key={h.symbol} className="grid grid-cols-[1.4fr_.6fr_.9fr_.7fr] gap-2 items-center py-3 px-2 border-b border-white/5 text-sm">
                  <div>
                    <p className="font-medium text-white">{h.symbol}</p>
                    <p className="text-xs text-slate-500">{assetLabel(h.asset_type)} · avg ₹{Number(h.avg_price).toFixed(2)}</p>
                  </div>
                  <p className="text-slate-300">{h.quantity}</p>
                  <p className="text-white">{formatMoney(h.current_value)}</p>
                  <p className={`text-right font-medium ${Number(h.pnl) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {Number(h.pnl) >= 0 ? '+' : ''}{h.pnl_pct.toFixed(2)}%
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* TRANSACTION HISTORY */}
        <section className="bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-xl p-5">
          <h2 className="font-semibold text-white">Transaction history</h2>
          <p className="text-xs text-slate-400 mt-1">Every order you have placed</p>

          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-red-400 text-3xl">⇄</div>
              <h3 className="mt-3 font-medium text-white">No trades yet</h3>
              <p className="text-sm text-slate-400 mt-1 mb-4">Your order history will appear here.</p>
              <Link to="/market" className="accent-button">Explore market</Link>
            </div>
          ) : (
            <div className="mt-4">
              {transactions.slice(0, 15).map((t, i) => {
                const isBuy = t.txn_type === 'buy';
                return (
                  <div key={`${t.timestamp}-${i}`} className="flex items-center justify-between py-3 px-2 border-b border-white/5 text-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`shrink-0 text-xs font-bold px-2 py-1 rounded ${isBuy ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                        {isBuy ? 'BUY' : 'SELL'}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate">{t.symbol}</p>
                        <p className="text-xs text-slate-500">{assetLabel(t.asset_type)} · {formatDate(t.timestamp)}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-slate-300">{t.quantity} × ₹{Number(t.price).toFixed(2)}</p>
                      <p className={`text-xs font-medium ${isBuy ? 'text-slate-400' : 'text-emerald-400'}`}>
                        ₹{(Number(t.price) * Number(t.quantity)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
