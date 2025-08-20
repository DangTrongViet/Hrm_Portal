import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, Outlet, useLocation } from 'react-router-dom';
export default function RequirePerm({ need }) {
    const raw = localStorage.getItem('currentUser');
    const user = raw ? JSON.parse(raw) : null;
    // Đọc mảng permissionNames nếu tồn tại
    const perms = Array.isArray(user?.permissionNames)
        ? user.permissionNames.map((p) => p.toLowerCase())
        : [];
    // Kiểm tra có ít nhất 1 quyền cần thiết
    const ok = need.some((n) => perms.includes(n.toLowerCase()));
    const loc = useLocation();
    return ok ? (_jsx(Outlet, {})) : (_jsx(Navigate, { to: "/login", replace: true, state: { from: loc } }));
}
