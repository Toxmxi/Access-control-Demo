import { useEffect, useMemo, useState } from "react";
import {
  BUDGET_STATES,
  CATEGORIES,
  PRIORITIES,
  PROBLEM_STATES,
  TASK_STATES,
} from "./constants.js";
import { Card } from "./components/Common.jsx";
import AppFooter from "./components/AppFooter.jsx";
import AppHeader from "./components/AppHeader.jsx";
import EditorDialogs from "./components/EditorDialogs.jsx";
import { APP_PAGES, getPageFromHash } from "./components/PageNavigation.jsx";
import PageHeading from "./components/PageHeading.jsx";
import {
  BuildingsSection,
  OverviewSection,
  PlanSection,
  ProblemsSection,
  TasksSection,
} from "./components/TrackerSections.jsx";
import {
  downloadCsv,
  quarterLabel,
  readDemoData,
  relatedOwners,
  resizeImage,
  saveDemoData,
  saveSharedData,
  sourceName,
  statusLabel,
  statusOf,
  taskBuildings,
} from "./utils.js";

// Coordinates shared data, editing actions, and the tracker page sections.
export default function App({ user, onSignOut, supabase, authError, demoMode = false }) {
  // Shared office records are loaded from Supabase after authentication.
  const [tasks, setTasks] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [buildingsPage, setBuildingsPage] = useState(1);
  const [problems, setProblems] = useState([]);
  const [projects, setProjects] = useState([]);
  const [dataReady, setDataReady] = useState(false);
  const [dataError, setDataError] = useState("");
  const [saveErrors, setSaveErrors] = useState({});

  // UI state for filters, theme, dialogs, images, and temporary form values.
  const [filters, setFilters] = useState({ query: "", status: "", category: "", owner: "", source: "", building: "" });
  const [problemFilters, setProblemFilters] = useState({ status: "", budget: "" });
  const [theme, setTheme] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const [dialog, setDialog] = useState(null);
  const [otherSource, setOtherSource] = useState(false);
  const [draftImages, setDraftImages] = useState([]);
  const [lightbox, setLightbox] = useState("");
  const [newBuilding, setNewBuilding] = useState("");
  const [planMessage, setPlanMessage] = useState("");
  const [draftProgress, setDraftProgress] = useState(0);
  const [activePage, setActivePage] = useState(getPageFromHash);

  // Keeps the selected screen in sync with direct links and browser history.
  useEffect(() => {
    const syncPage = () => setActivePage(getPageFromHash());
    window.addEventListener("hashchange", syncPage);
    window.addEventListener("popstate", syncPage);
    return () => {
      window.removeEventListener("hashchange", syncPage);
      window.removeEventListener("popstate", syncPage);
    };
  }, []);

  // Applies the selected color theme to CSS variables across the application.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Loads shared records once the authenticated user enters the tracker.
  useEffect(() => {
    let cancelled = false;
    setDataReady(false);
    setDataError("");
    if (demoMode) {
      try {
        setTasks(readDemoData("tasks"));
        setBuildings(readDemoData("buildings"));
        setProblems(readDemoData("problems"));
        setProjects(readDemoData("projects"));
        setDataReady(true);
      } catch (error) {
        console.error("Unable to load local demo data", error);
        setDataError(error.message);
      }
      return () => { cancelled = true; };
    }
    const loadData = async () => {
      const { data, error } = await supabase.from("app_data").select("key, data");
      if (error) throw error;
      const stored = new Map((data || []).map((row) => [row.key, row.data]));
      const readArray = (key) => {
        const value = stored.get(key);
        if (value === undefined) return [];
        if (!Array.isArray(value)) throw new Error(`ข้อมูล ${key} ในฐานข้อมูลมีรูปแบบไม่ถูกต้อง`);
        return value;
      };
      const nextTasks = readArray("tasks");
      const nextBuildings = readArray("buildings");
      const nextProblems = readArray("problems");
      const nextProjects = readArray("projects");
      if (cancelled) return;
      setTasks(nextTasks);
      setBuildings(nextBuildings);
      setProblems(nextProblems);
      setProjects(nextProjects);
      setDataReady(true);
    };
    loadData().catch((error) => {
      console.error("Unable to load shared office data", error);
      if (!cancelled) setDataError(`โหลดข้อมูลจาก Supabase ไม่สำเร็จ: ${error.message}`);
    });
    return () => { cancelled = true; };
  }, [demoMode, supabase, user.id]);

  // Saves each record group independently so unrelated edits do not overwrite each other.
  useEffect(() => {
    if (!dataReady) return undefined;
    const timer = window.setTimeout(() => {
      (demoMode ? saveDemoData("tasks", tasks) : saveSharedData(supabase, "tasks", tasks)).then(() => setSaveErrors((current) => {
        const next = { ...current };
        delete next.tasks;
        return next;
      })).catch((error) => {
        console.error("Unable to save tasks", error);
        setSaveErrors((current) => ({ ...current, tasks: `บันทึกข้อมูลมติ/ข้อสั่งการไม่สำเร็จ: ${error.message}` }));
      });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [dataReady, demoMode, supabase, tasks]);

  useEffect(() => {
    if (!dataReady) return undefined;
    const timer = window.setTimeout(() => {
      (demoMode ? saveDemoData("buildings", buildings) : saveSharedData(supabase, "buildings", buildings)).then(() => setSaveErrors((current) => {
        const next = { ...current };
        delete next.buildings;
        return next;
      })).catch((error) => {
        console.error("Unable to save buildings", error);
        setSaveErrors((current) => ({ ...current, buildings: `บันทึกข้อมูลอาคารไม่สำเร็จ: ${error.message}` }));
      });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [buildings, dataReady, demoMode, supabase]);

  useEffect(() => {
    if (!dataReady) return undefined;
    const timer = window.setTimeout(() => {
      (demoMode ? saveDemoData("problems", problems) : saveSharedData(supabase, "problems", problems)).then(() => setSaveErrors((current) => {
        const next = { ...current };
        delete next.problems;
        return next;
      })).catch((error) => {
        console.error("Unable to save problems", error);
        setSaveErrors((current) => ({ ...current, problems: `บันทึกข้อมูลปัญหาไม่สำเร็จ: ${error.message}` }));
      });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [dataReady, demoMode, problems, supabase]);

  useEffect(() => {
    if (!dataReady) return undefined;
    const timer = window.setTimeout(() => {
      (demoMode ? saveDemoData("projects", projects) : saveSharedData(supabase, "projects", projects)).then(() => setSaveErrors((current) => {
        const next = { ...current };
        delete next.projects;
        return next;
      })).catch((error) => {
        console.error("Unable to save projects", error);
        setSaveErrors((current) => ({ ...current, projects: `บันทึกข้อมูลแผนงานไม่สำเร็จ: ${error.message}` }));
      });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [dataReady, demoMode, projects, supabase]);

  // Derives table and budget summaries from the current shared data.
  const owners = useMemo(() => [...new Set(tasks.flatMap(relatedOwners))].sort(), [tasks]);
  const filteredTasks = useMemo(() => tasks.filter((task) => {
    const query = filters.query.trim().toLocaleLowerCase();
    const matchesQuery = !query || JSON.stringify(task).toLocaleLowerCase().includes(query);
    const matchesBuilding = !filters.building || (filters.building === "__central" ? !taskBuildings(task).length : taskBuildings(task).includes(filters.building));
    return matchesQuery
      && (filters.status === "" || statusOf(task) === Number(filters.status))
      && (filters.category === "" || Number(task.cat) === Number(filters.category))
      && (filters.owner === "" || relatedOwners(task).includes(filters.owner))
      && (filters.source === "" || Number(task.src) === Number(filters.source))
      && matchesBuilding;
  }), [filters, tasks]);
  const totalProgress = tasks.length ? Math.round(tasks.reduce((sum, task) => sum + Number(task.pg || 0), 0) / tasks.length) : 0;
  const taskKpis = [
    ["ทั้งหมด", `${tasks.length} รายการ`, "#12355b"],
    ["ความก้าวหน้าเฉลี่ย", `${totalProgress}%`, "#13917f"],
    ...TASK_STATES.map(([label, color], index) => [label, tasks.filter((task) => statusOf(task) === index).length, color]),
  ];
  const filteredProblems = problems.filter((problem) =>
    (problemFilters.status === "" || Number(problem.status) === Number(problemFilters.status))
    && (problemFilters.budget === "" || Number(problem.bst) === Number(problemFilters.budget)));
  const problemBudgetTotals = problems.reduce((totals, problem) => {
    totals.need += Number(problem.amt) || 0;
    if (Number(problem.bst) === 3) totals.granted += Number(problem.got) || Number(problem.amt) || 0;
    if ([1, 2, 4].includes(Number(problem.bst))) totals.waiting += Number(problem.amt) || 0;
    return totals;
  }, { need: 0, granted: 0, waiting: 0 });
  const annualTotals = [0, 1, 2].map((year) => projects.reduce((total, project) => total + (Number(project.b?.[year]) || 0), 0));
  const allPlanBudget = annualTotals.reduce((sum, total) => sum + total, 0);

  // Updates a single filter while preserving all other filter choices.
  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const navigateToPage = (pageId) => {
    if (!APP_PAGES.some((page) => page.id === pageId)) return;
    setActivePage(pageId);
    if (window.location.hash !== `#${pageId}`) window.history.pushState(null, "", `#${pageId}`);
    window.scrollTo(0, 0);
  };
  // Opens and closes the shared editor while clearing temporary form state.
  const closeDialog = () => {
    setDialog(null);
    setDraftImages([]);
    setOtherSource(false);
  };
  const openTask = (task = null) => {
    setOtherSource(Number(task?.src) === 4);
    setDraftProgress(Number(task?.pg) || 0);
    setDialog({ type: "task", item: task });
  };
  const openProblem = (problem = null) => {
    setDraftImages(problem?.img ? [...problem.img] : []);
    setDialog({ type: "problem", item: problem });
  };
  const openProject = (project = null) => setDialog({ type: "project", item: project });

  // Reads task-form values and adds or updates the selected task.
  const saveTask = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const task = {
      topic: String(form.get("topic") || "").trim(),
      date: String(form.get("date") || ""),
      src: Number(form.get("src")),
      srcx: String(form.get("srcx") || "").trim(),
      cat: Number(form.get("cat")),
      owner: String(form.get("owner") || "").trim(),
      pg: Number(form.get("pg")),
      result: String(form.get("result") || "").trim(),
      issue: String(form.get("issue") || "").trim(),
      sol: String(form.get("sol") || "").trim(),
      bld: form.getAll("bld").map(String),
    };
    if (task.src !== 4) task.srcx = "";
    if (dialog.item) setTasks((list) => list.map((item) => item.id === dialog.item.id ? { ...item, ...task } : item));
    else setTasks((list) => [...list, { id: Math.max(0, ...list.map((item) => Number(item.id) || 0)) + 1, ...task }]);
    closeDialog();
  };

  // Reads problem-form values and keeps its budget and photo fields together.
  const saveProblem = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const item = {
      title: String(form.get("title") || "").trim(),
      date: String(form.get("date") || ""),
      status: Number(form.get("status")),
      desc: String(form.get("desc") || "").trim(),
      amt: Number(form.get("amt")) || 0,
      bst: Number(form.get("bst")),
      got: Number(form.get("got")) || 0,
      bld: form.getAll("bld").map(String),
      img: draftImages,
    };
    if (item.bst !== 3) item.got = 0;
    if (dialog.item) setProblems((list) => list.map((problem) => problem.id === dialog.item.id ? { ...problem, ...item } : problem));
    else setProblems((list) => [...list, { id: Math.max(0, ...list.map((problem) => Number(problem.id) || 0)) + 1, ...item }]);
    closeDialog();
  };

  // Reads plan-form values and adds or updates a project with its yearly budgets.
  const saveProject = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const start = Number(form.get("s"));
    const item = {
      name: String(form.get("name") || "").trim(),
      cat: Number(form.get("cat")),
      prio: Number(form.get("prio")),
      s: start,
      e: Math.max(start, Number(form.get("e"))),
      owner: String(form.get("owner") || "").trim(),
      b: ["b1", "b2", "b3"].map((key) => Number(form.get(key)) || 0),
      bld: form.getAll("bld").map(String),
      note: String(form.get("note") || "").trim(),
    };
    if (dialog.item) setProjects((list) => list.map((project) => project.id === dialog.item.id ? { ...project, ...item } : project));
    else setProjects((list) => [...list, {
      id: Math.max(0, ...list.map((project) => Number(project.id) || 0)) + 1,
      dids: [], pids: [], ...item,
    }]);
    closeDialog();
  };

  // Deletes the currently edited record after the user confirms the action.
  const deleteCurrent = () => {
    if (!dialog?.item || !window.confirm("ลบรายการนี้หรือไม่?")) return;
    if (dialog.type === "task") setTasks((list) => list.filter((item) => item.id !== dialog.item.id));
    if (dialog.type === "problem") setProblems((list) => list.filter((item) => item.id !== dialog.item.id));
    if (dialog.type === "project") setProjects((list) => list.filter((item) => item.id !== dialog.item.id));
    closeDialog();
  };

  // Adds a unique building to the shared list.
  const addBuilding = () => {
    const name = newBuilding.trim();
    if (!name) return;
    if (buildings.some((building) => building.n.toLocaleLowerCase() === name.toLocaleLowerCase())) {
      setDataError("มีชื่ออาคาร/พื้นที่นี้อยู่แล้ว");
      return;
    }
    setBuildings((list) => [...list, { n: name, o: "" }]);
    setNewBuilding("");
    setDataError("");
  };

  // Copies unfinished tasks and problems into the three-year plan.
  const importToPlan = () => {
    let nextId = Math.max(0, ...projects.map((project) => Number(project.id) || 0));
    const newTasks = tasks.filter((task) => Number(task.pg) < 100 && !projects.some((project) => (project.dids || []).includes(task.id)))
      .map((task) => ({
        id: ++nextId, name: task.topic.slice(0, 90), cat: Number(task.cat), s: 0, e: 3,
        b: [0, 0, 0], owner: task.owner, prio: 1, dids: [task.id], pids: [],
        bld: taskBuildings(task), note: "",
      }));
    const newProblems = problems.filter((problem) => Number(problem.status) < 2 && !projects.some((project) => (project.pids || []).includes(problem.id)))
      .map((problem) => ({
        id: ++nextId, name: problem.title, cat: 0, s: 0, e: 3, b: [Number(problem.amt) || 0, 0, 0],
        owner: "", prio: 1, dids: [], pids: [problem.id], bld: problem.bld || [], note: problem.desc || "",
      }));
    const added = [...newTasks, ...newProblems];
    if (added.length) setProjects((list) => [...list, ...added]);
    setPlanMessage(added.length
      ? `นำเข้า ${added.length} รายการใหม่เข้าสู่แผนปีงบ 2570 แล้ว — ปรับไตรมาสและงบได้ที่ปุ่มแก้ไข`
      : "ทุกมติ/ปัญหาที่ยังไม่เสร็จอยู่ในแผนแล้ว");
  };

  // Resizes image uploads and reports file-processing errors to the user.
  const changeProblemImages = async (event) => {
    const files = [...event.target.files];
    event.target.value = "";
    try {
      const currentImages = [...draftImages];
      for (const file of files) {
        if (currentImages.length >= 6) break;
        if (!file.type.startsWith("image/")) continue;
        currentImages.push(await resizeImage(file));
      }
      setDraftImages(currentImages);
    } catch (error) {
      console.error("Unable to read problem image", error);
      setDataError("อ่านรูปภาพไม่สำเร็จ กรุณาลองเลือกไฟล์รูปภาพอื่น");
    }
  };

  // Exports each record group in a spreadsheet-compatible CSV format.
  const exportTasks = () => downloadCsv("fjp-skp-tracker.csv",
    ["ลำดับ", "วันที่", "ที่มา", "หมวด", "อาคาร/พื้นที่", "มติ/ข้อสั่งการ", "ผู้รับผิดชอบ", "ความก้าวหน้า%", "สถานะ", "ผลการดำเนินงาน", "ปัญหา", "แนวทางแก้ไข"],
    tasks.map((task) => [task.id, task.date, sourceName(task), CATEGORIES[task.cat], taskBuildings(task).join("; "), task.topic, task.owner, task.pg, TASK_STATES[statusOf(task)][0], task.result, task.issue, task.sol]));
  const exportProblems = () => downloadCsv("fjp-skp-problems.csv",
    ["ลำดับ", "วันที่พบ", "ชื่อปัญหา", "อาคาร/พื้นที่", "รายละเอียด", "สถานะการแก้ไข", "งบที่ต้องใช้ (บาท)", "สถานะงบ", "ได้รับจัดสรร (บาท)", "จำนวนรูป"],
    problems.map((problem) => [problem.id, problem.date, problem.title, (problem.bld || []).join("; "), problem.desc, statusLabel(PROBLEM_STATES, problem.status), problem.amt, statusLabel(BUDGET_STATES, problem.bst), problem.got, (problem.img || []).length]));
  const exportProjects = () => downloadCsv("fjp-skp-3year-plan.csv",
    ["ลำดับ", "โครงการ", "หมวดงาน", "อาคาร/พื้นที่", "ผู้รับผิดชอบ", "ความสำคัญ", "เริ่ม", "สิ้นสุด", "งบ 2570", "งบ 2571", "งบ 2572", "หมายเหตุ"],
    projects.map((project) => [project.id, project.name, CATEGORIES[project.cat], (project.bld || []).join("; "), project.owner, PRIORITIES[project.prio], quarterLabel(project.s), quarterLabel(project.e), ...(project.b || [0, 0, 0]), project.note]));

  if (!dataReady) {
    return (
      <main className="grid min-h-screen place-items-center bg-[var(--bg)] p-4 text-[var(--ink)]">
        <Card className="w-full max-w-xl text-center">
          <h1 className="text-xl font-bold">กำลังเชื่อมต่อข้อมูลสำนักงาน</h1>
          {dataError
            ? <><p role="alert" className="mt-3 text-sm text-[#d1495b]">{dataError}</p><button className="mt-4 rounded-lg border border-[var(--line)] px-3 py-2 text-sm" onClick={() => window.location.reload()}>ลองใหม่</button></>
            : <p className="mt-3 text-sm text-[var(--mute)]">กรุณารอสักครู่...</p>}
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] px-3 py-4 text-[var(--ink)] sm:px-5 sm:py-6">
      <div className="mx-auto max-w-[1240px]">
        <AppHeader
          user={user}
          demoMode={demoMode}
          activePage={activePage}
          onNavigate={navigateToPage}
          onOpenTask={() => openTask()}
          onExportTasks={exportTasks}
          onPrint={() => window.print()}
          onExportProblems={exportProblems}
          onToggleTheme={() => setTheme((value) => value === "dark" ? "light" : "dark")}
          onSignOut={onSignOut}
        />

        {authError && <div role="alert" className="my-3 rounded-xl border border-[#d1495b]/30 bg-[#d1495b]/10 px-4 py-3 text-sm text-[#d1495b]">{authError}</div>}
        {(dataError || Object.keys(saveErrors).length > 0) && <div role="alert" className="my-3 rounded-xl border border-[#d1495b]/30 bg-[#d1495b]/10 px-4 py-3 text-sm text-[#d1495b]">
          {dataError && <p>{dataError}</p>}
          {Object.entries(saveErrors).map(([key, error]) => <p key={key}>{error}</p>)}
        </div>}

        <PageHeading activePage={activePage} />
        {activePage === "overview" && <OverviewSection tasks={tasks} taskKpis={taskKpis} />}
        {activePage === "problems" && <ProblemsSection
          problems={problems}
          filteredProblems={filteredProblems}
          problemBudgetTotals={problemBudgetTotals}
          problemFilters={problemFilters}
          setProblemFilters={setProblemFilters}
          openProblem={openProblem}
          setLightbox={setLightbox}
        />}
        {activePage === "plan" && <PlanSection
          projects={projects}
          annualTotals={annualTotals}
          allPlanBudget={allPlanBudget}
          planMessage={planMessage}
          openProject={openProject}
          importToPlan={importToPlan}
          exportProjects={exportProjects}
        />}
        {activePage === "buildings" && <BuildingsSection
          buildings={buildings}
          tasks={tasks}
          setBuildings={setBuildings}
          buildingsPage={buildingsPage}
          setBuildingsPage={setBuildingsPage}
          updateFilter={updateFilter}
          newBuilding={newBuilding}
          setNewBuilding={setNewBuilding}
          addBuilding={addBuilding}
        />}
        {activePage === "tasks" && <TasksSection
          filters={filters}
          updateFilter={updateFilter}
          owners={owners}
          buildings={buildings}
          filteredTasks={filteredTasks}
          openTask={openTask}
        />}
        <AppFooter demoMode={demoMode} />
      </div>

      <EditorDialogs
        dialog={dialog}
        closeDialog={closeDialog}
        buildings={buildings}
        otherSource={otherSource}
        setOtherSource={setOtherSource}
        draftImages={draftImages}
        setDraftImages={setDraftImages}
        changeProblemImages={changeProblemImages}
        draftProgress={draftProgress}
        setDraftProgress={setDraftProgress}
        saveTask={saveTask}
        saveProblem={saveProblem}
        saveProject={saveProject}
        deleteCurrent={deleteCurrent}
        lightbox={lightbox}
        setLightbox={setLightbox}
      />
    </main>
  );
}
