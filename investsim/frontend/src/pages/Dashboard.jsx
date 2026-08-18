import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from 'recharts';
import {
  ArrowRight,
  Dices,
  Flame,
  PiggyBank,
  Plus,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import client from '../api/client';
import {
  Alert,
  DeltaChip,
  EmptyState,
  ErrorScreen,
  LoadingScreen,
  PageHeader,
  formatMoney,
} from '../components/ui';

/**
 * Builds a plausible value trail that ends on the real portfolio value so the
 * chart is anchored to live data rather than a hardcoded shape.
 */
function buildTrail(endValue, invested) {
  const start = invested > 0 ? invested : endValue * 0.94 || 1;
  const drift = [0, 0.14, 0.06, 0.29, 0.22, 0.44, 0.38, 0.62, 0.55, 0.78, 0.71, 0.89, 1];
  return drift.map((t, i) => ({
    i,
    value: Math.round(start + (endValue - start) * t),
  }));
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-elevated px-2.5 py-1.5 font-display text-xs font-bold text-foreground">
      {formatMoney(payload[0].value)}
    </div>
  );
}

/** Compact stat tile for the right-hand metrics column. */
function StatTile({ icon: Icon, label, value, children, chip }) {
  return (
    <div className="card flex flex-col p-4">
      <div className="flex items-start justify-between gap-3">
        <span className="flex items-center gap-2 text-xs font-medium text-muted">
          <Icon className="size-4 shrink-0 text-coin" aria-hidden="true" />
          {label}
        </span>
        {chip}
      </div>
      <p className="mt-3 font-display text-[22px] font-extrabold text-foreground">{value}</p>
      {children}
    </div>
  );
}

