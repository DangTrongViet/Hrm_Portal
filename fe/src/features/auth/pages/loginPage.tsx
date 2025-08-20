import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import type { LoginResp } from '../../../types/api';
import { postJSON } from '../../../lib/http';
import '../../../../public/css/auth/LoginPage.css'; // Import file CSS

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const nav = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    defaultValues: { email: '', password: '' },
  });
  const [err, setErr] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('token')) nav('/me', { replace: true });
  }, [nav]);

  const onSubmit = async (values: LoginForm) => {
    setErr(null);
    try {
      const data = await postJSON<LoginResp>('/auth/login', values);
      localStorage.setItem('token', data.tokenUser);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      nav(from, { replace: true });
    } catch (e: any) {
      setErr(e?.message || 'Đăng nhập thất bại');
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
              Theo dõi nhân viên, phòng ban, chấm công và lương thưởng với giao
              diện hiện đại và trực quan.
            </p>
            <div className="stats-grid">
              {[
                { number: '10k+', label: 'Hồ sơ' },
                { number: '99.9%', label: 'Uptime' },
                { number: '5 phút', label: 'Triển khai' },
              ].map((stat, index) => (
                <div key={index} className="stat-card">
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="copyright">
            © {new Date().getFullYear()} HRM Inc. All rights reserved.
          </div>
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

              {err && (
                <div className="error-alert">
                  <svg
                    width="18"
                    height="18"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  <span>{err}</span>
                </div>
              )}

              <div className="login-form" onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <div className="input-wrapper">
                    <input
                      {...register('email', {
                        required: 'Vui lòng nhập email',
                      })}
                      type="email"
                      className={`form-input ${errors.email ? 'error' : ''}`}
                      placeholder="you@company.com"
                    />
                    {errors.email && (
                      <div className="error-message">
                        <svg
                          width="14"
                          height="14"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        {errors.email.message}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Mật khẩu</label>
                  <div className="input-wrapper">
                    <div className="input-group">
                      <input
                        {...register('password', {
                          required: 'Vui lòng nhập mật khẩu',
                        })}
                        type={showPwd ? 'text' : 'password'}
                        className={`form-input ${errors.password ? 'error' : ''}`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowPwd(!showPwd)}
                      >
                        {showPwd ? 'Ẩn' : 'Hiện'}
                      </button>
                    </div>
                    {errors.password && (
                      <div className="error-message">
                        <svg
                          width="14"
                          height="14"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        {errors.password.message}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-options">
                  <div className="checkbox-wrapper">
                    <input type="checkbox" id="remember" className="checkbox" />
                    <label htmlFor="remember" className="checkbox-label">
                      Ghi nhớ đăng nhập
                    </label>
                  </div>
                  <Link to="/forgot-password" className="forgot-link">
                    Quên mật khẩu?
                  </Link>
                </div>

                <button
                  type="button"
                  className="submit-button"
                  disabled={isSubmitting}
                  onClick={handleSubmit(onSubmit)}
                >
                  {isSubmitting && <div className="loading-spinner"></div>}
                  {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>
              </div>
            </div>

            <div className="footer">
              <p className="copyright">
                © {new Date().getFullYear()} HRM Inc. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
