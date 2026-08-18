import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftRight, Plus, TrendingUp, Wallet } from 'lucide-react';
import client from '../api/client';
import {
  EmptyState,
  ErrorScreen,
  LoadingScreen,
  PageHeader,
  formatMoney,
} from '../components/ui';

const formatDate = (timestamp) =>
  new Date(timestamp).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

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
    () =>
      portfolio?.holdings?.reduce(
        (sum, h) => sum + Number(h.avg_price) * Number(h.quantity),
        0,
      ) || 0,
    [portfolio],
  );

  if (error) return <ErrorScreen message={error} />;
  if (!portfolio || !transactions) return <LoadingScreen label="Loading your portfolio…" />;

  const totalPnl = portfolio.holdings.reduce((sum, h) => sum + Number(h.pnl), 0);
  const pnlPct = invested > 0 ? (totalPnl / invested) * 100 : 0;
  const up = totalPnl >= 0;

  const stats = [
    { label: 'Total portfolio value', value: formatMoney(portfolio.total_portfolio_value), tone: 'coin' },
    { label: 'Invested amount', value: formatMoney(invested) },
    { label: 'Cash available', value: formatMoney(portfolio.cash_balance) },
    {
      label: 'Total return',
      value: `${up ? '+' : '−'}${formatMoney(Math.abs(totalPnl))}`,
      tone: up ? 'mint' : 'coral',
      note: `${up ? '▲' : '▼'} ${Math.abs(pnlPct).toFixed(2)}%`,
    },
  ];

  const toneClass = {
    coin: 'text-coin',
    mint: 'text-mint',
    coral: 'text-coral',
  };

  return (
    <main className="page">
      <PageHeader eyebrow="Your virtual wealth" title="Portfolio">
        <Link to="/market" className="btn-coin">
          <Plus className="size-4" aria-hidden="true" />
          Make a trade
        </Link>
      </PageHeader>

      {/* ── Summary tiles ────────────────────────────────────────────── */}
      <dl className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <dt className="text-xs text-muted">{stat.label}</dt>
            <dd
              className={`mt-2 font-display text-2xl font-extrabold tracking-tight ${
                toneClass[stat.tone] || 'text-foreground'
              }`}
            >
              {stat.value}
            </dd>
            {stat.note && (
              <p className={`mt-1 text-xs font-semibold ${toneClass[stat.tone]}`}>{stat.note}</p>
            )}
          </div>
        ))}
      </dl>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        {/* ── Holdings ──────────────────────────────────────────────── */}
        <section className="card p-5 lg:p-6">
          <div className="flex items-center gap-2.5">
            <Wallet className="size-4 shrink-0 text-coin" aria-hidden="true" />
            <div>
              <h2 className="font-display text-base font-bold text-foreground">Holdings</h2>
              <p className="mt-0.5 text-xs text-muted">All open positions with live prices</p>
            </div>
          </div>

          {portfolio.holdings.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="No holdings yet"
              description="Make your first virtual investment to see it tracked here."
            >
              <Link to="/market" className="btn-coin">
                Browse investments
              </Link>
            </EmptyState>
          ) : (
            <div className="mt-5">
              <div className="grid grid-cols-[1.5fr_.5fr_.9fr_.7fr] gap-3 border-b border-border pb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                <span>Asset</span>
                <span>Qty</span>
                <span>Value</span>
                <span className="text-right">Return</span>
              </div>
              {portfolio.holdings.map((h) => {
                const hUp = Number(h.pnl) >= 0;
                return (
                  <div
                    key={h.symbol}
                    className="grid grid-cols-[1.5fr_.5fr_.9fr_.7fr] items-center gap-3 border-b border-border/60 py-3 text-sm last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground" title={h.name || h.symbol}>
                        {h.name || h.symbol}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-muted">
                        {h.symbol} · {assetLabel(h.asset_type)} · avg ₹
                        {Number(h.avg_price).toFixed(2)}
                      </p>
                    </div>
                    <span className="text-muted">{h.quantity}</span>
                    <span className="font-medium text-foreground">
                      {formatMoney(h.current_value)}
                    </span>
                    <span
                      className={`text-right font-display font-bold ${hUp ? 'text-mint' : 'text-coral'}`}
                    >
                      {hUp ? '+' : ''}
                      {h.pnl_pct.toFixed(2)}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Transaction history ───────────────────────────────────── */}
        <section className="card p-5 lg:p-6">
          <div className="flex items-center gap-2.5">
            <ArrowLeftRight className="size-4 shrink-0 text-coin" aria-hidden="true" />
            <div>
              <h2 className="font-display text-base font-bold text-foreground">
                Transaction history
              </h2>
              <p className="mt-0.5 text-xs text-muted">Every order you have placed</p>
            </div>
          </div>

          {transactions.length === 0 ? (
            <EmptyState
              icon={ArrowLeftRight}
              title="No trades yet"
              description="Your order history will show up here once you place a trade."
            >
              <Link to="/market" className="btn-coin">
                Explore market
              </Link>
            </EmptyState>
          ) : (
            <ul className="mt-5">
              {transactions.slice(0, 15).map((t, i) => {
                const isBuy = t.txn_type === 'buy';
                return (
                  <li
                    key={`${t.timestamp}-${i}`}
                    className="flex items-center justify-between gap-3 border-b border-border/60 py-3 text-sm last:border-0"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`chip shrink-0 ${
                          isBuy ? 'bg-mint-soft text-mint' : 'bg-coral-soft text-coral'
                        }`}
                      >
                        {isBuy ? 'BUY' : 'SELL'}
                      </span>
                      <div className="min-w-0">
                        <p
                          className="truncate font-semibold text-foreground"
                          title={t.name || t.symbol}
                        >
                          {t.name || t.symbol}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-muted">
                          {t.symbol} · {assetLabel(t.asset_type)} · {formatDate(t.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-muted">
                        {t.quantity} × ₹{Number(t.price).toFixed(2)}
                      </p>
                      <p className="mt-0.5 font-display text-xs font-bold text-foreground">
                        {formatMoney(Number(t.price) * Number(t.quantity))}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {portfolio.holdings.length > 0 && (
        <p className="mt-5 flex items-center gap-2 text-xs text-muted">
          <TrendingUp className="size-3.5 shrink-0 text-coin" aria-hidden="true" />
          Prices refresh each time you open this page.
        </p>
      )}
    </main>
  );
}
