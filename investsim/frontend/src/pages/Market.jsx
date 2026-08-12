import { useEffect, useRef, useState } from 'react';
import client from '../api/client';

export default function Market() {
  const [securities, setSecurities] = useState(null);
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const orderPanelRef = useRef(null);

  // Load the default catalogue immediately; debounce only typed searches.
  useEffect(() => {
    if (!search) {
      fetchSecurities('');
      return undefined;
    }

    const timer = setTimeout(() => {
      fetchSecurities(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // Load only the selected security's quote. This lets the market list render
  // immediately instead of waiting for a request per visible item.
  useEffect(() => {
    if (!selected?.symbol) return;

    let cancelled = false;
    async function fetchQuote() {
      try {
        setLoadingQuote(true);
        const res = await client.get('/market/quote/', {
          params: {
            symbol: selected.symbol,
            asset_type: selected.asset_type,
          },
        });
        if (!cancelled) {
          setSelected((current) => (
            current?.symbol === selected.symbol
              ? { ...current, price: res.data.price }
              : current
          ));
        }
      } catch (err) {
        if (!cancelled) setMessage('Could not load the current quote.');
      } finally {
        if (!cancelled) setLoadingQuote(false);
      }
    }

    fetchQuote();
    return () => { cancelled = true; };
  }, [selected?.symbol, selected?.asset_type, selected?.quoteRequestId]);

  function selectSecurity(security) {
    setMessage('');
    // A request ID makes selecting the same asset retry a quote after a
    // transient network/provider failure.
    setSelected({ ...security, price: null, quoteRequestId: Date.now() });
    // On compact layouts the order panel sits below the results, so take the
    // learner straight to it after they choose an asset.
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
      setMessage('Failed to load market data.');
    } finally {
      setSearching(false);
    }
  }

  async function trade(txnType) {
    setMessage('');

    try {
      const res = await client.post('/portfolio/trade/', {
        symbol: selected.symbol,
        asset_type: selected.asset_type,
        txn_type: txnType,
        quantity,
      });

      setMessage(`${res.data.detail} at ₹${res.data.price}`);

    } catch (err) {
      setMessage(
        err?.response?.data?.detail || 'Trade failed.'
      );
    }
  }

  if (!securities) {
    return <main className="app-page page-loading">Loading market data...</main>;
  }

  const hasResults =
    securities.stocks.length > 0 ||
    securities.mutual_funds.length > 0;

  return (
    <main className="app-page market-page grid grid-cols-3 gap-6">

      {/* LEFT SIDE */}
      <div className="col-span-2">

        <h1 className="text-2xl font-bold mb-4 text-white">
          Market
        </h1>

        {/* SEARCH BAR */}
        <div className="relative mb-6">

          <div className="flex items-center bg-slate-800/70 border border-white/10 rounded-xl px-4 py-3">

            <span className="text-slate-400 mr-3">
              🔍
            </span>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search the live stock or mutual-fund catalogue..."
              className="bg-transparent outline-none text-white w-full placeholder-slate-500"
            />

            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-slate-400 hover:text-white ml-2"
              >
                ✕
              </button>
            )}

          </div>

          {searching && (
            <p className="text-xs text-slate-500 mt-2">
              Searching...
            </p>
          )}

        </div>

        {/* NO RESULTS */}
        {!hasResults && search && !searching && (
          <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6 text-center">
            <p className="text-slate-300">
              No stocks or mutual funds found.
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Try a company, fund, or scheme name.
            </p>
          </div>
        )}

        {/* STOCKS */}
        {securities.stocks.length > 0 && (
          <>
            <h2 className="text-sm uppercase tracking-wide text-slate-400 mb-2">
              Stocks
            </h2>

            <div className="grid gap-2 mb-6">

              {securities.stocks.map((s) => (
                <SecurityRow
                  key={s.symbol}
                  s={s}
                  onSelect={selectSecurity}
                  selected={selected}
                />
              ))}

            </div>
          </>
        )}

        {/* MUTUAL FUNDS */}
        {securities.mutual_funds.length > 0 && (
          <>
            <h2 className="text-sm uppercase tracking-wide text-slate-400 mb-2">
              Mutual Funds
            </h2>

            <div className="grid gap-2">

              {securities.mutual_funds.map((s) => (
                <SecurityRow
                  key={s.symbol}
                  s={s}
                  onSelect={selectSecurity}
                  selected={selected}
                />
              ))}

            </div>
          </>
        )}

      </div>

      {/* ORDER PANEL */}
      <div ref={orderPanelRef} className="bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-xl shadow-xl p-5 h-fit sticky top-6 scroll-mt-6">

        <h2 className="font-semibold mb-3 text-white">
          Place an order
        </h2>

        {!selected ? (

          <p className="text-sm text-slate-400">
            Select a stock or mutual fund to trade.
          </p>

        ) : (

          <>

            <p className="font-medium text-white">
              {selected.name}
            </p>

            <p className="text-sm text-slate-400 mb-3">
              {loadingQuote || selected.price == null
                ? 'Loading current quote...'
                : `₹${selected.price} / unit`}
            </p>

            <input
              type="number"
              min="0.0001"
              step="any"
              className="bg-slate-900/50 border border-white/20 rounded px-3 py-2 w-full mb-3 text-white focus:outline-none focus:border-emerald-500"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />

            <div className="flex gap-2">

              <button
                onClick={() => trade('buy')}
                disabled={loadingQuote || selected.price == null}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded py-2 font-medium"
              >
                Buy
              </button>

              <button
                onClick={() => trade('sell')}
                disabled={loadingQuote || selected.price == null}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded py-2 font-medium"
              >
                Sell
              </button>

            </div>

            {message && (
              <p className="text-sm mt-3 text-slate-300" role="status">
                {message}
              </p>
            )}

          </>

        )}

      </div>

    </main>
  );
}


function SecurityRow({ s, onSelect, selected }) {

  const isSelected =
    selected?.symbol === s.symbol;

  return (

    <div
      className={`text-left bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-lg shadow-lg px-4 py-3 flex justify-between items-center border-2 w-full ${
        isSelected
          ? 'border-emerald-500'
          : 'border-transparent'
      }`}
    >
      <button onClick={() => onSelect(s)} className="text-left flex-1 min-w-0">

        <p className="font-medium text-white">
          {s.name}
        </p>

        <p className="text-xs text-slate-400">
          {s.symbol}
        </p>

      </button>

      {isSelected ? (
        <button onClick={() => onSelect(s)} className="ml-4 shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md px-3 py-2 text-sm font-medium">
          Place order →
        </button>
      ) : (
        <button onClick={() => onSelect(s)} className="ml-4 shrink-0 font-semibold text-white text-sm">
          {s.price == null ? 'Select' : `₹${s.price}`}
        </button>
      )}

    </div>

  );
}
