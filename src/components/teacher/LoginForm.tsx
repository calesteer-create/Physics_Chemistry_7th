"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, LogIn } from "lucide-react";

export function TeacherLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/teacher/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "fail");
      router.push("/teacher");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر الدخول");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-8 max-w-md">
      <label className="block">
        <span className="mb-2 flex items-center gap-2 text-[13px] font-black text-[var(--color-mist)]">
          <KeyRound className="h-4 w-4 text-[var(--color-gold)]" />
          كلمة مرور المعلم
        </span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-xl border border-[var(--color-line2)] bg-[rgba(6,14,30,0.7)] px-4 py-3.5 text-[16px] font-bold text-white outline-none transition-colors placeholder:text-[var(--color-dim)] focus:border-[rgba(230,192,122,0.6)]"
          autoComplete="current-password"
        />
      </label>
      {error && (
        <p className="mt-3 rounded-xl border border-[rgba(248,113,113,0.4)] bg-[rgba(248,113,113,0.07)] px-4 py-3 text-[12.5px] font-bold leading-6 text-[#fecaca]">
          {error}
        </p>
      )}
      <button type="submit" disabled={loading || password.length === 0} className="btn btn-gold mt-5 w-full disabled:cursor-not-allowed disabled:opacity-40">
        <LogIn className="h-5 w-5" />
        {loading ? "جارٍ التحقق…" : "دخول منطقة المعلم"}
      </button>
    </form>
  );
}
