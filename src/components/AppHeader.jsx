import { Button } from "./Common.jsx";
import HamburgerMenu from "./HamburgerMenu.jsx";
import { APP_PAGES } from "./PageNavigation.jsx";

// Combines the application identity, page menu, and frequently used actions.
export default function AppHeader({
  user,
  demoMode,
  activePage,
  onNavigate,
  onOpenTask,
  onExportTasks,
  onPrint,
  onExportProblems,
  onToggleTheme,
  onSignOut,
}) {
  const currentPage = APP_PAGES.find((page) => page.id === activePage) || APP_PAGES[0];

  return (
    <>
      <div className="no-print sticky top-0 z-40 -mx-3 -mt-4 mb-4 border-b border-[var(--line)] bg-[var(--bg)] px-3 py-2 shadow-sm sm:-mx-5 sm:-mt-6 sm:px-5">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-3">
          <HamburgerMenu user={user} demoMode={demoMode} activePage={activePage} onNavigate={onNavigate} onSignOut={onSignOut} />
          <div className="min-w-0 text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--mute)]">หน้าปัจจุบัน</p>
            <p className="truncate text-sm font-bold">{currentPage.label}</p>
          </div>
        </div>
      </div>
      <header className="relative isolate flex min-h-40 items-center justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-[#0d2a49] via-[#12466f] to-[#13917f] text-white shadow-lg shadow-[#12355b]/15">
        <div className="relative z-10 max-w-3xl p-5 sm:p-8">
          <span className="mb-3 inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-white/90">
            สำนักงาน · พื้นที่ SKP
          </span>
          <h1 className="text-2xl font-bold leading-tight sm:text-3xl">ตารางติดตามผลการปฏิบัติงาน ฝจพ.</h1>
          <p className="mt-2 text-sm leading-relaxed text-white/80">
            มติที่ประชุม · ข้อสั่งการ รอง ผสทอภ. · นโยบาย
          </p>
        </div>
        <svg className="pointer-events-none absolute bottom-0 right-0 hidden w-[42%] max-w-[420px] sm:block" viewBox="0 0 420 150" aria-hidden="true">
          <circle cx="350" cy="36" r="20" fill="#e8a02c" opacity=".9" /><path d="M0 140h420v10H0z" fill="#0b2240" />
          <rect x="30" y="70" width="90" height="70" fill="#0b2240" /><rect x="42" y="82" width="14" height="14" fill="#e8a02c" />
          <rect x="66" y="82" width="14" height="14" fill="#9fd3ff" /><rect x="90" y="82" width="14" height="14" fill="#9fd3ff" />
          <path d="M135 140V80l45-30 45 30v60z" fill="#0f3a63" /><circle cx="180" cy="92" r="12" fill="#13917f" />
          <rect x="250" y="55" width="70" height="85" fill="#0b2240" /><path d="M250 55l35-22 35 22z" fill="#13917f" />
          <g fill="#1c7a5a"><circle cx="350" cy="110" r="22" /><circle cx="378" cy="118" r="16" /></g>
          <rect x="347" y="120" width="6" height="20" fill="#5b3a22" />
        </svg>
      </header>

      <div className="no-print my-4 flex flex-col gap-3 rounded-2xl border border-[var(--line)] bg-[var(--card)] p-3 shadow-sm sm:p-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button primary onClick={onOpenTask}>+ เพิ่มมติ / ข้อสั่งการ</Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={onExportTasks}>ดาวน์โหลดตาราง (CSV)</Button>
          <Button onClick={onPrint}>พิมพ์ / PDF</Button>
          <Button onClick={onExportProblems}>ดาวน์โหลดปัญหา (CSV)</Button>
          <Button onClick={onToggleTheme}>โหมดมืด/สว่าง</Button>
          {demoMode && <span className="rounded-full bg-[var(--tint)] px-3 py-2 text-xs font-semibold text-[var(--mute)]">ทดลอง · บันทึกในเบราว์เซอร์นี้</span>}
        </div>
      </div>
    </>
  );
}
