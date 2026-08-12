# InvestEd — Gamified Investing Simulator for Students

A full-stack app where students learn to invest using **real market data** and
**fake money**. Django REST Framework backend, React frontend.

## What's included

- **Auth** — JWT-based registration/login (Django `User` model + `simplejwt`)
- **Virtual portfolio** — every new user starts with ₹1,00,000 virtual cash (auto-created via a `post_save` signal, see `backend/portfolio/signals.py`)
- **Live-ish market data** — stocks (via Finnhub, or a mock fallback) and Indian mutual fund NAVs (via `mfapi.in`, no key needed) — see `backend/market/services.py`
- **Trading engine** — atomic buy/sell logic with P&L tracking — see `backend/portfolio/views.py`
- **Lessons + quizzes** — 5 starter lessons with auto-graded quizzes — see `backend/lessons/`
- **Gamification** — XP, levels, badges, leaderboard — see `backend/gamification/`

## Folder structure

```
investsim/
├── backend/                 # Django + DRF API
│   ├── investsim_backend/   # project settings, root urls.py
│   ├── accounts/            # registration endpoint
│   ├── portfolio/           # Portfolio, Holding, Transaction models + trading engine
│   ├── market/               # live price fetching (Finnhub / mfapi.in) + curated security list
│   ├── lessons/              # Lesson content + quiz grading
│   ├── gamification/         # XP, badges, leaderboard
│   ├── manage.py
│   └── requirements.txt
└── frontend/                 # React (Vite) app
    ├── src/
    │   ├── api/client.js         # axios instance, attaches JWT to every request
    │   ├── context/AuthContext.jsx
    │   ├── components/           # Navbar, ProtectedRoute
    │   └── pages/                # Login, Register, Dashboard, Market, Lessons, Leaderboard
    └── package.json
```

## Run it locally

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

python manage.py migrate
python manage.py seed_lessons   # loads the 5 starter lessons + quizzes
python manage.py createsuperuser  # optional, for /admin access

python manage.py runserver      # runs on http://localhost:8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                     # runs on http://localhost:5173
```

Open `http://localhost:5173`, sign up, and you're in — starting cash, live
prices, lessons, and the leaderboard all work immediately with zero API keys.

## Using real stock prices (optional)

By default, stock prices come from a deterministic **mock generator** (see
`_mock_price()` in `backend/market/services.py`) so the app runs instantly
with no setup. To use real live prices:

1. Get a free key at https://finnhub.io
2. Set the `FINNHUB_API_KEY` environment variable before starting Django. For
   PowerShell, for example:
   ```powershell
   $env:FINNHUB_API_KEY = 'your-key-here'
   ```

Mutual fund NAVs already use the real `mfapi.in` API with no key required.
Searching on the Market page queries MFAPI's full Indian scheme catalogue, so
users can select a fund without knowing its scheme code. Stock catalogue search
uses Finnhub after `FINNHUB_API_KEY` is set; without a key the page continues to
show the built-in beginner-friendly stock choices and mock prices.

## Next steps (see the full project guide for the complete roadmap)

- Daily `PortfolioSnapshot` cron job → portfolio value-over-time chart
- SIP simulator (recurring virtual investment into a mutual fund)
- Streak tracking for daily logins
- Deploy backend to Render/Railway (Postgres) + frontend to Vercel
