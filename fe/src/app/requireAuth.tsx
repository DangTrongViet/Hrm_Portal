import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { getJSON } from "../lib/http";

type RawMe =
  | { user?: any }
  | { data?: any }
  | { id?: number; email?: string; full_name?: string; permissionNames?: string[]; permissions?: string[] };

type AppUser = {
  id: number;
  email?: string;
  full_name?: string;
  permissionNames: string[];
};

function pickUser(payload: RawMe | any): AppUser | null {
  if (!payload) return null;
  const u = (payload as any).user ?? (payload as any).data ?? payload;
  if (!u || typeof u !== "object" || !u.id) return null;
  return {
    id: Number(u.id),
    email: u.email ?? "",
    full_name: u.full_name ?? u.name ?? "",
    permissionNames: Array.isArray(u.permissionNames)
      ? u.permissionNames
      : Array.isArray(u.permissions)
      ? u.permissions
      : [],
  };
}

export default function RequireAuth() {
  const loc = useLocation();
  const [user, setUser] = useState<AppUser | null>(null);
  const [validating, setValidating] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    // 1) Tin localStorage để render nhanh
    try {
      const raw = localStorage.getItem("currentUser");
      if (raw) {
        const u = JSON.parse(raw) as AppUser;
        if (u?.id) setUser(u);
      }
    } catch {}

    // 2) Revalidate bằng /me (BASE đã có /api)
    (async () => {
      try {
        const me = await getJSON<RawMe>("/me");
        const u = pickUser(me);
        if (!mounted.current) return;
        if (u) {
          localStorage.setItem("currentUser", JSON.stringify(u));
          setUser(u);
        } else {
          localStorage.removeItem("currentUser");
          setUser(null);
        }
      } catch {
        if (!mounted.current) return;
        localStorage.removeItem("currentUser");
        setUser(null);
      } finally {
        if (mounted.current) setValidating(false);
      }
    })();

    return () => { mounted.current = false; };
  }, []);

  if (!user && validating) return <div>Đang kiểm tra đăng nhập...</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: loc }} />;
  return <Outlet />;
}
