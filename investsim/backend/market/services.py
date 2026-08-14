"""
Market data layer. Two real sources are wired in:
  - Finnhub for stocks (needs a free API key -- see README)
  - mfapi.in for Indian mutual fund NAV (no key needed at all)

If FINNHUB_API_KEY is not set, stock prices fall back to a deterministic
mock generator so the whole app runs out-of-the-box with zero setup --
useful for demos/interviews where you don't want to depend on an
external API being up.
"""
import hashlib
import random
from decimal import Decimal

import requests
from django.core.cache import cache
from django.conf import settings

FINNHUB_BASE = 'https://finnhub.io/api/v1'
MFAPI_BASE = 'https://api.mfapi.in/mf'

# A small, curated, learning-friendly universe instead of "every ticker
# that exists" -- keeps the browse screen approachable for beginners.
CURATED_STOCKS = [
    {'symbol': 'RELIANCE.NS', 'name': 'Reliance Industries'},
    {'symbol': 'TCS.NS', 'name': 'Tata Consultancy Services'},
    {'symbol': 'INFY.NS', 'name': 'Infosys'},
    {'symbol': 'HDFCBANK.NS', 'name': 'HDFC Bank'},
    {'symbol': 'AAPL', 'name': 'Apple Inc.'},
    {'symbol': 'MSFT', 'name': 'Microsoft Corp.'},
    {'symbol': 'GOOGL', 'name': 'Alphabet Inc.'},
]

# scheme codes are real AMFI codes usable directly against mfapi.in
CURATED_MUTUAL_FUNDS = [
    {'symbol': '119551', 'name': 'HDFC Mid-Cap Opportunities Fund'},
    {'symbol': '120503', 'name': 'SBI Bluechip Fund'},
    {'symbol': '118989', 'name': 'Axis Long Term Equity Fund'},
]


def search_stocks(query: str, limit: int = 12) -> list[dict]:
    """Search Finnhub's security catalogue when a real-data key is available.

    The small curated list remains the useful, zero-configuration default.  A
    provider search is only made after the user has entered a query, so opening
    the market screen does not spend API quota.
    """
    if not query or not settings.FINNHUB_API_KEY:
        return []

    try:
        resp = requests.get(
            f'{FINNHUB_BASE}/search',
            params={'q': query, 'token': settings.FINNHUB_API_KEY},
            timeout=5,
        )
        resp.raise_for_status()
        results = resp.json().get('result', [])
        return [
            {'symbol': item['symbol'], 'name': item.get('description') or item['symbol']}
            for item in results
            if item.get('symbol') and item.get('type') in {'Common Stock', 'ETP'}
        ][:limit]
    except (requests.RequestException, KeyError, ValueError):
        return []


def search_mutual_funds(query: str, limit: int = 12) -> list[dict]:
    """Search all Indian mutual-fund schemes from MFAPI's public catalogue.

    MFAPI's catalogue is cached for 12 hours: it contains thousands of schemes
    and changes far less often than NAV values.
    """
    if not query:
        return []

    schemes = cache.get('mfapi_scheme_catalogue')
    if schemes is None:
        try:
            resp = requests.get(MFAPI_BASE, timeout=10)
            resp.raise_for_status()
            schemes = resp.json()
            cache.set('mfapi_scheme_catalogue', schemes, 60 * 60 * 12)
        except (requests.RequestException, ValueError):
            return []

    term = query.casefold()
    return [
        {'symbol': str(scheme['schemeCode']), 'name': scheme['schemeName']}
        for scheme in schemes
        if term in scheme.get('schemeName', '').casefold()
        or term in str(scheme.get('schemeCode', ''))
    ][:limit]


def _mock_price(symbol: str) -> Decimal:
    """Deterministic-ish mock price so demos/tests behave consistently."""
    seed = int(hashlib.sha256(symbol.encode()).hexdigest(), 16) % 5000
    base = 50 + seed / 10
    jitter = random.uniform(-0.5, 0.5)  # small live-feeling wiggle
    return Decimal(str(round(base * (1 + jitter / 100), 2)))


def get_stock_price(symbol: str) -> Decimal | None:
    if settings.FINNHUB_API_KEY:
        try:
            resp = requests.get(
                f'{FINNHUB_BASE}/quote',
                params={'symbol': symbol, 'token': settings.FINNHUB_API_KEY},
                timeout=5,
            )
            resp.raise_for_status()
            price = resp.json().get('c')  # current price
            if price:
                return Decimal(str(price))
        except requests.RequestException:
            pass  # fall through to mock so a flaky API doesn't break trading
    return _mock_price(symbol)


def get_mutual_fund_nav(scheme_code: str) -> Decimal | None:
    try:
        resp = requests.get(f'{MFAPI_BASE}/{scheme_code}', timeout=5)
        resp.raise_for_status()
        data = resp.json().get('data', [])
        if data:
            return Decimal(str(data[0]['nav']))
    except (requests.RequestException, KeyError, IndexError, ValueError):
        pass
    return _mock_price(scheme_code)


def get_price(symbol: str, asset_type: str) -> Decimal | None:
    if asset_type == 'mutual_fund':
        return get_mutual_fund_nav(symbol)
    return get_stock_price(symbol)


def get_asset_name(symbol: str, asset_type: str) -> str:
    cache_key = f"asset_name_{symbol}_{asset_type}"
    cached_name = cache.get(cache_key)
    if cached_name:
        return cached_name

    name = symbol

    found = False
    if asset_type == 'stock':
        for s in CURATED_STOCKS:
            if s['symbol'] == symbol:
                name = s['name']
                found = True
                break
    else:
        for m in CURATED_MUTUAL_FUNDS:
            if m['symbol'] == symbol:
                name = m['name']
                found = True
                break

    if not found:
        if asset_type == 'mutual_fund':
            schemes = cache.get('mfapi_scheme_catalogue')
            if schemes:
                for scheme in schemes:
                    if str(scheme['schemeCode']) == symbol:
                        name = scheme['schemeName']
                        found = True
                        break
            if not found:
                try:
                    resp = requests.get(f'{MFAPI_BASE}/{symbol}', timeout=3)
                    if resp.status_code == 200:
                        meta = resp.json().get('meta', {})
                        scheme_name = meta.get('scheme_name')
                        if scheme_name:
                            name = scheme_name
                            found = True
                except Exception:
                    pass
        else:
            if settings.FINNHUB_API_KEY:
                try:
                    resp = requests.get(
                        f'{FINNHUB_BASE}/search',
                        params={'q': symbol, 'token': settings.FINNHUB_API_KEY},
                        timeout=3
                    )
                    if resp.status_code == 200:
                        results = resp.json().get('result', [])
                        for item in results:
                            if item.get('symbol') == symbol:
                                name = item.get('description') or symbol
                                found = True
                                break
                except Exception:
                    pass

    cache.set(cache_key, name, 60 * 60 * 24 * 7)
    return name
