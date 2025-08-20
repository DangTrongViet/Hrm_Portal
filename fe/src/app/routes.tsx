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
import EditUserPage from '../features/users/pages/EditUsersPage';
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

  return (
    <>
      {/* chỉ hiển thị Header khi không phải trang public */}
      {!isPublic && <Header />}

      <Routes>
        {/* public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/activate" element={<ActivatePage />} />

        {/* private */}
        <Route element={<RequireAuth />}>
          <Route path="/me" element={<ProfilePage />} />

          <Route element={<RequirePerm need={['manage_users']} />}>
            <Route path="/employees" element={<EmployeesListPage />} />
            <Route path="/employees/new" element={<EmployeeCreatePage />} />
            <Route path="/employees/:id" element={<EmployeeEditPage />} />
          </Route>

          <Route
            element={<RequirePerm need={['manage_users', 'manage_roles']} />}
          >
            <Route path="/users" element={<UsersListPage />} />
            <Route path="/users/new" element={<UserCreatePage />} />
            <Route path="/users/:id" element={<UserDetailPage />} />
            <Route path="/users/:id/edit" element={<EditUserPage />} />
          </Route>

          <Route element={<RequirePerm need={['manage_roles']} />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/roles" element={<RolesListPage />} />
            <Route path="/roles/new" element={<RoleCreatePage />} />
            <Route path="/roles/:id" element={<RoleDetailPage />} />
            <Route path="/permissions" element={<PermissionsListPage />} />
            <Route path="/permissions/new" element={<PermissionCreatePage />} />
          </Route>

          <Route element={<RequirePerm need={['checkin_checkout']} />}>
            <Route path="/attendance" element={<AttendanceSelfPage />} />
          </Route>
          <Route element={<RequirePerm need={['manage_attendance']} />}>
            <Route path="/attendance/admin" element={<AttendanceAdminPage />} />
          </Route>

          <Route element={<RequirePerm need={['manage_contracts']} />}>
            <Route path="/contracts" element={<ContractListPage />} />
          </Route>

          <Route element={<RequirePerm need={['request_leave']} />}>
            <Route path="/leaves" element={<LeavesPage />} />
          </Route>

          <Route element={<RequirePerm need={['approve_leaves']} />}>
            <Route path="/admin/leaves" element={<AdminLeavePage />} />
          </Route>

          <Route element={<RequirePerm need={['approve_overtime']} />}>
            <Route
              path="/admin/overtimes"
              element={<OvertimeAdminListPage />}
            />
          </Route>
          <Route element={<RequirePerm need={['request_overtime']} />}>
            <Route path="/overtimes" element={<OvertimePage />} />
          </Route>

          <Route element={<RequirePerm need={['calculate_payroll']} />}>
            <Route path="/admin/payroll" element={<PayrollList />} />
          </Route>

          <Route element={<RequirePerm need={['view_payroll']} />}>
            <Route path="/payroll" element={<MyPayrollList />} />
          </Route>
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
