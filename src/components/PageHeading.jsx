import { APP_PAGES } from "./PageNavigation.jsx";

// Gives the selected page a clear title, short explanation, and page position.
export default function PageHeading({ activePage }) {
  const pageIndex = APP_PAGES.findIndex((page) => page.id === activePage);
  const page = APP_PAGES[pageIndex] || APP_PAGES[0];

  return (
    <header className="mb-4 mt-6 flex flex-wrap items-end justify-between gap-3 border-b border-[var(--line)] pb-4">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[var(--teal)]">หน้าทำงาน</p>
        <h2 className="text-2xl font-bold tracking-tight">{page.label}</h2>
        <p className="mt-1 text-sm text-[var(--mute)]">{page.description}</p>
      </div>
      <span className="rounded-full border border-[var(--line)] bg-[var(--card)] px-3 py-1.5 text-xs font-semibold text-[var(--mute)]">
        {pageIndex + 1} / {APP_PAGES.length} หน้า
      </span>
    </header>
  );
}
