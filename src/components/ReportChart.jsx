import { CATEGORIES, TASK_STATES } from "../constants.js";
import { relatedOwners, statusOf } from "../utils.js";
import { BarRow, Card, SectionTitle } from "./Common.jsx";

// Summarizes task progress, owner workload, category progress, and active issues.
export default function ReportChart({ tasks }) {
  const counts = TASK_STATES.map((_, index) => tasks.filter((task) => statusOf(task) === index).length);
  const average = tasks.length ? Math.round(tasks.reduce((sum, task) => sum + Number(task.pg || 0), 0) / tasks.length) : 0;
  const circumference = 2 * Math.PI * 52;
  let offset = 0;
  const arcs = counts.map((count, index) => {
    const length = tasks.length ? (count / tasks.length) * circumference : 0;
    const circle = <circle key={index} r="52" cx="70" cy="70" fill="none" stroke={TASK_STATES[index][1]} strokeWidth="22" strokeDasharray={`${length} ${circumference - length}`} strokeDashoffset={-offset} transform="rotate(-90 70 70)" />;
    offset += length;
    return circle;
  });
  const owners = new Map();
  tasks.forEach((task) => relatedOwners(task).forEach((owner) => {
    const values = owners.get(owner) || [0, 0, 0, 0];
    values[statusOf(task)] += 1;
    owners.set(owner, values);
  }));
  const topOwners = [...owners.entries()].sort((a, b) => b[1].reduce((sum, value) => sum + value, 0) - a[1].reduce((sum, value) => sum + value, 0)).slice(0, 8);
  const maxOwnerCount = Math.max(1, ...topOwners.map(([, values]) => values.reduce((sum, value) => sum + value, 0)));
  const issues = tasks.filter((task) => statusOf(task) === 3 || (task.issue && Number(task.pg) < 100)).slice(0, 6);

  return (
    <>
      <div className="grid gap-2.5 md:grid-cols-[1fr_1.4fr]">
        <Card>
          <SectionTitle>สถานะงานทั้งหมด</SectionTitle>
          <div className="flex flex-wrap items-center gap-4">
            <svg width="145" height="145" viewBox="0 0 140 140" role="img" aria-label="สัดส่วนสถานะงาน">
              <circle r="52" cx="70" cy="70" fill="none" stroke="var(--line)" strokeWidth="22" />
              {arcs}
              <text x="70" y="68" textAnchor="middle" fontSize="26" fontWeight="700" fill="var(--ink)">{average}%</text>
              <text x="70" y="86" textAnchor="middle" fontSize="11" fill="var(--mute)">เฉลี่ย</text>
            </svg>
            <div className="space-y-1.5">
              {TASK_STATES.map(([label, color], index) => <div key={label} className="flex items-center gap-2 text-sm"><i className="h-3 w-3 rounded-sm" style={{ background: color }} />{label}<b>{counts[index]}</b></div>)}
            </div>
          </div>
        </Card>
        <Card>
          <SectionTitle>ภาระงานแยกตามผู้รับผิดชอบ</SectionTitle>
          {topOwners.length ? topOwners.map(([owner, values]) => {
            const total = values.reduce((sum, value) => sum + value, 0);
            return <BarRow key={owner} label={owner} value={total} max={maxOwnerCount} trailing={values.map((count, index) => count ? <i key={index} className="h-full" style={{ flex: count, background: TASK_STATES[index][1] }} /> : null)} />;
          }) : <p className="text-sm text-[var(--mute)]">ยังไม่มีงาน</p>}
        </Card>
      </div>
      <div className="mt-2.5 grid gap-2.5 md:grid-cols-2">
        <Card>
          <SectionTitle>ความก้าวหน้าเฉลี่ยตามหมวดงาน</SectionTitle>
          {CATEGORIES.map((category, index) => {
            const list = tasks.filter((task) => Number(task.cat) === index);
            if (!list.length) return null;
            const averageProgress = Math.round(list.reduce((sum, task) => sum + Number(task.pg || 0), 0) / list.length);
            return <BarRow key={category} label={category} value={averageProgress} color="var(--teal)" />;
          })}
        </Card>
        <Card>
          <SectionTitle>ปัญหา / อุปสรรคที่ต้องเร่งแก้ไข</SectionTitle>
          {issues.length ? issues.map((task) => (
            <div key={task.id} className="border-t border-[var(--line)] py-2 first:border-0">
              <b className="text-sm">{task.topic}</b>
              <p className="text-sm text-[#d1495b]">{task.issue ? `⚠ ${task.issue}` : "⚠ มีงานที่ต้องติดตาม"}</p>
              {task.sol && <p className="text-sm text-[#13917f]">✓ {task.sol}</p>}
            </div>
          )) : <p className="text-sm text-[var(--mute)]">ไม่มีปัญหาที่ค้างอยู่</p>}
        </Card>
      </div>
    </>
  );
}
