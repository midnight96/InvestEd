import { Loader2 } from 'lucide-react';

/* Shared presentational primitives used across every InvestEd page. */

export const formatMoney = (value) =>
  `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export const formatMoneyExact = (value) =>
  `₹${Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/** Page-level heading with an eyebrow and an optional actions slot. */
export function PageHeader({ eyebrow, title, subtitle, children }) {
  return (
    <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-1.5 font-display text-2xl font-extrabold text-foreground lg:text-[32px]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted text-pretty">{subtitle}</p>
        )}
      </div>
      {children && <div className="flex shrink-0 flex-wrap gap-2.5">{children}</div>}
    </header>
  );
}

/** Full-page centered loading state. */
export function LoadingScreen({ label = 'Loading…' }) {
  return (
    <main className="page">
      <div className="flex min-h-[55vh] flex-col items-center justify-center gap-3">
        <Loader2 className="size-7 animate-spin text-coin" aria-hidden="true" />
        <p className="font-display text-sm font-semibold text-muted">{label}</p>
      </div>
    </main>
  );
}

/** Full-page error state. */
export function ErrorScreen({ message }) {
  return (
    <main className="page">
      <div className="mx-auto mt-16 max-w-md rounded-[var(--radius-card)] border border-coral/30 bg-coral-soft/60 p-6 text-center">
        <h2 className="font-display text-lg font-bold text-foreground">Something went wrong</h2>
        <p className="mt-2 text-sm leading-relaxed text-coral">{message}</p>
      </div>
    </main>
  );
}

/** Inline alert for form / request errors. */
export function Alert({ children }) {
  return (
    <p
      role="alert"
      className="rounded-xl border border-coral/30 bg-coral-soft/60 px-3.5 py-2.5 text-xs font-medium leading-relaxed text-coral"
    >
      {children}
    </p>
  );
}

/** Coloured delta pill: mint when up, coral when down. */
export function DeltaChip({ value, children }) {
  const up = Number(value) >= 0;
  return (
    <span
      className={`chip ${up ? 'bg-mint-soft text-mint' : 'bg-coral-soft text-coral'}`}
    >
      {children}
    </span>
  );
}

/** Empty state with an icon, copy and an optional call to action. */
export function EmptyState({ icon: Icon, title, description, children }) {
  return (
    <div className="flex flex-col items-center px-4 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-2xl border border-border bg-elevated text-coin">
        {Icon && <Icon className="size-6" aria-hidden="true" />}
      </span>
      <h3 className="mt-4 font-display text-base font-bold text-foreground">{title}</h3>
      <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted text-pretty">{description}</p>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
