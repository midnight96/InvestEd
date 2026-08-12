import { useEffect, useState } from 'react';
import client from '../api/client';

export default function Leaderboard() {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    client.get('/gamification/leaderboard/').then((res) => setRows(res.data));
  }, []);

  if (!rows) return <main className="app-page page-loading">Loading leaderboard...</main>;

  return (
    <main className="app-page leaderboard-page">
      <h1 className="text-2xl font-bold mb-2 text-white">Leaderboard</h1>
      <p className="text-sm text-slate-400 mb-6">
        Ranked by portfolio return %, so everyone starts on equal footing.
      </p>
      <table className="w-full bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-xl shadow-xl overflow-hidden">
       <thead className="bg-slate-800/80 text-left text-sm text-slate-300">
          <tr>
            <th className="p-3">Rank</th>
            <th className="p-3">Student</th>
            <th className="p-3">Return</th>
            <th className="p-3">Portfolio Value</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.username} className="border-t border-white/10">
              <td className="p-3">{i + 1}</td>
              <td className="p-3 font-medium">{r.username}</td>
              <td className={`p-3 font-medium ${r.return_pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {r.return_pct}%
              </td>
              <td className="p-3">₹{r.total_value.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
