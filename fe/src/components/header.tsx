import { Link, NavLink, useNavigate } from "react-router-dom";
import { postNoBody } from "../lib/http"; // ✅ dùng http helper để có credentials/include
import "../styles/header.css";            // 🔹 khuyên chuyển css vào src/styles (tránh import từ public)

// Kiểu dữ liệu
type NavItem = { to: string; label: string; require?: string[] };

// ⚠️ Đồng bộ tên quyền với BE: dùng dấu gạch dưới (_)
const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Trang chủ", require: ["manage_roles"] }, // was manage-roles
  { to: "/employees", label: "Nhân viên", require: ["manage_users"] },
  { to: "/users", label: "Người dùng", require: ["manage_users", "manage_roles"] },
  { to: "/roles", label: "Vai trò", require: ["manage_roles"] },
  { to: "/permissions", label: "Quyền", require: ["manage_roles"] },
  { to: "/attendance", label: "Chấm công", require: ["checkin_checkout"] },
  { to: "/attendance/admin", label: "QL Chấm công", require: ["manage_attendance"] },
  { to: "/contracts", label: "QL Hợp đồng", require: ["manage_contracts"] },
  { to: "/leaves", label: "QL Đơn nghỉ làm", require: ["request_leave"] },
  { to: "/admin/leaves", label: "QL Đơn nghỉ làm", require: ["approve_leaves"] },
  { to: "/admin/overtimes", label: "QL Tăng ca", require: ["approve_overtime"] },
  { to: "/overtimes", label: "QL Tăng ca", require: ["request_overtime"] },
  { to: "/admin/payroll", label: "Bảng lương", require: ["calculate_payroll"] },
  { to: "/payroll", label: "Bảng lương", require: ["view_payroll"] },
];

// Chuẩn hoá quyền để so sánh (đổi - và _ về _; lowercase)
const norm = (s: string) => String(s || "").replace(/[-\s]/g, "_").toLowerCase();

export default function Header() {
  const nav = useNavigate();

  const raw = localStorage.getItem("currentUser");
  const user = raw ? JSON.parse(raw) : null;

  // Lấy danh sách quyền từ user.permissionNames (mặc định [])
  const perms: string[] = Array.isArray(user?.permissionNames) ? user.permissionNames : [];
  const permsSet = new Set(perms.map(norm));

  // Lọc các item có quyền
  const visible = NAV_ITEMS.filter(
    (i) => !i.require || i.require.some((r) => permsSet.has(norm(r)))
  );

  const displayName = user?.full_name || user?.name || user?.email || "";

  const onLogout = async () => {
    if (!confirm("Bạn có chắc chắn muốn đăng xuất?")) return;

    try {
      // BE clear cookie httpOnly
      await postNoBody("/auth/logout");
    } catch {
      // Ignore lỗi mạng khi logout
    } finally {
      // ✅ Xoá sạch toàn bộ localStorage như bạn yêu cầu
      try {
        localStorage.clear();
        // Phát tín hiệu cho tab khác (nếu có) cũng logout
        localStorage.setItem("__logout__", String(Date.now()));
      } catch {}
      // Điều hướng về trang đăng nhập
      nav("/login", { replace: true });
    }
  };

  return (
    <header className="header sticky-top shadow-sm bg-light">
      <div className="container d-flex align-items-center justify-content-between py-3">
        {/* Brand Section */}
        <Link to="/" className="header-brand text-decoration-none">
          <div className="header-logo" />
          <span className="header-brand-text">HRM Dashboard</span>
        </Link>

        {/* Navigation */}
        <nav className="header-nav d-flex align-items-center gap-2">
          {visible.map((item, index) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              style={{ animationDelay: `${index * 0.05}s` }}
              end={item.to === "/"}
            >
              <span>{item.label}</span>
            </NavLink>
          ))}

          {/* User Section */}
          <div className="user-section ms-3">
            {user ? (
              <>
                {displayName && (
                  <Link
                    to="/me"
                    className="user-name-link d-none d-md-block"
                    title="Xem thông tin cá nhân"
                  >
                    {displayName}
                  </Link>
                )}
                <button onClick={onLogout} className="header-btn btn-logout" type="button">
                  <span>Đăng xuất</span>
                </button>
              </>
            ) : (
              <Link to="/login" className="header-btn btn-login">
                <span>Đăng nhập</span>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
