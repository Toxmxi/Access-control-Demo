import { BUDGET_STATES, CATEGORIES, PRIORITIES, PROBLEM_STATES, SOURCES } from "../constants.js";
import { quarterLabel, taskBuildings } from "../utils.js";
import { Button, CheckList, Dialog, Field, inputClass } from "./Common.jsx";

// Edits a directive/task and its progress, owner, and building assignments.
function TaskDialog({ dialog, buildings, otherSource, setOtherSource, draftProgress, setDraftProgress, onSave, onDelete, onClose }) {
  return (
    <Dialog title={dialog.item ? "แก้ไขมติ / ข้อสั่งการ" : "เพิ่มมติ / ข้อสั่งการ"} onClose={onClose}>
      <form onSubmit={onSave} className="grid gap-3 sm:grid-cols-2">
        <Field label="มติ / ข้อสั่งการ" className="sm:col-span-2"><textarea className={inputClass()} name="topic" rows="2" required defaultValue={dialog.item?.topic || ""} /></Field>
        <Field label="วันที่สั่งการ"><input className={inputClass()} name="date" placeholder="เช่น 1 ก.ย. 2569" defaultValue={dialog.item?.date || ""} /></Field>
        <Field label="ที่มา"><select className={inputClass()} name="src" defaultValue={dialog.item?.src ?? 0} onChange={(event) => setOtherSource(Number(event.target.value) === 4)}>{SOURCES.map((source, index) => <option key={source} value={index}>{source}</option>)}</select></Field>
        {otherSource && <Field label="ระบุที่มา (อื่นๆ)" className="sm:col-span-2"><input className={inputClass()} name="srcx" placeholder="เช่น หนังสือสั่งการ / ตรวจราชการ" defaultValue={dialog.item?.srcx || ""} /></Field>}
        <Field label="หมวดงาน"><select className={inputClass()} name="cat" defaultValue={dialog.item?.cat ?? 0}>{CATEGORIES.map((category, index) => <option key={category} value={index}>{category}</option>)}</select></Field>
        <Field label="ผู้รับผิดชอบ"><input className={inputClass()} name="owner" placeholder="เช่น รุ่งโรจน์ / นายนภัทร" defaultValue={dialog.item?.owner || ""} /></Field>
        <div className="sm:col-span-2"><CheckList buildings={buildings} selected={taskBuildings(dialog.item || {})} /></div>
        <Field label="ความก้าวหน้า (%)" className="sm:col-span-2"><input type="range" min="0" max="100" step="5" name="pg" value={draftProgress} onChange={(event) => setDraftProgress(Number(event.target.value))} /><span>{draftProgress}%</span></Field>
        <Field label="ผลการดำเนินงาน" className="sm:col-span-2"><textarea className={inputClass()} name="result" rows="2" defaultValue={dialog.item?.result || ""} /></Field>
        <Field label="ปัญหา / อุปสรรค"><textarea className={inputClass()} name="issue" rows="2" defaultValue={dialog.item?.issue || ""} /></Field>
        <Field label="แนวทางแก้ไข"><textarea className={inputClass()} name="sol" rows="2" defaultValue={dialog.item?.sol || ""} /></Field>
        <div className="flex justify-between gap-2 sm:col-span-2">{dialog.item && <Button type="button" className="text-[#d1495b]" onClick={onDelete}>ลบรายการ</Button>}<span className="flex-1" /><Button type="button" onClick={onClose}>ยกเลิก</Button><Button primary type="submit">บันทึก</Button></div>
      </form>
    </Dialog>
  );
}

// Edits a problem record, including budget status and resized photo previews.
function ProblemDialog({ dialog, buildings, draftImages, setDraftImages, onImagesChange, onSave, onDelete, onClose }) {
  return (
    <Dialog title={dialog.item ? "แก้ไขปัญหา" : "เพิ่มปัญหา"} onClose={onClose}>
      <form onSubmit={onSave} className="grid gap-3 sm:grid-cols-2">
        <Field label="ชื่อปัญหา" className="sm:col-span-2"><input className={inputClass()} name="title" required defaultValue={dialog.item?.title || ""} /></Field>
        <Field label="วันที่พบ"><input className={inputClass()} name="date" placeholder="เช่น 17 พ.ย. 2569" defaultValue={dialog.item?.date || ""} /></Field>
        <Field label="สถานะการแก้ไข"><select className={inputClass()} name="status" defaultValue={dialog.item?.status ?? 0}>{PROBLEM_STATES.map(([label], index) => <option key={label} value={index}>{label}</option>)}</select></Field>
        <div className="sm:col-span-2"><CheckList buildings={buildings} selected={dialog.item?.bld || []} /></div>
        <Field label="รายละเอียดปัญหา" className="sm:col-span-2"><textarea className={inputClass()} name="desc" rows="2" defaultValue={dialog.item?.desc || ""} /></Field>
        <Field label="งบประมาณที่ต้องใช้ (บาท)"><input className={inputClass()} name="amt" type="number" min="0" step="any" defaultValue={dialog.item?.amt ?? ""} /></Field>
        <Field label="สถานะงบประมาณ"><select className={inputClass()} name="bst" defaultValue={dialog.item?.bst ?? 0}>{BUDGET_STATES.map(([label], index) => <option key={label} value={index}>{label}</option>)}</select></Field>
        <Field label="จำนวนเงินที่ได้รับจัดสรร (บาท)" className="sm:col-span-2"><input className={inputClass()} name="got" type="number" min="0" step="any" defaultValue={dialog.item?.got ?? ""} /></Field>
        <Field label="รูปภาพปัญหา (สูงสุด 6 รูป)" className="sm:col-span-2">
          <input className={inputClass()} type="file" accept="image/*" multiple onChange={onImagesChange} />
          <div className="mt-2 flex flex-wrap gap-2">{draftImages.map((image, index) => (
            <div key={`${index}-${image.slice(0, 24)}`} className="relative">
              <img src={image} alt={`รูปที่ ${index + 1}`} className="h-16 w-16 rounded-lg object-cover" />
              <button type="button" aria-label="ลบรูป" className="absolute -right-2 -top-2 rounded-full bg-[#d1495b] px-1.5 text-white" onClick={() => setDraftImages((list) => list.filter((_, itemIndex) => itemIndex !== index))}>×</button>
            </div>
          ))}</div>
        </Field>
        <div className="flex justify-between gap-2 sm:col-span-2">{dialog.item && <Button type="button" className="text-[#d1495b]" onClick={onDelete}>ลบปัญหา</Button>}<span className="flex-1" /><Button type="button" onClick={onClose}>ยกเลิก</Button><Button primary type="submit">บันทึก</Button></div>
      </form>
    </Dialog>
  );
}

