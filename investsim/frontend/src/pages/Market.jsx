import { useEffect, useRef, useState } from 'react';
import {
  Check,
  Landmark,
  Loader2,
  Search,
  SearchX,
  TrendingUp,
  X,
} from 'lucide-react';
import client from '../api/client';
import { Alert, LoadingScreen, PageHeader } from '../components/ui';

function SecurityRow({ security, onSelect, isSelected }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(security)}
      aria-pressed={isSelected}
      className={`flex w-full items-center justify-between gap-4 rounded-xl border bg-surface px-4 py-3 text-left transition-all duration-150 ${
        isSelected
          ? 'border-coin bg-coin-soft/40'
          : 'border-border hover:-translate-y-0.5 hover:border-coin/45'
      }`}
    >
      <span className="min-w-0">
        <span className="block truncate font-semibold text-foreground">{security.name}</span>
        <span className="mt-0.5 block truncate text-[11px] text-muted">{security.symbol}</span>
      </span>

      <span
        className={`shrink-0 font-display text-sm font-bold ${
          isSelected ? 'text-coin' : 'text-foreground'
        }`}
      >
        {isSelected ? (
          <span className="flex items-center gap-1.5">
            <Check className="size-4" aria-hidden="true" />
            Selected
          </span>
        ) : security.price == null ? (
          'Select'
        ) : (
          `₹${security.price}`
        )}
      </span>
    </button>
  );
}

function SecurityGroup({ icon: Icon, title, items, onSelect, selected }) {
  if (!items.length) return null;
  return (
    <section className="mt-6 first:mt-0">
      <h2 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
        <Icon className="size-3.5 text-coin" aria-hidden="true" />
        {title}
        <span className="rounded-full bg-elevated px-2 py-0.5 text-[10px] text-muted">
          {items.length}
        </span>
      </h2>
      <div className="mt-3 grid gap-2">
        {items.map((s) => (
          <SecurityRow
            key={s.symbol}
            security={s}
            onSelect={onSelect}
            isSelected={selected?.symbol === s.symbol}
          />
        ))}
      </div>
    </section>
  );
}

