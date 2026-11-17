"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/teacher/logout", { method: "POST" });
    router.push("/teacher/login");
    router.refresh();
  }
  return (
    <button onClick={logout} className="btn btn-ghost !py-2.5 text-[12.5px]">
      <LogOut className="h-4 w-4" />
      تسجيل الخروج
    </button>
  );
}
