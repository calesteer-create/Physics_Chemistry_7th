"use client";

import { useState, type FormEvent } from "react";
import { UserRoundPlus } from "lucide-react";

export function StudentProfileForm() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "fail");
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error && err.message !== "fail" ? err.message : "تعذر إنشاء الملف، حاول مجددًا");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-8 max-w-md">
      <label className="block">
        <span className="mb-2 block text-[13px] font-black text-[var(--color-mist)]">اسمك الكامل</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="مثال: أحمد الخطيب"
          maxLength={60}
          className="w-full rounded-xl border border-[var(--color-line2)] bg-[rgba(6,14,30,0.7)] px-4 py-3.5 text-[15px] font-bold text-white outline-none transition-colors placeholder:text-[var(--color-dim)] focus:border-[rgba(60,224,244,0.6)]"
        />
      </label>
      {error && <p className="mt-3 text-[12.5px] font-bold text-[#f87171]">{error}</p>}
      <button type="submit" disabled={loading || name.trim().length < 2} className="btn btn-phys mt-5 w-full disabled:cursor-not-allowed disabled:opacity-40">
        <UserRoundPlus className="h-5 w-5" />
        {loading ? "جارٍ إنشاء ملفك…" : "أنشئ ملفي وابدأ"}
      </button>
    </form>
  );
}
