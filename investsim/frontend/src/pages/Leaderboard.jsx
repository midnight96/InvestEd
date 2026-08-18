import { useEffect, useState } from 'react';
import { Crown, Medal, Trophy } from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  EmptyState,
  ErrorScreen,
  LoadingScreen,
  PageHeader,
  formatMoney,
} from '../components/ui';

const PODIUM = [
  { icon: Crown, className: 'bg-coin text-coin-ink' },
  { icon: Medal, className: 'bg-[#c8d2e4] text-[#1b2436]' },
  { icon: Medal, className: 'bg-[#c98a53] text-[#231205]' },
];

function RankBadge({ index }) {
  const podium = PODIUM[index];
  if (!podium) {
    return (
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-elevated font-display text-xs font-bold text-muted">
        {index + 1}
      </span>
    );
  }
  const Icon = podium.icon;
  return (
    <span
      className={`grid size-8 shrink-0 place-items-center rounded-lg shadow-[0_2px_0_0_#00000055] ${podium.className}`}
      title={`Rank ${index + 1}`}
    >
      <Icon className="size-4" aria-hidden="true" />
    </span>
  );
}

export default function Leaderboard() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const { username } = useAuth();

  useEffect(() => {
    client
      .get('/gamification/leaderboard/')
      .then((res) => setRows(res.data))
      .catch((err) => {
        console.error('Failed to load leaderboard', err);
        setError('Failed to load the leaderboard. Please try again.');
      });
  }, []);

  if (error) return <ErrorScreen message={error} />;
  if (!rows) return <LoadingScreen label="Loading leaderboard…" />;

  return (
    <main className="page">
      <PageHeader
        eyebrow="Class standings"
        title="Leaderboard"
        subtitle="Ranked by portfolio return percentage, so everyone competes on equal footing regardless of starting size."
      >
        <span className="chip bg-coin-soft text-coin">
          <Trophy className="size-3.5" aria-hidden="true" />
          {rows.length} investors
        </span>
      </PageHeader>

      {rows.length === 0 ? (
        <div className="card mt-6 max-w-3xl">
          <EmptyState
            icon={Trophy}
            title="No rankings yet"
            description="Once students start trading, the standings will appear here."
          />
        </div>
      ) : (
        <div className="card mt-6 max-w-3xl overflow-hidden">
          {/* Header row */}
          <div className="hidden grid-cols-[auto_1fr_auto_auto] items-center gap-4 border-b border-border bg-elevated px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-muted sm:grid">
            <span className="w-8">#</span>
            <span>Student</span>
            <span className="w-24 text-right">Return</span>
            <span className="w-32 text-right">Portfolio</span>
          </div>

          <ul>
            {rows.map((r, i) => {
              const up = Number(r.return_pct) >= 0;
              const isMe = r.username === username;
              return (
                <li
                  key={r.username}
                  className={`grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-1 border-b border-border/60 px-5 py-3.5 last:border-0 sm:grid-cols-[auto_1fr_auto_auto] ${
                    isMe ? 'bg-coin-soft/35' : ''
                  }`}
                >
                  <RankBadge index={i} />

                  <div className="min-w-0">
                    <p className="truncate font-display text-sm font-bold text-foreground">
                      {r.username}
                      {isMe && (
                        <span className="ml-2 rounded-full bg-coin px-1.5 py-0.5 align-middle text-[9px] font-extrabold uppercase tracking-wider text-coin-ink">
                          You
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted sm:hidden">
                      {formatMoney(r.total_value)}
                    </p>
                  </div>

                  <span
                    className={`w-24 text-right font-display text-sm font-extrabold ${
                      up ? 'text-mint' : 'text-coral'
                    }`}
                  >
                    {up ? '+' : ''}
                    {r.return_pct}%
                  </span>

                  <span className="hidden w-32 text-right text-sm text-muted sm:block">
                    {formatMoney(r.total_value)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </main>
  );
}
