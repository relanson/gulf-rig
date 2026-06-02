"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Flame, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [pw,      setPw]      = useState("");
  const [show,    setShow]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  // If already logged in, go straight to dashboard
  useEffect(() => {
    fetch("/api/admin/jobs?status=pending&limit=1", { credentials: "include" })
      .then(r => { if (r.ok) router.replace("/admin/dashboard"); })
      .catch(() => {});
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const r = await fetch("/api/admin/login", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({password:pw}) });
      if (!r.ok) throw new Error((await r.json()).error);
      router.push("/admin/dashboard");
    } catch(err) { setError(err instanceof Error ? err.message : "Login failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4" style={{ background:"var(--fb-bg)" }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-white mx-auto mb-3" style={{ background:"var(--fb-blue)" }}>
            <Flame className="w-7 h-7" />
          </div>
          <h1 className="font-extrabold text-3xl" style={{ color:"var(--fb-blue)" }}>Gulf-Rig</h1>
          <p className="text-sm mt-1" style={{ color:"var(--fb-secondary)" }}>Admin Portal — Oil &amp; Gas Jobs</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-5" style={{ border:"1px solid var(--fb-border)", boxShadow:"0 4px 12px rgba(0,0,0,.12)" }}>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Admin Password</label>
              <div className="relative">
                <input required type={show?"text":"password"} value={pw} onChange={(e)=>setPw(e.target.value)} placeholder="Enter your password"
                  className="w-full px-3 py-3 rounded-xl text-sm outline-none transition-all pr-10"
                  style={{ background:"var(--fb-bg)", border:"1px solid var(--fb-border)", color:"var(--fb-text)" }}
                  onFocus={(e)=>(e.currentTarget.style.borderColor="var(--fb-blue)")} onBlur={(e)=>(e.currentTarget.style.borderColor="var(--fb-border)")} />
                <button type="button" onClick={()=>setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color:"var(--fb-secondary)" }}>
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-white font-bold text-base transition-opacity"
              style={{ background:"var(--fb-green)", opacity:loading?0.75:1 }}>
              {loading ? "Logging in…" : "Log In"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
