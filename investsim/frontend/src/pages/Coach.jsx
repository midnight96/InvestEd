import { useState, useRef, useEffect } from 'react';
import { Bot, Lightbulb, SendHorizontal, Sparkles } from 'lucide-react';
import client from '../api/client';
import { Alert } from '../components/ui';

const SUGGESTIONS = [
  'Explain compound interest to a 15-year-old.',
  'What is the difference between a growth fund and a dividend stock?',
  'How does inflation affect my savings over time?',
  'Give me an analogy for diversification.',
];

const GREETING = {
  role: 'model',
  text: "Hi! I'm your **InvestEd AI Coach**. Ask me anything about stock markets, mutual funds, budgeting, inflation, or how to diversify a portfolio. What would you like to learn today?",
};

/** Minimal inline markdown: **bold** plus `-`/`*` bullets. */
function MessageBody({ text }) {
  if (!text) return null;
  const lines = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').split('\n');

  return (
    <div className="flex flex-col gap-1.5">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <span key={idx} className="h-1" />;
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          return (
            <span key={idx} className="flex gap-2 leading-relaxed">
              <span aria-hidden="true" className="mt-[7px] size-1.5 shrink-0 rounded-full bg-coin" />
              <span dangerouslySetInnerHTML={{ __html: trimmed.slice(2) }} />
            </span>
          );
        }
        return (
          <p key={idx} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: trimmed }} />
        );
      })}
    </div>
  );
}

export default function Coach() {
  const [messages, setMessages] = useState([GREETING]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function handleSend(textToSend) {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    if (!textToSend) setInputText('');
    setError('');

    const updatedMessages = [...messages, { role: 'user', text }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const response = await client.post('/lessons/chatbot/', { messages: updatedMessages });
      if (response.data?.text) {
        setMessages((prev) => [...prev, { role: 'model', text: response.data.text }]);
      } else {
        setError('Received an empty response from the AI coach.');
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || 'Failed to contact your AI Coach. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    // Don't submit while a CJK IME is composing the current character.
    if (e.key !== 'Enter' || e.shiftKey || e.nativeEvent.isComposing || e.keyCode === 229) return;
    e.preventDefault();
    handleSend();
  }

  return (
    <main className="mx-auto flex h-[calc(100svh-61px)] w-full max-w-[1440px] flex-col px-5 pt-5 pb-[76px] lg:h-screen lg:px-10 lg:py-8">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-coin text-coin-ink shadow-[0_3px_0_0_#a37200]">
            <Bot className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="font-display text-xl font-extrabold text-foreground">
              AI Financial Coach
            </h1>
            <p className="text-xs text-muted">Ask anything about money, markets and investing</p>
          </div>
        </div>
        <span className="chip bg-mint-soft text-mint">
          <span className="size-1.5 animate-pulse rounded-full bg-mint" aria-hidden="true" />
          Online
        </span>
      </header>

      {/* ── Chat + sidebar ──────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 gap-5 pt-4">
        <section className="card flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 lg:p-5">
            <div className="flex flex-col gap-4">
              {messages.map((msg, i) => {
                const isUser = msg.role === 'user';
                return (
                  <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm lg:max-w-[78%] ${
                        isUser
                          ? 'rounded-br-md bg-coin text-coin-ink'
                          : 'rounded-bl-md border border-border bg-elevated text-foreground'
                      }`}
                    >
                      {!isUser && (
                        <p className="mb-1.5 font-display text-[10px] font-bold uppercase tracking-[0.16em] text-coin">
                          Coach
                        </p>
                      )}
                      <MessageBody text={msg.text} />
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2.5 rounded-2xl rounded-bl-md border border-border bg-elevated px-4 py-3.5">
                    <span className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-coin">
                      Coach
                    </span>
                    <span className="flex items-center gap-1">
                      {[0, 150, 300].map((delay) => (
                        <span
                          key={delay}
                          className="size-1.5 animate-bounce rounded-full bg-muted"
                          style={{ animationDelay: `${delay}ms` }}
                        />
                      ))}
                    </span>
                  </div>
                </div>
              )}

              {error && <Alert>{error}</Alert>}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Suggestion chips — mobile only, and only before the first question */}
          {messages.length === 1 && (
            <div className="shrink-0 border-t border-border px-3.5 py-3 xl:hidden">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSend(suggestion)}
                    disabled={loading}
                    className="shrink-0 rounded-full border border-border bg-elevated px-3.5 py-2 text-xs text-muted transition-colors hover:border-coin/45 hover:text-foreground"
                  >
                    {suggestion.length > 38 ? `${suggestion.slice(0, 36)}…` : suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Composer */}
          <div className="shrink-0 border-t border-border bg-elevated/60 p-3.5">
            <div className="flex items-end gap-2.5">
              <textarea
                className="field max-h-32 min-h-[46px] flex-1 resize-none py-3"
                rows={1}
                placeholder="Ask anything — e.g. how does inflation work?"
                aria-label="Message the AI coach"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={loading || !inputText.trim()}
                aria-label="Send message"
                className="btn-coin size-[46px] shrink-0 px-0"
              >
                <SendHorizontal className="size-[18px]" aria-hidden="true" />
              </button>
            </div>
            <p className="mt-2 px-1 text-[10px] text-muted">
              Educational guidance only — not financial advice.
            </p>
          </div>
        </section>

        {/* ── Prompt sidebar (desktop) ──────────────────────────────── */}
        <aside className="hidden w-[300px] shrink-0 flex-col gap-4 overflow-y-auto xl:flex">
          <div className="card p-4">
            <h2 className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.14em] text-coin">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Try asking
            </h2>
            <div className="mt-3.5 flex flex-col gap-2.5">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSend(suggestion)}
                  disabled={loading}
                  className="rounded-xl border border-border bg-elevated px-3.5 py-2.5 text-left text-xs leading-relaxed text-muted transition-all duration-150 hover:-translate-y-0.5 hover:border-coin/45 hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <h2 className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.14em] text-foreground">
              <Lightbulb className="size-3.5 text-coin" aria-hidden="true" />
              Tip
            </h2>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              Your Coach explains things step by step. Follow up on anything that stays fuzzy:
            </p>
            <ul className="mt-2.5 flex flex-col gap-1.5 text-xs italic leading-relaxed text-muted/80">
              <li>&ldquo;Can you give me another analogy?&rdquo;</li>
              <li>&ldquo;How does that relate to a mutual fund?&rdquo;</li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