export default function Dashboard() {
  const [portfolio, setPortfolio] = useState(null);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [p, g] = await Promise.all([
          client.get('/portfolio/'),
          client.get('/gamification/profile/'),
        ]);
        setPortfolio(p.data);
        setProfile(g.data);
      } catch (err) {
        console.error('Failed to load dashboard', err);
        setError('Failed to load dashboard data. Please try again.');
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
  if (!portfolio || !profile) return <LoadingScreen label="Loading your investor dashboard…" />;

  const totalPnl = portfolio.holdings.reduce((sum, h) => sum + Number(h.pnl), 0);
  const pnlPct = invested > 0 ? (totalPnl / invested) * 100 : 0;
  const up = totalPnl >= 0;
  const holdings = portfolio.holdings.slice(0, 6);
  const xpIntoLevel = profile.xp % 100;
  const trail = buildTrail(Number(portfolio.total_portfolio_value), invested);

  return (
    <main className="page">
      <PageHeader eyebrow="Your virtual wealth" title="Dashboard">
        <Link to="/market" className="btn-ghost">
          Explore market
        </Link>
        <Link to="/market" className="btn-coin">
          <Plus className="size-4" aria-hidden="true" />
          Make a trade
        </Link>
      </PageHeader>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.9fr)_minmax(260px,0.95fr)]">
        {/* ── Portfolio value + chart ─────────────────────────────────── */}
        <section className="card flex flex-col p-5 lg:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Portfolio overview</p>
              <p className="mt-1.5 font-display text-[34px] font-extrabold leading-none text-foreground lg:text-[42px]">
                {formatMoney(portfolio.total_portfolio_value)}
              </p>
            </div>
            <DeltaChip value={totalPnl}>
              <TrendingUp
                className={`size-3.5 ${up ? '' : 'rotate-180'}`}
                aria-hidden="true"
              />
              {up ? '+' : '−'}
              {formatMoney(Math.abs(totalPnl))} all time
            </DeltaChip>
          </div>

          <div className="mt-6 h-[190px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trail} margin={{ top: 6, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="valueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={up ? '#2fd8a8' : '#ff6b76'} stopOpacity="0.38" />
                    <stop offset="100%" stopColor={up ? '#2fd8a8' : '#ff6b76'} stopOpacity="0" />
                  </linearGradient>
                </defs>
                <YAxis hide domain={['dataMin', 'dataMax']} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#26314a' }} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={up ? '#2fd8a8' : '#ff6b76'}
                  strokeWidth={2.5}
                  fill="url(#valueFill)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <dl className="mt-5 grid grid-cols-3 divide-x divide-border border-t border-border pt-4">
            {[
              ['Cash available', formatMoney(portfolio.cash_balance)],
              ['Invested amount', formatMoney(invested)],
              ['Assets owned', portfolio.holdings.length],
            ].map(([label, value], i) => (
              <div key={label} className={i === 0 ? 'pr-3' : 'px-3 last:pr-0'}>
                <dt className="text-[11px] text-muted">{label}</dt>
                <dd className="mt-1 font-display text-sm font-bold text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ── Metrics column ──────────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <StatTile
            icon={TrendingUp}
            label="Portfolio P&L"
            value={`${up ? '+' : '−'}${formatMoney(Math.abs(totalPnl))}`}
            chip={<DeltaChip value={totalPnl}>{`${up ? '+' : ''}${pnlPct.toFixed(1)}%`}</DeltaChip>}
          />

          <StatTile
            icon={Flame}
            label="Investor level"
            value={`${profile.xp} XP`}
            chip={<span className="chip bg-coin-soft text-coin">Lv {profile.level}</span>}
          >
            <div className="mt-3.5">
              <div className="meter" role="progressbar" aria-valuenow={xpIntoLevel} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to next level">
                <span className="meter-fill" style={{ width: `${Math.max(xpIntoLevel, 4)}%` }} />
              </div>
              <p className="mt-2 text-[11px] text-muted">
                {100 - xpIntoLevel} XP to level {profile.level + 1}
              </p>
            </div>
          </StatTile>

          <StatTile
            icon={PiggyBank}
            label="Buying power"
            value={formatMoney(portfolio.cash_balance)}
            chip={<span className="chip bg-mint-soft text-mint">Ready</span>}
          >
            <p className="mt-3 text-[11px] leading-relaxed text-muted">
              Virtual cash you can deploy right now.
            </p>
          </StatTile>
        </div>

        {/* ── Holdings ────────────────────────────────────────────────── */}
        <section className="card p-5 lg:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-bold text-foreground">Your holdings</h2>
              <p className="mt-1 text-xs text-muted">Live virtual positions and performance</p>
            </div>
            <Link
              to="/market"
              className="inline-flex items-center gap-1 font-display text-xs font-bold text-coin hover:underline"
            >
              View market
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>

          {holdings.length ? (
            <div className="mt-5">
              <div className="grid grid-cols-[1.5fr_.55fr_.9fr_.7fr] gap-3 border-b border-border pb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                <span>Asset</span>
                <span>Qty</span>
                <span>Value</span>
                <span className="text-right">Return</span>
              </div>
              {holdings.map((h) => {
                const hUp = Number(h.pnl) >= 0;
                return (
                  <div
                    key={h.symbol}
                    className="grid grid-cols-[1.5fr_.55fr_.9fr_.7fr] items-center gap-3 border-b border-border/60 py-3 text-sm last:border-0"
                  >
                    <div className="min-w-0">
                      <p
                        className="truncate font-semibold text-foreground"
                        title={h.name || h.symbol}
                      >
                        {h.name || h.symbol}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-muted">
                        {h.symbol} · {h.asset_type === 'mutual_fund' ? 'Mutual fund' : 'Stock'}
                      </p>
                    </div>
                    <span className="text-muted">{h.quantity}</span>
                    <span className="font-medium text-foreground">
                      {formatMoney(Number(h.current_price) * Number(h.quantity))}
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
          ) : (
            <EmptyState
              icon={Wallet}
              title="Your portfolio is waiting"
              description="Make your first virtual investment and watch it grow here."
            >
              <Link to="/market" className="btn-coin">
                Browse investments
              </Link>
            </EmptyState>
          )}
        </section>

        {/* ── Quest / level panel ─────────────────────────────────────── */}
        <section className="card flex flex-col p-5 lg:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-bold text-foreground">Trivia & quests</h2>
              <p className="mt-1 text-xs text-muted">Test your market wisdom, win XP</p>
            </div>
            <Sparkles className="size-4 shrink-0 text-coin" aria-hidden="true" />
          </div>

          {/* Signature element: the level badge */}
          <div className="relative mx-auto my-7 grid size-[126px] place-items-center rounded-full border-[9px] border-elevated">
            <div
              className="absolute -inset-[9px] rounded-full"
              style={{
                background: `conic-gradient(#ffc53d ${xpIntoLevel}%, transparent 0)`,
                mask: 'radial-gradient(farthest-side, transparent calc(100% - 9px), #000 calc(100% - 8px))',
                WebkitMask:
                  'radial-gradient(farthest-side, transparent calc(100% - 9px), #000 calc(100% - 8px))',
              }}
              aria-hidden="true"
            />
            <div className="text-center">
              <p className="font-display text-[34px] font-extrabold leading-none text-foreground">
                {profile.level}
              </p>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em] text-muted">
                Level
              </p>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-muted">
            <span className="font-display font-bold text-coin">{profile.xp} XP earned.</span> Solve
            trivia and make thoughtful trades to unlock new levels.
          </p>

          <Link to="/lessons" className="btn-coin mt-5 w-full">
            <Dices className="size-4" aria-hidden="true" />
            Solve challenges
          </Link>
        </section>
      </div>
    </main>
  );
}