export default function Market() {
  const [securities, setSecurities] = useState(null);
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [trading, setTrading] = useState(false);
  const orderPanelRef = useRef(null);

  // Load the default catalogue immediately; debounce only typed searches.
  useEffect(() => {
    if (!search) {
      fetchSecurities('');
      return undefined;
    }
    const timer = setTimeout(() => fetchSecurities(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Load only the selected security's quote so the list renders immediately.
  useEffect(() => {
    if (!selected?.symbol) return undefined;

    let cancelled = false;
    async function fetchQuote() {
      try {
        setLoadingQuote(true);
        const res = await client.get('/market/quote/', {
          params: { symbol: selected.symbol, asset_type: selected.asset_type },
        });
        if (!cancelled) {
          setSelected((current) =>
            current?.symbol === selected.symbol ? { ...current, price: res.data.price } : current,
          );
        }
      } catch {
        if (!cancelled) {
          setIsError(true);
          setMessage('Could not load the current quote.');
        }
      } finally {
        if (!cancelled) setLoadingQuote(false);
      }
    }

    fetchQuote();
    return () => {
      cancelled = true;
    };
  }, [selected?.symbol, selected?.asset_type, selected?.quoteRequestId]);

  function selectSecurity(security) {
    setMessage('');
    setIsError(false);
    // A request ID lets re-selecting the same asset retry a failed quote.
    setSelected({ ...security, price: null, quoteRequestId: Date.now() });
    window.setTimeout(() => {
      orderPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }

  async function fetchSecurities(query) {
    try {
      setSearching(true);
      const res = await client.get('/market/securities/', {
        params: query ? { search: query } : {},
      });
      setSecurities(res.data);
    } catch (err) {
      console.error('Failed to load securities:', err);
      setIsError(true);
      setMessage('Failed to load market data.');
    } finally {
      setSearching(false);
    }
  }

  async function trade(txnType) {
    setMessage('');
    setIsError(false);
    setTrading(true);
    try {
      const res = await client.post('/portfolio/trade/', {
        symbol: selected.symbol,
        asset_type: selected.asset_type,
        txn_type: txnType,
        quantity,
      });
      setMessage(`${res.data.detail} at ₹${res.data.price}`);
    } catch (err) {
      setIsError(true);
      setMessage(err?.response?.data?.detail || 'Trade failed.');
    } finally {
      setTrading(false);
    }
  }

  if (!securities) return <LoadingScreen label="Loading market data…" />;

  const hasResults = securities.stocks.length > 0 || securities.mutual_funds.length > 0;
  const quoteReady = !loadingQuote && selected?.price != null;
  const estimate = quoteReady ? Number(selected.price) * Number(quantity || 0) : null;

  return (
    <main className="page">
      <PageHeader
        eyebrow="Live catalogue"
        title="Market"
        subtitle="Search real stocks and mutual funds, then place a virtual order with practice cash."
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.8fr)_minmax(280px,0.85fr)]">
        {/* ── Catalogue ───────────────────────────────────────────────── */}
        <div className="min-w-0">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 focus-within:border-coin">
            <Search className="size-4 shrink-0 text-muted" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search a company, fund or scheme…"
              aria-label="Search stocks and mutual funds"
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted/60"
            />
            {searching && (
              <Loader2 className="size-4 shrink-0 animate-spin text-coin" aria-hidden="true" />
            )}
            {search && !searching && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="shrink-0 rounded-md p-0.5 text-muted transition-colors hover:text-foreground"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            )}
          </div>

          {!hasResults && search && !searching ? (
            <div className="card mt-5 px-4 py-12 text-center">
              <SearchX className="mx-auto size-7 text-muted" aria-hidden="true" />
              <p className="mt-3 font-display text-base font-bold text-foreground">
                No matches found
              </p>
              <p className="mt-1.5 text-sm text-muted">Try a company, fund, or scheme name.</p>
            </div>
          ) : (
            <div className="mt-5">
              <SecurityGroup
                icon={TrendingUp}
                title="Stocks"
                items={securities.stocks}
                onSelect={selectSecurity}
                selected={selected}
              />
              <SecurityGroup
                icon={Landmark}
                title="Mutual funds"
                items={securities.mutual_funds}
                onSelect={selectSecurity}
                selected={selected}
              />
            </div>
          )}
        </div>

        {/* ── Order ticket ────────────────────────────────────────────── */}
        <aside
          ref={orderPanelRef}
          className="card h-fit scroll-mt-6 p-5 lg:sticky lg:top-6"
        >
          <h2 className="font-display text-base font-bold text-foreground">Place an order</h2>

          {!selected ? (
            <p className="mt-2.5 text-sm leading-relaxed text-muted">
              Pick a stock or mutual fund from the catalogue to build your order.
            </p>
          ) : (
            <>
              <div className="mt-4 rounded-xl border border-border bg-elevated p-3.5">
                <p className="font-semibold leading-snug text-foreground">{selected.name}</p>
                <p className="mt-1 text-[11px] text-muted">{selected.symbol}</p>
                <p className="mt-3 font-display text-xl font-extrabold text-coin">
                  {quoteReady ? `₹${selected.price}` : 'Loading quote…'}
                  {quoteReady && (
                    <span className="ml-1 font-sans text-[11px] font-medium text-muted">
                      / unit
                    </span>
                  )}
                </p>
              </div>

              <label className="mt-4 flex flex-col gap-2">
                <span className="font-display text-xs font-bold uppercase tracking-wider text-muted">
                  Quantity
                </span>
                <input
                  type="number"
                  min="0.0001"
                  step="any"
                  className="field"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </label>

              <div className="mt-3.5 flex items-center justify-between rounded-xl bg-elevated px-3.5 py-2.5">
                <span className="text-xs text-muted">Estimated total</span>
                <span className="font-display text-sm font-bold text-foreground">
                  {estimate == null
                    ? '—'
                    : `₹${estimate.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
                </span>
              </div>

              <div className="mt-4 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => trade('buy')}
                  disabled={!quoteReady || trading}
                  className="btn-mint flex-1"
                >
                  Buy
                </button>
                <button
                  type="button"
                  onClick={() => trade('sell')}
                  disabled={!quoteReady || trading}
                  className="btn-coral flex-1"
                >
                  Sell
                </button>
              </div>

              {message &&
                (isError ? (
                  <div className="mt-3.5">
                    <Alert>{message}</Alert>
                  </div>
                ) : (
                  <p
                    role="status"
                    className="mt-3.5 rounded-xl border border-mint/30 bg-mint-soft/60 px-3.5 py-2.5 text-xs font-medium leading-relaxed text-mint"
                  >
                    {message}
                  </p>
                ))}
            </>
          )}
        </aside>
      </div>
    </main>
  );
}
