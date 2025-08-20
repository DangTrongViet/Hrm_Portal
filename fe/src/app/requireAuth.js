import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, Outlet, useLocation } from 'react-router-dom';
export default function RequireAuth() {
    const token = localStorage.getItem('token');
    const loc = useLocation();
    if (!token) {
        return _jsx(Navigate, { to: "/login", replace: true, state: { from: loc } });
    }
    return _jsx(Outlet, {});
}
