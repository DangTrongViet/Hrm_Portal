import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/routes/index.tsx
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import RequireAuth from './requireAuth';
import RequirePerm from './requirePerm';
import Header from '../components/header';
import LoginPage from '../features/auth/pages/loginPage';
import ForgotPasswordPage from '../features/auth/pages/forgotpasswordPage';
import ResetPasswordPage from '../features/auth/pages/resetpasswordPage';
import ActivatePage from '../features/auth/pages/ActivePage';
import ProfilePage from '../features/account/pages/ProfilePage';
import EmployeesListPage from '../features/employees/pages/EmployeeListPage';
import EmployeeCreatePage from '../features/employees/pages/EmployeeCreatePage';
import EmployeeEditPage from '../features/employees/pages/EmployeeEditPage';
import UsersListPage from '../features/users/pages/UsersListPage';
import UserCreatePage from '../features/users/pages/UserCreatePage';
import UserDetailPage from '../features/users/pages/UserDetailPage';
import RolesListPage from '../features/roles/pages/RoleListPage';
import RoleCreatePage from '../features/roles/pages/RoleCreatePage';
import RoleDetailPage from '../features/roles/pages/RoleDetailPage';
import PermissionsListPage from '../features/permissions/pages/PermissionListPage';
import PermissionCreatePage from '../features/permissions/pages/PermissionCreatePage';
import AttendanceSelfPage from '../features/attendence/pages/AttendanceSelfPage';
import AttendanceAdminPage from '../features/attendence/pages/AttendanceAdminPage';
import ContractListPage from '../features/contract/pages/ContractListPage';
import LeavesPage from '../features/leave/pages/leavePage';
import AdminLeavePage from '../features/leave/pages/AdminLeavePage';
import OvertimeAdminListPage from '../features/overtime/pages/OvertimeAdminListPage';
import OvertimePage from '../features/overtime/pages/OvertimePage';
import PayrollList from '../features/payroll/pages/PayrollAdminListPage';
import MyPayrollList from '../features/payroll/pages/MyPayrollPage';
import Dashboard from '../features/dashboard/pages/DashboardAdminPage';
export default function AppRoutes() {
    const location = useLocation();
    // các route public (không hiển thị Header)
    const publicPaths = [
        '/login',
        '/forgot-password',
        '/reset-password',
        '/activate',
    ];
    const isPublic = publicPaths.includes(location.pathname);
    return (_jsxs(_Fragment, { children: [!isPublic && _jsx(Header, {}), _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/forgot-password", element: _jsx(ForgotPasswordPage, {}) }), _jsx(Route, { path: "/reset-password", element: _jsx(ResetPasswordPage, {}) }), _jsx(Route, { path: "/activate", element: _jsx(ActivatePage, {}) }), _jsxs(Route, { element: _jsx(RequireAuth, {}), children: [_jsx(Route, { path: "/me", element: _jsx(ProfilePage, {}) }), _jsxs(Route, { element: _jsx(RequirePerm, { need: ['manage_users'] }), children: [_jsx(Route, { path: "/employees", element: _jsx(EmployeesListPage, {}) }), _jsx(Route, { path: "/employees/new", element: _jsx(EmployeeCreatePage, {}) }), _jsx(Route, { path: "/employees/:id", element: _jsx(EmployeeEditPage, {}) })] }), _jsxs(Route, { element: _jsx(RequirePerm, { need: ['manage_users', 'manage_roles'] }), children: [_jsx(Route, { path: "/users", element: _jsx(UsersListPage, {}) }), _jsx(Route, { path: "/users/new", element: _jsx(UserCreatePage, {}) }), _jsx(Route, { path: "/users/:id", element: _jsx(UserDetailPage, {}) })] }), _jsxs(Route, { element: _jsx(RequirePerm, { need: ['manage_roles'] }), children: [_jsx(Route, { path: "/", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/roles", element: _jsx(RolesListPage, {}) }), _jsx(Route, { path: "/roles/new", element: _jsx(RoleCreatePage, {}) }), _jsx(Route, { path: "/roles/:id", element: _jsx(RoleDetailPage, {}) }), _jsx(Route, { path: "/permissions", element: _jsx(PermissionsListPage, {}) }), _jsx(Route, { path: "/permissions/new", element: _jsx(PermissionCreatePage, {}) })] }), _jsx(Route, { element: _jsx(RequirePerm, { need: ['checkin_checkout'] }), children: _jsx(Route, { path: "/attendance", element: _jsx(AttendanceSelfPage, {}) }) }), _jsx(Route, { element: _jsx(RequirePerm, { need: ['manage_attendance'] }), children: _jsx(Route, { path: "/attendance/admin", element: _jsx(AttendanceAdminPage, {}) }) }), _jsx(Route, { element: _jsx(RequirePerm, { need: ['manage_contracts'] }), children: _jsx(Route, { path: "/contracts", element: _jsx(ContractListPage, {}) }) }), _jsx(Route, { element: _jsx(RequirePerm, { need: ['request_leave'] }), children: _jsx(Route, { path: "/leaves", element: _jsx(LeavesPage, {}) }) }), _jsx(Route, { element: _jsx(RequirePerm, { need: ['approve_leaves'] }), children: _jsx(Route, { path: "/admin/leaves", element: _jsx(AdminLeavePage, {}) }) }), _jsx(Route, { element: _jsx(RequirePerm, { need: ['approve_overtime'] }), children: _jsx(Route, { path: "/admin/overtimes", element: _jsx(OvertimeAdminListPage, {}) }) }), _jsx(Route, { element: _jsx(RequirePerm, { need: ['request_overtime'] }), children: _jsx(Route, { path: "/overtimes", element: _jsx(OvertimePage, {}) }) }), _jsx(Route, { element: _jsx(RequirePerm, { need: ['calculate_payroll'] }), children: _jsx(Route, { path: "/admin/payroll", element: _jsx(PayrollList, {}) }) }), _jsx(Route, { element: _jsx(RequirePerm, { need: ['view_payroll'] }), children: _jsx(Route, { path: "/payroll", element: _jsx(MyPayrollList, {}) }) })] }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] })] }));
}
