import { useEffect } from "react";

// Shared button style used by action bars and table actions.
export function Button({ children, primary = false, className = "", ...props }) {
  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center rounded-xl border px-3.5 py-2 text-sm font-semibold transition-colors hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50 ${
        primary
          ? "border-[var(--navy)] bg-[var(--navy)] text-[var(--button-ink)]"
          : "border-[var(--line)] bg-[var(--card)] text-[var(--ink)]"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// Provides a consistent bordered surface for dashboard content.
export function Card({ children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4 shadow-sm sm:p-5 ${className}`}>
      {children}
    </section>
  );
}

// Renders the standard heading for a section or card.
export function SectionTitle({ children, className = "" }) {
  return <h2 className={`mb-3 border-b border-[var(--line)] pb-2 text-base font-bold ${className}`}>{children}</h2>;
}

// Displays a responsive set of summary metrics.
export function Kpis({ items, compact = false }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(145px,1fr))] gap-3">
      {items.map(([label, value, color]) => (
        <div key={label} className="rounded-2xl border border-[var(--line)] border-l-[6px] bg-[var(--card)] px-4 py-3.5" style={{ borderLeftColor: color }}>
          <span className="block text-sm text-[var(--mute)]">{label}</span>
          <b className={`mt-1 block leading-tight ${compact || String(value).length > 12 ? "text-lg" : "text-[26px]"}`}>{value}</b>
        </div>
      ))}
    </div>
  );
}

// Draws a labeled progress bar or a caller-provided stacked bar.
export function BarRow({ label, value, displayValue, max = 100, color = "var(--teal)", trailing, className = "" }) {
  const width = Math.max(0, Math.min(100, max ? (value / max) * 100 : 0));
  return (
    <div className={`grid grid-cols-[minmax(90px,130px)_1fr_42px] items-center gap-2 py-1 text-[13px] ${className}`}>
      <span className="truncate" title={label}>{label}</span>
      <div className="flex h-3.5 overflow-hidden rounded-full bg-[var(--tint)]">
        {trailing || <i className="h-full rounded-full" style={{ width: `${width}%`, background: color }} />}
      </div>
      <b className="text-right">{trailing ? displayValue ?? value : `${Math.round(value)}${max === 100 ? "%" : ""}`}</b>
    </div>
  );
}

// Provides a modal container with backdrop and Escape-key dismissal.
export function Dialog({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-3" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section role="dialog" aria-modal="true" aria-labelledby="dialog-title" className={`max-h-[92vh] w-full overflow-y-auto rounded-2xl bg-[var(--card)] text-[var(--ink)] shadow-2xl ${wide ? "max-w-4xl" : "max-w-2xl"}`}>
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--line)] bg-[var(--card)] px-5 py-4">
          <h2 id="dialog-title" className="font-bold">{title}</h2>
          <button type="button" className="rounded-lg px-2 py-1 text-xl text-[var(--mute)] hover:bg-[var(--tint)]" onClick={onClose} aria-label="ปิด">×</button>
        </header>
        <div className="p-5">{children}</div>
      </section>
    </div>
  );
}

// Associates a visible caption with a form control.
export function Field({ label, children, className = "" }) {
  return <label className={`grid gap-1 text-sm text-[var(--mute)] ${className}`}><span>{label}</span>{children}</label>;
}

// Applies the standard input colors, border, spacing, and sizing.
export function inputClass(extra = "") {
  return `min-w-0 rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-[var(--ink)] ${extra}`;
}

// Lets editors choose one or more buildings for a task or project.
export function CheckList({ buildings, selected = [] }) {
  return (
    <fieldset className="rounded-xl border border-[var(--line)] p-3">
      <legend className="px-1 text-sm text-[var(--mute)]">อาคาร/พื้นที่ (ไม่เลือก = ส่วนกลาง)</legend>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {buildings.map((building) => (
          <label key={building.n} className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="bld" value={building.n} defaultChecked={selected.includes(building.n)} />
            {building.n}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
