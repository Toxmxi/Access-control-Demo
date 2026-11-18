import { lazy, Suspense, useEffect, useState } from "react";
import { supabase } from "./supabase.js";

const demoMode = import.meta.env.VITE_DEMO_MODE === "true";
const App = lazy(() => import("./App.jsx"));

function AppLoading() {
  return <main className="grid min-h-screen place-items-center bg-[var(--bg)] text-[var(--ink)]">กำลังโหลดระบบ...</main>;
}

// Collects credentials and delegates password verification to Supabase Auth.
function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Submits the credentials without ever storing the password in the app.
  const signIn = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage("");
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErrorMessage("เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลและรหัสผ่าน หรือติดต่อผู้ดูแลระบบ");
        console.error("Unable to sign in", error);
      }
    } catch (error) {
      console.error("Unable to sign in", error);
      setErrorMessage("เชื่อมต่อระบบ Login ไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--bg)] p-4 text-[var(--ink)]">
      <section className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 shadow-lg sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-[var(--navy)] text-xl font-bold text-white">SKP</div>
          <h1 className="text-xl font-bold">เข้าสู่ระบบสำนักงาน</h1>
          <p className="mt-1 text-sm text-[var(--mute)]">ตารางติดตามผลการปฏิบัติงาน ฝจพ.</p>
        </div>
        <form className="grid gap-4" onSubmit={signIn}>
          <label className="grid gap-1 text-sm text-[var(--mute)]">
            <span>อีเมล</span>
            <input className="min-w-0 rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-[var(--ink)]" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="grid gap-1 text-sm text-[var(--mute)]">
            <span>รหัสผ่าน</span>
            <input className="min-w-0 rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-[var(--ink)]" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          {errorMessage && <p role="alert" className="text-sm text-[#d1495b]">{errorMessage}</p>}
          <button className="rounded-xl bg-[var(--navy)] px-4 py-2.5 font-semibold text-white hover:brightness-110 disabled:opacity-50" type="submit" disabled={submitting}>
            {submitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
        <p className="mt-5 text-center text-xs text-[var(--mute)]">บัญชีผู้ใช้ต้องได้รับเชิญจากผู้ดูแลระบบสำนักงาน</p>
      </section>
    </main>
  );
}

// Restores the login session and switches between Login and the tracker.
export default function User() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  // Keeps React state synchronized with the Supabase session lifecycle.
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return undefined;
    }
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) {
        setSession(nextSession);
        setLoading(false);
      }
    });
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        console.error("Unable to restore session", error);
        setAuthError(`ตรวจสอบสถานะการเข้าสู่ระบบไม่สำเร็จ: ${error.message}`);
      } else {
        setSession(data.session);
      }
      setLoading(false);
    }).catch((error) => {
      if (!active) return;
      console.error("Unable to restore session", error);
      setAuthError(`ตรวจสอบสถานะการเข้าสู่ระบบไม่สำเร็จ: ${error.message}`);
      setLoading(false);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  // Signs out through Supabase and reports a failure if it cannot complete.
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setAuthError("");
    } catch (error) {
      console.error("Unable to sign out", error);
      setAuthError(`ออกจากระบบไม่สำเร็จ: ${error.message}`);
    }
  };

  if (demoMode) {
    return (
      <Suspense fallback={<AppLoading />}>
        <App user={{ id: "local-demo", email: "โหมดทดลอง" }} supabase={null} demoMode />
      </Suspense>
    );
  }

  if (!supabase) {
    return (
      <main className="grid min-h-screen place-items-center bg-[var(--bg)] p-4 text-[var(--ink)]">
        <section className="w-full max-w-xl rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6 shadow-lg">
          <h1 className="text-xl font-bold">ยังไม่ได้ตั้งค่า Supabase</h1>
          <p className="mt-2 text-sm text-[var(--mute)]">สร้างไฟล์ <code>.env.local</code> จาก <code>.env.example</code> แล้วใส่ Project URL และ anon key จาก Supabase ก่อนเริ่มใช้งาน</p>
        </section>
      </main>
    );
  }
  if (loading) {
    return <main className="grid min-h-screen place-items-center bg-[var(--bg)] text-[var(--ink)]">กำลังตรวจสอบบัญชี...</main>;
  }
  if (!session) return <LoginForm />;

  return (
    <Suspense fallback={<AppLoading />}>
      <App user={session.user} supabase={supabase} onSignOut={signOut} authError={authError} />
    </Suspense>
  );
}
