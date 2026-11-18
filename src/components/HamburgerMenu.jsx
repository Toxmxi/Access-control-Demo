import { useEffect, useRef, useState } from "react";
import { Button } from "./Common.jsx";
import PageNavigation, { APP_PAGES } from "./PageNavigation.jsx";

// Keeps the menu trigger, navigation drawer, and signed-in account controls together.
export default function HamburgerMenu({ user, demoMode, activePage, onNavigate, onSignOut }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const firstItemRef = useRef(null);
  const currentPage = APP_PAGES.find((page) => page.id === activePage) || APP_PAGES[0];
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || "ผู้ใช้งานสำนักงาน";

  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    const focusTimer = window.setTimeout(() => firstItemRef.current?.focus(), 0);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      window.clearTimeout(focusTimer);
    };
  }, [open]);

  const closeMenu = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };
  const selectPage = (pageId) => {
    onNavigate(pageId);
    closeMenu();
  };
  const signOut = () => {
    closeMenu();
    onSignOut?.();
  };

  return (
    <>
      <Button
        ref={triggerRef}
        type="button"
        primary
        aria-expanded={open}
        aria-controls="page-navigation-drawer"
        aria-label={`เปิดเมนู หน้าปัจจุบัน ${currentPage.label}`}
        className="min-w-40 justify-start gap-2.5 px-3 shadow-sm"
        onClick={() => setOpen(true)}
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/15">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </span>
        <span className="font-bold">เมนู</span>
        <span className="ml-auto whitespace-nowrap rounded-lg bg-white/15 px-2 py-1 text-xs font-medium">{currentPage.label}</span>
      </Button>

      {open && (
        <div className="no-print fixed inset-0 z-50">
          <button type="button" className="absolute inset-0 h-full w-full bg-black/55 backdrop-blur-[2px]" aria-label="ปิดเมนู" onClick={closeMenu} />
          <aside
            id="page-navigation-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="page-navigation-title"
            className="absolute inset-y-0 left-0 flex w-[min(88vw,22rem)] flex-col overflow-hidden border-r border-[var(--line)] bg-[var(--card)] text-[var(--ink)] shadow-2xl"
          >
            <header className="flex shrink-0 items-start justify-between bg-gradient-to-br from-[#0d2a49] via-[#12466f] to-[#13917f] p-5 text-white">
              <div>
                <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[10px] font-bold tracking-wider text-white/85">SKP</span>
                <h2 id="page-navigation-title" className="mt-3 text-lg font-bold">เมนูระบบ</h2>
                <p className="mt-1 text-xs text-white/75">เลือกหน้าที่ต้องการทำงาน</p>
              </div>
              <button type="button" aria-label="ปิดเมนู" onClick={closeMenu} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/25 bg-white/10 transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </header>
            <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-3">
              <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[.16em] text-[var(--mute)]">การนำทาง</p>
              <PageNavigation activePage={activePage} onNavigate={selectPage} firstItemRef={firstItemRef} />
            </div>
            <section aria-label="บัญชีผู้ใช้" className="shrink-0 border-t border-[var(--line)] bg-[var(--bg)]/70 p-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[.16em] text-[var(--mute)]">บัญชีผู้ใช้</p>
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-3 shadow-sm">
                <div className="flex min-w-0 items-center gap-3">
                  <span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--navy)] text-lg font-bold text-[var(--button-ink)]">
                    {(displayName || user?.email || "?").slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{demoMode ? "โหมดทดลอง" : displayName}</p>
                    <p className="mt-0.5 truncate text-xs text-[var(--mute)]">{user?.email || "ไม่พบอีเมลบัญชี"}</p>
                  </div>
                </div>
                {demoMode
                  ? <p className="mt-3 border-t border-[var(--line)] pt-2 text-xs leading-relaxed text-[var(--mute)]">โหมดทดลอง · ข้อมูลบันทึกในเบราว์เซอร์นี้</p>
                  : <Button type="button" className="mt-3 w-full border-[#d1495b]/30 text-[#d1495b] hover:bg-[#d1495b]/10" onClick={signOut}>ออกจากระบบ</Button>}
              </div>
            </section>
          </aside>
        </div>
      )}
    </>
  );
}
