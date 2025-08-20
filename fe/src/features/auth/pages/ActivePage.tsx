import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiPost } from '../../../lib/api';
import '../../../../public/css/auth/activate-page.css'; // Import CSS file

export default function ActivatePage() {
  const [sp] = useSearchParams();
  const token = sp.get('token') || '';
  const nav = useNavigate();
  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  // Validation logic
  const isPasswordValid = pwd.length >= 8;
  const isPasswordMatch = pwd === pwd2 && pwd2.length > 0;
  const can = isPasswordValid && isPasswordMatch && !!token && !loading;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!can) return;
    setLoading(true);
    setErr('');
    try {
      await apiPost('/auth/activate', { token, newPassword: pwd });
      alert('Kích hoạt thành công. Hãy đăng nhập.');
      nav('/login', { replace: true });
    } catch (e: any) {
      setErr(e?.message || 'Kích hoạt thất bại hoặc token đã hết hạn');
    } finally {
      setLoading(false);
    }
  };

  // Get validation classes for inputs
  const getPasswordClass = () => {
    if (pwd.length === 0) return 'form-control';
    return `form-control ${isPasswordValid ? 'valid' : 'invalid'}`;
  };

  const getConfirmPasswordClass = () => {
    if (pwd2.length === 0) return 'form-control';
    return `form-control ${isPasswordMatch ? 'valid' : 'invalid'}`;
  };

  return (
    <div className="activate-container">
      <div className="activate-card">
        <div className="activate-card-body">
          <h1 className="activate-title">Kích hoạt tài khoản</h1>

          {!token && (
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
              <span>Thiếu token.</span>
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

          <form onSubmit={onSubmit} className="activate-form">
            <div className="form-group">
              <label className="form-label">Mật khẩu mới</label>
              <input
                type="password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                className={getPasswordClass()}
                placeholder="Ít nhất 8 ký tự"
              />
              {pwd.length > 0 && (
                <div
                  className={`password-requirements ${isPasswordValid ? 'valid' : 'invalid'}`}
                >
                  {isPasswordValid
                    ? '✓ Mật khẩu hợp lệ'
                    : '✗ Mật khẩu phải có ít nhất 8 ký tự'}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Nhập lại mật khẩu</label>
              <input
                type="password"
                value={pwd2}
                onChange={(e) => setPwd2(e.target.value)}
                className={getConfirmPasswordClass()}
                placeholder="Nhập lại mật khẩu"
              />
              {pwd2.length > 0 && (
                <div
                  className={`password-requirements ${isPasswordMatch ? 'valid' : 'invalid'}`}
                >
                  {isPasswordMatch
                    ? '✓ Mật khẩu khớp'
                    : '✗ Mật khẩu không khớp'}
                </div>
              )}
            </div>

            <button
              disabled={!can}
              className={`submit-button ${loading ? 'loading' : ''}`}
            >
              {loading ? 'Đang kích hoạt...' : 'Kích hoạt'}
            </button>
          </form>
        </div>

        <div className="activate-footer">
          © {new Date().getFullYear()} HRM Inc. All rights reserved.
        </div>
      </div>
    </div>
  );
}