// Edits a three-year project and its schedule, budget, and building links.
function ProjectDialog({ dialog, buildings, onSave, onDelete, onClose }) {
  return (
    <Dialog title={dialog.item ? "แก้ไขโครงการในแผน" : "เพิ่มโครงการในแผน"} onClose={onClose}>
      <form onSubmit={onSave} className="grid gap-3 sm:grid-cols-2">
        <Field label="ชื่อโครงการ / งานในแผน" className="sm:col-span-2"><input className={inputClass()} name="name" required defaultValue={dialog.item?.name || ""} /></Field>
        <Field label="หมวดงาน"><select className={inputClass()} name="cat" defaultValue={dialog.item?.cat ?? 0}>{CATEGORIES.map((category, index) => <option key={category} value={index}>{category}</option>)}</select></Field>
        <Field label="ความสำคัญ"><select className={inputClass()} name="prio" defaultValue={dialog.item?.prio ?? 1}>{PRIORITIES.map((priority, index) => <option key={priority} value={index}>{priority}</option>)}</select></Field>
        <Field label="เริ่มดำเนินการ"><select className={inputClass()} name="s" defaultValue={dialog.item?.s ?? 0}>{Array.from({ length: 12 }, (_, quarter) => <option key={quarter} value={quarter}>{quarterLabel(quarter)}</option>)}</select></Field>
        <Field label="สิ้นสุด"><select className={inputClass()} name="e" defaultValue={dialog.item?.e ?? 3}>{Array.from({ length: 12 }, (_, quarter) => <option key={quarter} value={quarter}>{quarterLabel(quarter)}</option>)}</select></Field>
        <Field label="ผู้รับผิดชอบ" className="sm:col-span-2"><input className={inputClass()} name="owner" defaultValue={dialog.item?.owner || ""} /></Field>
        {[0, 1, 2].map((year) => <Field key={year} label={`งบประมาณ ปี ${2570 + year} (บาท)`}><input className={inputClass()} name={`b${year + 1}`} type="number" min="0" step="any" defaultValue={dialog.item?.b?.[year] || ""} /></Field>)}
        <div className="sm:col-span-2"><CheckList buildings={buildings} selected={dialog.item?.bld || []} /></div>
        <Field label="หมายเหตุ / ที่มา" className="sm:col-span-2"><textarea className={inputClass()} name="note" rows="2" defaultValue={dialog.item?.note || ""} /></Field>
        <div className="flex justify-between gap-2 sm:col-span-2">{dialog.item && <Button type="button" className="text-[#d1495b]" onClick={onDelete}>ลบโครงการ</Button>}<span className="flex-1" /><Button type="button" onClick={onClose}>ยกเลิก</Button><Button primary type="submit">บันทึก</Button></div>
      </form>
    </Dialog>
  );
}

// Chooses the correct editor modal and displays a selected photo at full size.
export default function EditorDialogs(props) {
  const {
    dialog,
    closeDialog,
    buildings,
    otherSource,
    setOtherSource,
    draftImages,
    setDraftImages,
    changeProblemImages,
    draftProgress,
    setDraftProgress,
    saveTask,
    saveProblem,
    saveProject,
    deleteCurrent,
    lightbox,
    setLightbox,
  } = props;
  return (
    <>
      {dialog?.type === "task" && <TaskDialog
        dialog={dialog}
        buildings={buildings}
        otherSource={otherSource}
        setOtherSource={setOtherSource}
        draftProgress={draftProgress}
        setDraftProgress={setDraftProgress}
        onSave={saveTask}
        onDelete={deleteCurrent}
        onClose={closeDialog}
      />}
      {dialog?.type === "problem" && <ProblemDialog
        dialog={dialog}
        buildings={buildings}
        draftImages={draftImages}
        setDraftImages={setDraftImages}
        onImagesChange={changeProblemImages}
        onSave={saveProblem}
        onDelete={deleteCurrent}
        onClose={closeDialog}
      />}
      {dialog?.type === "project" && <ProjectDialog
        dialog={dialog}
        buildings={buildings}
        onSave={saveProject}
        onDelete={deleteCurrent}
        onClose={closeDialog}
      />}
      {lightbox && <div role="dialog" aria-modal="true" aria-label="ภาพขยาย" className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4" onClick={() => setLightbox("")}><img src={lightbox} alt="ภาพขยาย" className="max-h-full max-w-full rounded-xl object-contain" /></div>}
    </>
  );
}
