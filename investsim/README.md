# InvestEd — Gamified Investing Simulator for Students

A full-stack web application where students learn how to invest using **real market data** and **virtual money**. Built using a Django REST Framework backend and a React (Vite) frontend.

---

## 🚀 Live Deployments

* **Frontend**: Hosted on [Netlify](https://investted.netlify.app)
* **Backend API**: Hosted on [Railway](https://gentle-reprieve-production-44f7.up.railway.app)
* **Database**: Managed Serverless PostgreSQL on [Neon](https://neon.tech)

---

## 🛠️ Tech Stack & Production Deployment

### 1. Database (Neon)
* **Provider**: Serverless PostgreSQL
* **ConnectionString**: Injected into Railway backend using the `DATABASE_URL` environment variable.

### 2. Backend (Railway)
* **Framework**: Django REST Framework + SimpleJWT
* **Base Directory**: `investsim/backend`
* **Build Configuration**:
  * **Start Command**: `python manage.py migrate && gunicorn investsim_backend.wsgi --bind 0.0.0.0:$PORT`
  * **Python Version**: `3.10`
* **Environment Variables**:
  * `DATABASE_URL`: `postgresql://...` (Neon Database connection link)
  * `DJANGO_SETTINGS_MODULE`: `investsim_backend.settings`
  * `ALLOWED_HOSTS`: `*`
  * `PYTHON_VERSION`: `3.10`

### 3. Frontend (Netlify)
* **Framework**: React 19 (Vite) + HashRouter (eliminates 404 router issues on static hostings)
* **Base Directory**: `investsim/frontend`
* **Build Configuration**:
  * **Build Command**: `npm run build`
  * **Publish Directory**: `dist`
* **Environment Variables**:
  * `VITE_API_URL`: `https://gentle-reprieve-production-44f7.up.railway.app/api`

---

## 💎 Features

- **Auth** — Clickable helper links redirecting missing profiles. JWT-based registration/login (Django `User` model + `simplejwt`).
- **Virtual Portfolio** — Every new user starts with ₹1,00,000 virtual cash (auto-created via a `post_save` signal, see `backend/portfolio/signals.py`).
- **Live-ish Market Data** — Stocks (via Finnhub, or a mock fallback) and Indian mutual fund NAVs (via `mfapi.in`, no key needed) — see `backend/market/services.py`.
- **Trading Engine** — Atomic buy/sell logic with P&L tracking — see `backend/portfolio/views.py`.
- **Trivia & Challenges** — Gamified stock market trivia and trading challenges with difficulty levels giving users XP to level up — see `backend/lessons/`.
- **Gamification** — XP, levels, badges, and leaderboard — see `backend/gamification/`.

---

## 📂 Folder Structure

```
investsim/
├── backend/                 # Django + DRF API
│   ├── investsim_backend/   # project settings, root urls.py
│   ├── accounts/            # registration endpoint
│   ├── portfolio/           # Portfolio, Holding, Transaction models + trading engine
│   ├── market/               # live price fetching (Finnhub / mfapi.in) + curated security list
│   ├── lessons/              # Trivia and scenario challenges
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

---

## 💻 Running Locally

### 1. Run Backend

```bash
cd investsim/backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

python manage.py migrate
python manage.py seed_lessons   # loads the starter trivia challenges
python manage.py createsuperuser  # optional, for /admin access

python manage.py runserver      # runs on http://localhost:8000
```

### 2. Run Frontend

```bash
cd investsim/frontend
npm install
npm run dev                     # runs on http://localhost:5173
```
