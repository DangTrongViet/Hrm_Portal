// src/routes/requireAuth.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
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

// rút user từ nhiều kiểu payload khác nhau
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // ✅ gọi đúng /api/me (đã có authMiddleware)
        const me = await getJSON<RawMe>("/me");
        const u = pickUser(me);
        if (u) {
          localStorage.setItem("currentUser", JSON.stringify(u));
          setUser(u);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Đang kiểm tra đăng nhập...</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: loc }} />;
  return <Outlet />;
}
