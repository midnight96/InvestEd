import { Link } from 'react-router-dom';
import { BrandMark } from './Navbar';
import investingPhone from '../assets/investing-phone-login.png';

/**
 * Two-pane auth shell. The left pane is the "arcade" story panel with the
 * signature scoreboard tiles; the right pane holds the form.
 */
export default function AuthLayout({
  headline,
  story,
  stats,
  altLinkLabel,
  altLinkTo,
  children,
}) {
  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      {/* ── Story panel ──────────────────────────────────────────────── */}
      <section className="relative hidden overflow-hidden bg-surface lg:flex lg:w-[46%] lg:flex-col lg:justify-between lg:px-14 lg:py-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(#ffc53d 1px, transparent 1px), linear-gradient(90deg, #ffc53d 1px, transparent 1px)',
            backgroundSize: '38px 38px',
          }}
        />

        <div className="relative">
          <BrandMark />
          <p className="mt-14 max-w-md font-display text-[44px] font-extrabold leading-[1.05] text-foreground text-balance">
            {headline}
          </p>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted text-pretty">{story}</p>
        </div>

        <div className="relative mt-10">
          {/* Signature element: the scoreboard strip */}
          <dl className="grid grid-cols-3 gap-3">
            {stats.map(({ label, value }) => (
              <div key={label} className="rounded-2xl border border-border bg-elevated px-4 py-3.5">
                <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                  {label}
                </dt>
                <dd className="mt-1.5 font-display text-xl font-extrabold text-coin">{value}</dd>
              </div>
            ))}
          </dl>

          <img
            src={investingPhone}
            alt="A phone showing a virtual investing portfolio"
            className="pointer-events-none mt-8 w-full max-w-[300px] opacity-90 mix-blend-screen"
          />
        </div>
      </section>

      {/* ── Form panel ───────────────────────────────────────────────── */}
      <section className="flex flex-1 flex-col px-5 py-7 sm:px-10 lg:px-16 lg:py-12">
        <header className="flex items-center justify-between gap-4">
          <span className="lg:hidden">
            <BrandMark />
          </span>
          <Link
            to={altLinkTo}
            className="ml-auto font-display text-sm font-bold text-coin transition-opacity hover:opacity-80"
          >
            {altLinkLabel}
          </Link>
        </header>

        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-10">
          {children}
        </div>

        <footer className="text-center text-[11px] leading-relaxed text-muted sm:text-left">
          © 2026 InvestEd · Virtual investing practice, not financial advice.
        </footer>
      </section>
    </main>
  );
}
