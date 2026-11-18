import {
  BUDGET_STATES,
  CATEGORIES,
  CATEGORY_COLORS,
  PRIORITIES,
  PRIORITY_COLORS,
  PROBLEM_STATES,
  SOURCES,
  TASK_STATES,
} from "../constants.js";
import { formatBaht, quarterLabel, sourceName, statusLabel, statusOf, taskBuildings } from "../utils.js";
import { BarRow, Button, Card, Kpis, SectionTitle, inputClass } from "./Common.jsx";
import ReportChart from "./ReportChart.jsx";

const BUILDING_PAGE_SIZE = 10;

function getBuildingPageItems(currentPage, pageCount) {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1);
  if (currentPage <= 3) return [1, 2, 3, 4, "ellipsis-end", pageCount];
  if (currentPage >= pageCount - 2) return [1, "ellipsis-start", pageCount - 3, pageCount - 2, pageCount - 1, pageCount];
  return [1, "ellipsis-start", currentPage - 1, currentPage, currentPage + 1, "ellipsis-end", pageCount];
}

// Shows the task KPI summary and the charts for the overall dashboard.
export function OverviewSection({ tasks, taskKpis }) {
  return (
    <section id="overview" className="scroll-mt-20">
      <div className="mb-2.5"><Kpis items={taskKpis} /></div>
      <ReportChart tasks={tasks} />
    </section>
  );
}

