import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { ApiMessage } from '../../../types/api';
import { postJSON } from '../../../lib/http';
import type { FormEvent } from 'react';
import '../../../../public/css/auth/forgot-password.css'; // Import CSS file

export default function ForgotPasswordPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);
    setLoading(true);
    try {
      const res = await postJSON<ApiMessage>('/auth/forgotPassword', { email });
      setOk(res.message || 'Đã gửi mã xác minh (hiệu lực 3 phút).');
      setTimeout(
        () => nav(`/reset-password?email=${encodeURIComponent(email)}`),
        600
      );
    } catch (e: any) {
      setErr(e?.message || 'Yêu cầu thất bại');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="forgot-password-card-body">
          <div className="forgot-password-header">
            <h1 className="forgot-password-title">Quên mật khẩu</h1>
            <Link to="/login" className="forgot-password-login-link">
              Đăng nhập
            </Link>
          </div>

          {ok && (
            <div className="alert alert-success" role="alert">
              <svg
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span>{ok}</span>
            </div>
          )}
          {err && (
            <div className="alert alert-danger" role="alert">
              <svg
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
              </svg>
              <span>{err}</span>
            </div>
          )}

          <form className="forgot-password-form" onSubmit={onSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder="you@company.com"
                className="form-control"
              />
            </div>
            <button className="submit-button" disabled={loading}>
              {loading ? 'Đang gửi…' : 'Gửi mã xác minh'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
