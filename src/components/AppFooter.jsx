// Shows application identity and reminds demo users where their data is stored.
export default function AppFooter({ demoMode }) {
  return (
    <footer className="mt-10 border-t border-[var(--line)] py-6">
      <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-bold">ระบบติดตามผลการปฏิบัติงาน ฝจพ.</p>
          <p className="mt-1 text-xs text-[var(--mute)]">มติ · ปัญหา · แผนงาน · พื้นที่รับผิดชอบ · SKP</p>
        </div>
        <p className="rounded-xl bg-[var(--tint)] px-3 py-2 text-xs text-[var(--mute)]">
          {demoMode ? "โหมดทดลอง: ข้อมูลอยู่ในเบราว์เซอร์นี้เท่านั้น" : "ข้อมูลใช้งานร่วมกันผ่านฐานข้อมูลสำนักงาน"}
        </p>
      </div>
    </footer>
  );
}
