import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Link, NavLink, useNavigate } from 'react-router-dom';
import '../../public/css/headers/header.css';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const NAV_ITEMS = [
    { to: '/', label: 'Trang chủ', require: ['manage-roles'] },
    { to: '/employees', label: 'Nhân viên', require: ['manage_users'] },
    {
        to: '/users',
        label: 'Người dùng',
        require: ['manage_users', 'manage_roles'],
    },
    { to: '/roles', label: 'Vai trò', require: ['manage_roles'] },
    { to: '/permissions', label: 'Quyền', require: ['manage_roles'] },
    { to: '/attendance', label: 'Chấm công', require: ['checkin_checkout'] },
    {
        to: '/attendance/admin',
        label: 'QL Chấm công',
        require: ['manage_attendance'],
    },
    { to: '/contracts', label: 'QL Hợp đồng', require: ['manage_contracts'] },
    { to: '/leaves', label: 'QL Đơn nghỉ làm', require: ['request_leave'] },
    {
        to: '/admin/leaves',
        label: 'QL Đơn nghỉ làm',
        require: ['approve_leaves'],
    },
    {
        to: '/admin/overtimes',
        label: 'QL Tăng ca',
        require: ['approve_overtime'],
    },
    { to: '/overtimes', label: 'QL Tăng ca', require: ['request_overtime'] },
    { to: '/admin/payroll', label: 'Bảng lương', require: ['calculate_payroll'] },
    { to: '/payroll', label: 'Bảng lương', require: ['view_payroll'] },
];
export default function Header() {
    const nav = useNavigate();
    const raw = localStorage.getItem('currentUser');
    const user = raw ? JSON.parse(raw) : null;
    // Lấy mảng quyền từ currentUser.permissionNames (mặc định [])
    const perms = Array.isArray(user?.permissionNames)
        ? user.permissionNames.map((p) => p.toLowerCase())
        : [];
    // Lọc các item có quyền
    const visible = NAV_ITEMS.filter((i) => !i.require || i.require.some((r) => perms.includes(r.toLowerCase())));
    const displayName = user?.full_name || user?.name || user?.email || '';
    const onLogout = async () => {
        // Confirm logout
        if (!confirm('Bạn có chắc chắn muốn đăng xuất?'))
            return;
        try {
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        }
        catch { }
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        nav('/login', { replace: true });
    };
    return (_jsx("header", { className: "header sticky-top shadow-sm bg-light", children: _jsxs("div", { className: "container d-flex align-items-center justify-content-between py-3", children: [_jsxs(Link, { to: "/", className: "header-brand text-decoration-none", children: [_jsx("div", { className: "header-logo" }), _jsx("span", { className: "header-brand-text", children: "HRM Dashboard" })] }), _jsxs("nav", { className: "header-nav d-flex align-items-center gap-2", children: [visible.map((item, index) => (_jsx(NavLink, { to: item.to, className: ({ isActive }) => `nav-link ${isActive ? 'active' : ''}`, style: { animationDelay: `${index * 0.05}s` }, end: item.to === '/', children: _jsx("span", { children: item.label }) }, item.to))), _jsx("div", { className: "user-section ms-3", children: user ? (_jsxs(_Fragment, { children: [displayName && (_jsx(Link, { to: "/me", className: "user-name-link d-none d-md-block", title: "Xem th\u00F4ng tin c\u00E1 nh\u00E2n", children: displayName })), _jsx("button", { onClick: onLogout, className: "header-btn btn-logout", type: "button", children: _jsx("span", { children: "\u0110\u0103ng xu\u1EA5t" }) })] })) : (_jsx(Link, { to: "/login", className: "header-btn btn-login", children: _jsx("span", { children: "\u0110\u0103ng nh\u1EADp" }) })) })] })] }) }));
}
