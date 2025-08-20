// src/pages/auth/LoginPage.tsx
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiPost, apiMe } from '../../../lib/api';
import '../../../../public/css/auth/LoginPage.css';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const nav = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    defaultValues: { email: '', password: '' },
  });

  const [err, setErr] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);

  // Check login từ cookie
  useEffect(() => {
    async function checkLogin() {
      try {
        await apiMe();
        nav(from, { replace: true });
      } catch {}
    }
    checkLogin();
  }, [nav, from]);

  const onSubmit = async (values: LoginForm) => {
    setErr(null);
    try {
      await apiPost('/auth/login', values); // backend set cookie
      nav(from, { replace: true });
    } catch (e: any) {
      setErr(e?.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        {/* Hero Section ... giữ nguyên ... */}

        <div className="form-section">
          <div className="form-container">
            <div className="form-card">
              {err && <div className="error-alert">{err}</div>}

              <form onSubmit={handleSubmit(onSubmit)} className="login-form">
                <input
                  {...register('email', { required: 'Vui lòng nhập email' })}
                  type="email"
                  placeholder="you@company.com"
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <div>{errors.email.message}</div>}

                <div className="input-group">
                  <input
                    {...register('password', { required: 'Vui lòng nhập mật khẩu' })}
                    type={showPwd ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={errors.password ? 'error' : ''}
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}>
                    {showPwd ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
                {errors.password && <div>{errors.password.message}</div>}

                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