// Displays problem records, budget totals, image previews, and problem filters.
export function ProblemsSection({
  problems,
  filteredProblems,
  problemBudgetTotals,
  problemFilters,
  setProblemFilters,
  openProblem,
  setLightbox,
}) {
  const maxBudget = Math.max(1, ...problems.map((problem) => Number(problem.amt) || 0));

  return (
    <section id="problems" className="scroll-mt-20">
      <Card className="my-2.5">
        <SectionTitle>ทะเบียนปัญหา / อุปสรรค · รูปภาพ · งบประมาณ</SectionTitle>
        <Kpis items={[
          ["ปัญหาทั้งหมด", `${problems.length} เรื่อง`, "#12355b"],
          ["ยังแก้ไม่เสร็จ", `${problems.filter((problem) => Number(problem.status) < 2).length} เรื่อง`, "#d1495b"],
          ["งบที่ต้องใช้รวม", `${formatBaht(problemBudgetTotals.need)} บาท`, "#e8a02c"],
          ["ได้รับจัดสรรแล้ว", `${formatBaht(problemBudgetTotals.granted)} บาท`, "#13917f"],
          ["ยังไม่ได้รับ", `${formatBaht(problemBudgetTotals.waiting)} บาท`, "#5b7fa6"],
        ]} compact />
        <SectionTitle className="mt-4">งบประมาณรายปัญหา (บาท)</SectionTitle>
        {problems.filter((problem) => Number(problem.amt) > 0).length
          ? problems.filter((problem) => Number(problem.amt) > 0).sort((a, b) => b.amt - a.amt).map((problem) => (
            <BarRow
              key={problem.id}
              label={problem.title}
              value={Number(problem.amt)}
              displayValue={formatBaht(problem.amt)}
              max={maxBudget}
              color={BUDGET_STATES[problem.bst]?.[1] || "#9aa9b8"}
              trailing={<i className="h-full rounded-full" style={{ width: `${Number(problem.amt) / maxBudget * 100}%`, background: BUDGET_STATES[problem.bst]?.[1] || "#9aa9b8" }} />}
            />
          ))
          : <p className="text-sm text-[var(--mute)]">ยังไม่มีปัญหาที่ระบุงบประมาณ</p>}
        <div className="no-print my-3 flex flex-wrap gap-2">
          <Button primary onClick={() => openProblem()}>+ เพิ่มปัญหา</Button>
          <select aria-label="กรองสถานะปัญหา" className={inputClass()} value={problemFilters.status} onChange={(event) => setProblemFilters((value) => ({ ...value, status: event.target.value }))}>
            <option value="">ทุกสถานะปัญหา</option>{PROBLEM_STATES.map(([label], index) => <option key={label} value={index}>{label}</option>)}
          </select>
          <select aria-label="กรองสถานะงบ" className={inputClass()} value={problemFilters.budget} onChange={(event) => setProblemFilters((value) => ({ ...value, budget: event.target.value }))}>
            <option value="">ทุกสถานะงบ</option>{BUDGET_STATES.map(([label], index) => <option key={label} value={index}>{label}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-2.5">
          {filteredProblems.length ? filteredProblems.map((problem) => (
            <article key={problem.id} className="overflow-hidden rounded-xl border border-[var(--line)]">
              <div className="flex h-28 gap-0.5 bg-[var(--tint)]">
                {(problem.img || []).slice(0, 3).map((image, index) => <button key={`${problem.id}-${index}`} className="min-w-0 flex-1 cursor-zoom-in" onClick={() => setLightbox(image)} aria-label="ขยายรูปภาพ"><img src={image} alt={`รูปปัญหา ${problem.title}`} className="h-full w-full object-cover" /></button>)}
                {!(problem.img || []).length && <span className="m-auto text-sm text-[var(--mute)]">ยังไม่มีรูปภาพ</span>}
                {(problem.img || []).length > 3 && <span className="absolute" />}
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between gap-2"><b>{problem.title}</b><Button className="px-2 py-1" onClick={() => openProblem(problem)}>แก้ไข</Button></div>
                <p className="mt-1 text-xs text-[var(--mute)]">{problem.date} {(problem.bld || []).join(" · ")}</p>
                {problem.desc && <p className="my-2 text-sm">{problem.desc}</p>}
                <span className="mr-1 inline-block rounded-full px-2.5 py-1 text-xs font-bold text-white" style={{ background: PROBLEM_STATES[problem.status]?.[1] || "#9aa9b8" }}>{statusLabel(PROBLEM_STATES, problem.status)}</span>
                <span className="inline-block rounded-full px-2.5 py-1 text-xs font-bold text-white" style={{ background: BUDGET_STATES[problem.bst]?.[1] || "#9aa9b8" }}>{statusLabel(BUDGET_STATES, problem.bst)}</span>
                <p className="mt-2 text-sm">งบที่ใช้ <b>{formatBaht(problem.amt)}</b> บาท{Number(problem.bst) === 3 && <> · ได้รับ <b>{formatBaht(problem.got || problem.amt)}</b> บาท</>}</p>
              </div>
            </article>
          )) : <p className="py-6 text-center text-sm text-[var(--mute)]">ไม่พบปัญหา กด “+ เพิ่มปัญหา” เพื่อบันทึก</p>}
        </div>
      </Card>
    </section>
  );
}

// Summarizes the three-year plan, its budget, and its quarter-by-quarter roadmap.
export function PlanSection({
  projects,
  annualTotals,
  allPlanBudget,
  planMessage,
  openProject,
  importToPlan,
  exportProjects,
}) {
  return (
    <section id="plan" className="scroll-mt-20">
      <Card className="my-2.5">
        <SectionTitle>แผนงาน ฝจพ. ระยะ 3 ปี (ปีงบประมาณ 2570–2572)</SectionTitle>
        <p className="mb-2 text-xs text-[var(--mute)]">จัดทำจากมติที่ประชุม ข้อสั่งการ นโยบาย และทะเบียนปัญหา · ไตรมาส 1 = ต.ค.–ธ.ค. · 2 = ม.ค.–มี.ค. · 3 = เม.ย.–มิ.ย. · 4 = ก.ค.–ก.ย.</p>
        <div className="no-print my-3 flex flex-wrap gap-2">
          <Button primary onClick={() => openProject()}>+ เพิ่มโครงการในแผน</Button>
          <Button onClick={importToPlan}>นำเข้าจากมติ/ปัญหาที่ยังไม่อยู่ในแผน</Button>
          <Button onClick={exportProjects}>ดาวน์โหลดแผน (CSV)</Button>
        </div>
        {planMessage && <p role="status" className="mb-2 text-sm text-[var(--mute)]">{planMessage}</p>}
        <Kpis items={[
          ["โครงการในแผน", `${projects.length} โครงการ`, "#12355b"],
          ...annualTotals.map((amount, index) => [`ปีงบ ${2570 + index}`, `${formatBaht(amount)} บาท`, CATEGORY_COLORS[index]]),
          ["งบรวม 3 ปี", `${formatBaht(allPlanBudget)} บาท`, "#d1495b"],
        ]} compact />
        <SectionTitle className="mt-4">งบประมาณรายปี แยกตามหมวดงาน (บาท)</SectionTitle>
        {[0, 1, 2].map((year) => {
          const categoryTotals = CATEGORIES.map((_, category) => projects.filter((project) => Number(project.cat) === category).reduce((sum, project) => sum + (Number(project.b?.[year]) || 0), 0));
          return <BarRow key={year} label={`ปี ${2570 + year}`} value={formatBaht(annualTotals[year])} max={1} trailing={categoryTotals.some(Boolean) ? categoryTotals.map((amount, index) => amount ? <i key={index} className="h-full" style={{ flex: amount, background: CATEGORY_COLORS[index] }} /> : null) : <i className="h-full" />} />;
        })}
        {!allPlanBudget && <p className="mt-2 text-xs text-[var(--mute)]">ยังไม่ได้กรอกงบประมาณส่วนใหญ่ — กดแก้ไขแต่ละโครงการเพื่อใส่งบรายปี</p>}
        <div className="my-4 flex flex-wrap gap-3 text-xs">
          {CATEGORIES.map((category, index) => <span key={category} className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-sm" style={{ background: CATEGORY_COLORS[index] }} />{category}</span>)}
        </div>
        <SectionTitle>แผนภูมิเวลา (Roadmap)</SectionTitle>
        <div className="overflow-x-auto rounded-xl border border-[var(--line)]">
          <table className="min-w-[1100px] border-collapse text-left text-xs">
            <thead className="sticky top-0 bg-[var(--navy)] text-white"><tr>
              <th rowSpan="2" className="p-2">โครงการ</th><th rowSpan="2" className="p-2">ผู้รับผิดชอบ</th><th rowSpan="2" className="p-2">ความสำคัญ</th>
              {[2570, 2571, 2572].map((year) => <th key={year} colSpan="4" className="p-2 text-center">ปี {year}</th>)}
              <th rowSpan="2" className="p-2">งบประมาณ</th><th rowSpan="2" className="p-2" />
            </tr><tr>{Array.from({ length: 12 }, (_, quarter) => <th key={quarter} className={`border-l border-white/15 p-1 text-center ${quarter % 4 === 3 ? "border-r-2" : ""}`}>{quarter % 4 + 1}</th>)}</tr></thead>
            <tbody>
              {[...projects].sort((a, b) => Number(a.s) - Number(b.s) || Number(a.prio) - Number(b.prio)).map((project) => (
                <tr key={project.id} className="border-t border-[var(--line)] align-top hover:bg-[var(--tint)]">
                  <td className="max-w-64 p-2"><b>{project.name}</b><p className="text-[var(--mute)]">{CATEGORIES[project.cat]}{project.dids?.length ? ` · ข้อสั่งการ ${project.dids.length}` : ""}{project.pids?.length ? ` · ปัญหา ${project.pids.length}` : ""}</p>{(project.bld || []).map((name) => <span key={name} className="mr-1 text-[var(--mute)]">{name}</span>)}</td>
                  <td className="p-2">{project.owner || "ยังไม่ระบุ"}</td>
                  <td className="p-2"><span className="rounded-full px-2 py-1 text-white" style={{ background: PRIORITY_COLORS[project.prio] }}>{PRIORITIES[project.prio]}</span></td>
                  {Array.from({ length: 12 }, (_, quarter) => <td key={quarter} className={`h-10 min-w-8 border-l border-[var(--line)] p-0 ${quarter % 4 === 3 ? "border-r-2 border-r-[var(--navy)]" : ""}`}>{quarter >= Number(project.s) && quarter <= Number(project.e) && <i className="block h-4 rounded" style={{ background: CATEGORY_COLORS[project.cat] }} />}</td>)}
                  <td className="min-w-28 p-2">{(project.b || [0, 0, 0]).map((amount, year) => Number(amount) ? <p key={year} className="text-[var(--mute)]">ปี {2570 + year}: {formatBaht(amount)}</p> : null)}</td>
                  <td className="p-2"><Button className="px-2 py-1" onClick={() => openProject(project)}>แก้ไข</Button></td>
                </tr>
              ))}
              {!projects.length && <tr><td colSpan="18" className="p-6 text-center text-[var(--mute)]">ยังไม่มีโครงการในแผน</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}

// Shows responsibility and task progress grouped by building or work area.
export function BuildingsSection({
  buildings,
  tasks,
  setBuildings,
  updateFilter,
  newBuilding,
  setNewBuilding,
  addBuilding,
  buildingsPage = 1,
  setBuildingsPage,
}) {
  const buildingRows = [...buildings, { n: "ส่วนกลาง / ทั่วพื้นที่ SKP", o: "", central: true }];
  const pageCount = Math.ceil(buildingRows.length / BUILDING_PAGE_SIZE);
  const currentPage = Math.min(Math.max(1, buildingsPage), pageCount);
  const startIndex = (currentPage - 1) * BUILDING_PAGE_SIZE;
  const visibleBuildings = buildingRows.slice(startIndex, startIndex + BUILDING_PAGE_SIZE);
  const pageItems = getBuildingPageItems(currentPage, pageCount);

  return (
    <section id="buildings" className="scroll-mt-20">
      <Card className="my-2.5">
        <div className="mb-4 flex flex-col gap-3 border-b border-[var(--line)] pb-4 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-base font-bold">พื้นที่ความรับผิดชอบรายอาคาร</h2>
          <div className="no-print flex flex-col gap-2 sm:flex-row sm:items-center">
            <input className={inputClass("w-full sm:w-56")} value={newBuilding} onChange={(event) => setNewBuilding(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addBuilding(); } }} placeholder="ชื่ออาคาร/พื้นที่ใหม่" aria-label="ชื่ออาคารใหม่" />
            <Button className="whitespace-nowrap" onClick={addBuilding}>+ เพิ่มอาคาร/พื้นที่</Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] border-collapse text-left text-sm">
            <thead className="bg-[var(--navy)] text-white"><tr>{["อาคาร / พื้นที่", "ผู้รับผิดชอบพื้นที่ (พิมพ์แก้ได้)", "จำนวนงาน", "ความก้าวหน้าเฉลี่ย", "เสร็จสิ้น", "ติดปัญหา", ""].map((label) => <th key={label} className="p-2">{label}</th>)}</tr></thead>
            <tbody>
              {visibleBuildings.map((building) => {
                const list = tasks.filter((task) => building.central ? !taskBuildings(task).length : taskBuildings(task).includes(building.n));
                const progress = list.length ? Math.round(list.reduce((sum, task) => sum + Number(task.pg || 0), 0) / list.length) : 0;
                return <tr key={building.n} className="border-t border-[var(--line)]">
                  <td className="p-2 font-semibold">{building.n}</td>
                  <td className="p-2">{building.central ? "ฝจพ. (ภาพรวม)" : <input aria-label={`ผู้รับผิดชอบ ${building.n}`} className={inputClass("w-full min-w-36")} value={building.o || ""} onChange={(event) => setBuildings((listItems) => listItems.map((item) => item.n === building.n ? { ...item, o: event.target.value } : item))} placeholder="ระบุผู้รับผิดชอบ" />}</td>
                  <td className="p-2">{list.length}</td><td className="p-2">{progress}%</td><td className="p-2">{list.filter((task) => statusOf(task) === 0).length}</td><td className="p-2">{list.filter((task) => statusOf(task) === 3).length}</td>
                  <td className="p-2"><Button className="px-2 py-1" onClick={() => updateFilter("building", building.central ? "__central" : building.n)}>ดูงาน</Button></td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
        {pageCount > 1 && <div className="no-print mt-4 flex flex-col gap-3 border-t border-[var(--line)] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center text-sm text-[var(--mute)] sm:text-left">
            แสดง {startIndex + 1}–{Math.min(startIndex + BUILDING_PAGE_SIZE, buildingRows.length)} จาก {buildingRows.length} อาคาร/พื้นที่
          </p>
          <nav aria-label="เลือกหน้ารายการอาคาร" className="flex flex-wrap items-center justify-center gap-1 sm:justify-end">
            <Button
              type="button"
              className="gap-1.5 px-2.5"
              aria-label="หน้าก่อนหน้า"
              disabled={currentPage === 1}
              onClick={() => setBuildingsPage(currentPage - 1)}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
              <span className="hidden sm:inline">ก่อนหน้า</span>
            </Button>
            {pageItems.map((item) => typeof item === "number"
              ? <button
                  key={item}
                  type="button"
                  aria-label={`หน้า ${item}`}
                  aria-current={item === currentPage ? "page" : undefined}
                  onClick={() => setBuildingsPage(item)}
                  className={`grid h-10 min-w-10 place-items-center rounded-xl border px-2 text-sm font-semibold transition ${
                    item === currentPage
                      ? "border-[var(--navy)] bg-[var(--navy)] text-[var(--button-ink)]"
                      : "border-[var(--line)] bg-[var(--card)] text-[var(--ink)] hover:bg-[var(--tint)]"
                  }`}
                >{item}</button>
              : <span key={item} aria-hidden="true" className="px-1 text-sm text-[var(--mute)]">…</span>)}
            <Button
              type="button"
              className="gap-1.5 px-2.5"
              aria-label="หน้าถัดไป"
              disabled={currentPage === pageCount}
              onClick={() => setBuildingsPage(currentPage + 1)}
            >
              <span className="hidden sm:inline">ถัดไป</span>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
            </Button>
          </nav>
        </div>}
      </Card>
    </section>
  );
}

// Provides task search, filters, table display, and edit actions.
export function TasksSection({ filters, updateFilter, owners, buildings, filteredTasks, openTask }) {
  return (
    <section id="tasks" className="scroll-mt-20">
      <h2 className="mb-3 mt-4 text-lg font-bold">ทะเบียนมติ / ข้อสั่งการ</h2>
      <div className="no-print my-3 flex flex-wrap gap-2">
        <input className={inputClass("min-w-48 flex-1")} placeholder="ค้นหา เช่น ลิฟต์, มิเตอร์, รุ่งโรจน์" aria-label="ค้นหา" value={filters.query} onChange={(event) => updateFilter("query", event.target.value)} />
        <select aria-label="กรองสถานะ" className={inputClass()} value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}><option value="">ทุกสถานะ</option>{TASK_STATES.map(([label], index) => <option key={label} value={index}>{label}</option>)}</select>
        <select aria-label="กรองหมวดงาน" className={inputClass()} value={filters.category} onChange={(event) => updateFilter("category", event.target.value)}><option value="">ทุกหมวดงาน</option>{CATEGORIES.map((category, index) => <option key={category} value={index}>{category}</option>)}</select>
        <select aria-label="กรองผู้รับผิดชอบ" className={inputClass()} value={filters.owner} onChange={(event) => updateFilter("owner", event.target.value)}><option value="">ทุกผู้รับผิดชอบ</option>{owners.map((owner) => <option key={owner}>{owner}</option>)}</select>
        <select aria-label="กรองที่มา" className={inputClass()} value={filters.source} onChange={(event) => updateFilter("source", event.target.value)}><option value="">ทุกที่มา</option>{SOURCES.map((source, index) => <option key={source} value={index}>{source}</option>)}</select>
        <select aria-label="กรองอาคาร" className={inputClass()} value={filters.building} onChange={(event) => updateFilter("building", event.target.value)}><option value="">ทุกอาคาร/พื้นที่</option>{buildings.map((building) => <option key={building.n}>{building.n}</option>)}<option value="__central">ส่วนกลาง / ทั่วพื้นที่ SKP</option></select>
      </div>
      {filters.building && <Button className="no-print mb-2" onClick={() => updateFilter("building", "")}>ล้างตัวกรองอาคาร</Button>}
      <div className="overflow-x-auto rounded-2xl border border-[var(--line)] bg-[var(--card)]">
        <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
          <thead className="sticky top-0 bg-[var(--navy)] text-white"><tr>{["#", "วันที่ / ที่มา", "มติ / ข้อสั่งการ", "ผู้รับผิดชอบ", "ความก้าวหน้า", "ผลการดำเนินงาน", "ปัญหา / อุปสรรค", "แนวทางแก้ไข", ""].map((label) => <th key={label} className="p-2.5">{label}</th>)}</tr></thead>
          <tbody>
            {filteredTasks.map((task) => {
              const status = statusOf(task);
              const color = TASK_STATES[status][1];
              return <tr key={task.id} className="border-t border-[var(--line)] align-top hover:bg-[var(--tint)]">
                <td className="p-2.5">{task.id}</td>
                <td className="min-w-28 p-2.5"><div>{task.date}</div><span className="mt-1 inline-block rounded-full border border-[var(--line)] bg-[var(--tint)] px-2 py-0.5 text-xs">{sourceName(task)}</span></td>
                <td className="min-w-64 p-2.5"><b>{task.topic}</b><div className="text-xs text-[var(--mute)]">{CATEGORIES[task.cat]}</div><div className="mt-1 flex flex-wrap gap-1">{taskBuildings(task).map((building) => <span key={building} className="rounded-full border border-[var(--line)] bg-[var(--tint)] px-2 py-0.5 text-xs">{building}</span>)}</div></td>
                <td className="min-w-40 p-2.5">{task.owner || <span className="text-[#d1495b]">ยังไม่ระบุ</span>}</td>
                <td className="min-w-36 p-2.5"><span className="rounded-full px-2 py-1 text-xs font-bold text-white" style={{ background: color }}>{TASK_STATES[status][0]}</span><div className="mt-2 flex items-center gap-2"><div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--line)]"><i className="block h-full" style={{ width: `${task.pg}%`, background: color }} /></div><b>{task.pg}%</b></div></td>
                <td className="min-w-36 p-2.5">{task.result}</td><td className="min-w-36 p-2.5 text-[#d1495b]">{task.issue}</td><td className="min-w-36 p-2.5 text-[#13917f]">{task.sol}</td>
                <td className="p-2.5"><Button onClick={() => openTask(task)}>แก้ไข</Button></td>
              </tr>;
            })}
            {!filteredTasks.length && <tr><td colSpan="9" className="p-8 text-center text-[var(--mute)]">ไม่พบรายการ ลองล้างตัวกรองหรือกด “เพิ่มมติ / ข้อสั่งการ”</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="my-3 text-xs text-[var(--mute)]">ทุกการแก้ไขบันทึกอัตโนมัติไปยังฐานข้อมูลสำนักงาน · สถานะคำนวณจากความก้าวหน้า: 0% ยังไม่เริ่ม, 1–99% กำลังดำเนินการ, 100% เสร็จสิ้น, มีปัญหาและยังไม่เสร็จ = ติดปัญหา</p>
    </section>
  );
}
