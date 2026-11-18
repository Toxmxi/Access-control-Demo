// Defines the independent pages displayed by the application navigation.
export const APP_PAGES = [
  { id: "overview", label: "ภาพรวม", description: "สรุปสถานะและความก้าวหน้าของงานทั้งหมด" },
  { id: "tasks", label: "มติ / ข้อสั่งการ", description: "ค้นหา กรอง และติดตามมติหรือข้อสั่งการ" },
  { id: "problems", label: "ปัญหา / งบประมาณ", description: "ติดตามปัญหา ภาพประกอบ และงบประมาณ" },
  { id: "plan", label: "แผนงาน 3 ปี", description: "ดูโครงการ งบประมาณ และแผนงานรายไตรมาส" },
  { id: "buildings", label: "อาคาร / พื้นที่", description: "ดูผู้รับผิดชอบและความคืบหน้ารายพื้นที่" },
];

// Returns the page represented by the current URL hash, or the default page.
export function getPageFromHash() {
  const pageId = window.location.hash.slice(1);
  return APP_PAGES.some((page) => page.id === pageId) ? pageId : "overview";
}

// Renders only the page links so navigation stays separate from the menu trigger.
export default function PageNavigation({ activePage, onNavigate, firstItemRef }) {
  return (
    <nav aria-label="หน้าต่าง ๆ ของระบบ" className="grid min-w-0 gap-2">
      {APP_PAGES.map((page, index) => (
        <button
          key={page.id}
          ref={index === 0 ? firstItemRef : undefined}
          type="button"
          aria-current={activePage === page.id ? "page" : undefined}
          onClick={() => onNavigate(page.id)}
          className={`flex min-w-0 w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#e8a02c] ${
            activePage === page.id ? "bg-[var(--navy)] text-[var(--button-ink)] shadow-sm" : "text-[var(--ink)] hover:bg-[var(--tint)]"
          }`}
        >
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-xs font-bold ${
            activePage === page.id ? "bg-white/15 text-white" : "bg-[var(--tint)] text-[var(--teal)]"
          }`}>{String(index + 1).padStart(2, "0")}</span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold">{page.label}</span>
            <span className={`mt-0.5 block truncate text-xs leading-normal ${
              activePage === page.id ? "text-white/75" : "text-[var(--mute)]"
            }`}>{page.description}</span>
          </span>
          <svg className={`h-4 w-4 shrink-0 ${activePage === page.id ? "text-white/75" : "text-[var(--mute)]"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      ))}
    </nav>
  );
}
