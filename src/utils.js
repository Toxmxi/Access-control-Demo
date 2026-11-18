import { SOURCES } from "./constants.js";

// Derives the display status from a task's completion and issue fields.
export function statusOf(task) {
  if (Number(task.pg) >= 100) return 0;
  if (task.issue && /รอ|เสีย|รั่ว|ไม่ได้|ผุ|เสี่ยง|ยังไม่ระบุ|เร่งด่วน/.test(task.issue)) return 3;
  return Number(task.pg) > 0 ? 1 : 2;
}

// Splits a task's assigned owners for filters and reporting.
export function relatedOwners(task) {
  return task.owner ? task.owner.split("/").map((owner) => owner.trim()) : ["ยังไม่ระบุ"];
}

// Resolves a task's source label, including user-entered custom sources.
export function sourceName(task) {
  return Number(task.src) === 4 && task.srcx ? task.srcx : SOURCES[task.src] || "ไม่ระบุ";
}

// Returns the saved building list; old or incomplete records have no building.
export function taskBuildings(task) {
  return Array.isArray(task?.bld) ? task.bld : [];
}

// Safely returns a label for a numeric status code.
export function statusLabel(statuses, value) {
  return statuses[Number(value)]?.[0] || statuses[0][0];
}

// Formats numbers using the Thai locale for budget displays.
export function formatBaht(value) {
  return Number(value || 0).toLocaleString("th-TH");
}

// Creates a UTF-8 CSV download for the requested table data.
export function downloadCsv(filename, headers, rows) {
  const quote = (value) => {
    const text = String(value ?? "");
    const safeText = typeof value === "string" && /^[\s\u0000-\u001f\u007f]*[=+\-@]/.test(text)
      ? `'${text}`
      : text;
    return `"${safeText.replaceAll('"', '""')}"`;
  };
  const contents = [headers, ...rows].map((row) => row.map(quote).join(",")).join("\n");
  const blob = new Blob(["\ufeff", contents], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// Converts a roadmap index into its fiscal-year quarter label.
export function quarterLabel(index) {
  return `ไตรมาส ${Number(index) % 4 + 1} ปี ${2570 + Math.floor(Number(index) / 4)}`;
}

// Resizes an uploaded image before it is stored with a problem record.
export function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error || new Error("อ่านไฟล์ไม่สำเร็จ"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("ไฟล์รูปภาพไม่ถูกต้อง"));
      image.onload = () => {
        const scale = Math.min(1, 900 / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("ไม่สามารถประมวลผลรูปภาพได้"));
          return;
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

// Serializes writes per data key so later edits do not overtake earlier saves.
const saveQueues = new Map();
export function saveSharedData(supabase, key, data) {
  const previous = saveQueues.get(key) || Promise.resolve();
  const next = previous.catch(() => {}).then(async () => {
    const { error } = await supabase.from("app_data").upsert({ key, data }, { onConflict: "key" });
    if (error) throw error;
  });
  saveQueues.set(key, next);
  return next;
}

// Reads one demo-only data group from this browser without calling Supabase.
export function readDemoData(key) {
  const stored = localStorage.getItem(`fjp-skp-demo-${key}`);
  if (stored === null) return [];
  const value = JSON.parse(stored);
  if (!Array.isArray(value)) throw new Error(`ข้อมูลทดลอง ${key} มีรูปแบบไม่ถูกต้อง`);
  return value;
}

// Persists demo changes only in the current browser profile.
export function saveDemoData(key, data) {
  return Promise.resolve().then(() => localStorage.setItem(`fjp-skp-demo-${key}`, JSON.stringify(data)));
}
