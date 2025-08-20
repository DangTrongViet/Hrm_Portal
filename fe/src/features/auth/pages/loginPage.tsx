import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { postJSON, getJSON } from "../../../lib/http";
import "../../../../public/css/auth/LoginPage.css";

interface LoginForm {
  email: string;
  password: string;
}

type RawMe =
  | { user?: any }
  | { data?: any }
  | { id?: number; email?: string; full_name?: string; permissionNames?: string[]; permissions?: string[] };

function pickUser(payload: RawMe | any) {
  if (!payload) return null;
  const u = (payload as any).user ?? (payload as any).data ?? payload;
  if (!u || !u.id) return null;
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

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/";

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    defaultValues: { email: "", password: "" },
  });

  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Nếu đã có phiên (cookie httpOnly), tự động vào app
  useEffect(() => {
    (async () => {
      try {
        const me = await getJSON<RawMe>("/me"); // KHÔNG /api vì BASE đã có /api
        const u = pickUser(me);
        if (u) {
          localStorage.setItem("currentUser", JSON.stringify(u));
          if (location.pathname !== "/me") navigate("/me", { replace: true });
        }
      } catch {
        // chưa đăng nhập → đứng yên tại trang login
      }
    })();
  }, [navigate, location.pathname]);

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    try {
      const resp = await postJSON<{
        message: string;
        user: { id: number; email: string; full_name: string; permissionNames?: string[] };
      }>("/auth/login", data); // KHÔNG /api

      localStorage.setItem("currentUser", JSON.stringify(resp.user));

      // Nếu from === "/" dễ bị guard, chuyển về /me an toàn
      const dest = from !== "/" ? from : "/me";
      navigate(dest, { replace: true });
    } catch (e: any) {
      setError(e?.message || "Đăng nhập thất bại");
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="logo-section">
            <div className="logo">
              <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="brand-text">HRM Portal</span>
          </div>
          <div className="hero-content">
            <h1>
              Quản lý nhân sự <br />
              <span className="highlight">nhanh & trực quan</span>
            </h1>
            <p className="hero-description">
              Theo dõi nhân viên, phòng ban, chấm công và lương thưởng với giao diện hiện đại và trực quan.
            </p>
            <div className="stats-grid">
              {[{ number: "10k+", label: "Hồ sơ" }, { number: "99.9%", label: "Uptime" }, { number: "5 phút", label: "Triển khai" }].map((stat, idx) => (
                <div key={idx} className="stat-card">
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="copyright">© {new Date().getFullYear()} HRM Inc. All rights reserved.</div>
        </div>

        {/* Form Section */}
        <div className="form-section">
          <div className="form-container">
            <div className="form-card">
              <div className="form-header">
                <div className="form-logo">
                  <svg width="28" height="28" fill="white" viewBox="0 0 24 24">
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h1 className="form-title">Đăng nhập</h1>
                <p className="form-subtitle">Truy cập cổng quản lý nhân sự</p>
              </div>

              {error && <div className="error-alert"><span>{error}</span></div>}

              <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    {...register("email", { required: "Vui lòng nhập email" })}
                    type="email"
                    className={`form-input ${errors.email ? "error" : ""}`}
                    placeholder="you@company.com"
                  />
                  {errors.email && <div className="error-message">{errors.email.message}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Mật khẩu</label>
                  <div className="input-group">
                    <input
                      {...register("password", { required: "Vui lòng nhập mật khẩu" })}
                      type={showPassword ? "text" : "password"}
                      className={`form-input ${errors.password ? "error" : ""}`}
                      placeholder="••••••••"
                    />
                    <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? "Ẩn" : "Hiện"}
                    </button>
                  </div>
                  {errors.password && <div className="error-message">{errors.password.message}</div>}
                </div>

                <div className="form-options">
                  <div className="checkbox-wrapper">
                    <input type="checkbox" id="remember" className="checkbox" />
                    <label htmlFor="remember" className="checkbox-label">Ghi nhớ đăng nhập</label>
                  </div>
                  <Link to="/forgot-password" className="forgot-link">Quên mật khẩu?</Link>
                </div>

                <button type="submit" className="submit-button" disabled={isSubmitting}>
                  {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>
              </form>
            </div>

            <div className="footer">
              <p className="copyright">© {new Date().getFullYear()} HRM Inc. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
