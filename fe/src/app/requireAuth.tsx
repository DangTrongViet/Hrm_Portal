import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getJSON } from "../lib/http";

type Me = { id: number };

export default function RequireAuth() {
  const loc = useLocation();
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const me = await getJSON<Me>("/me");
        if (me?.id) {
          localStorage.setItem("currentUser", JSON.stringify(me));
          setOk(true);
        } else {
          localStorage.removeItem("currentUser");
          setOk(false);
        }
      } catch {
        localStorage.removeItem("currentUser");
        setOk(false);
      }
    })();
  }, []);

  if (ok === null) return <div>Đang kiểm tra đăng nhập...</div>;
  if (!ok) return <Navigate to="/login" replace state={{ from: loc }} />;
  return <Outlet />;
}
