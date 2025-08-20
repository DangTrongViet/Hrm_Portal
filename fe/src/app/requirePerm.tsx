import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function RequirePerm({ need }: { need: string[] }) {
  const raw = localStorage.getItem('currentUser');
  const user = raw ? JSON.parse(raw) : null;

  // Đọc mảng permissionNames nếu tồn tại
  const perms: string[] = Array.isArray(user?.permissionNames)
    ? user.permissionNames.map((p: string) => p.toLowerCase())
    : [];

  // Kiểm tra có ít nhất 1 quyền cần thiết
  const ok = need.some((n) => perms.includes(n.toLowerCase()));

  const loc = useLocation();
  return ok ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace state={{ from: loc }} />
  );
}
