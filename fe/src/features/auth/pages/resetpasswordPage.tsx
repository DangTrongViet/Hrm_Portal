import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { patchJSON } from '../../../lib/http'; // Hàm gửi PATCH request
import type { FormEvent } from 'react';
import '../../../../public/css/auth/reset-pasword.css';

// Kiểu dữ liệu response từ backend
type ApiResponse<T = any> = {
  ok: boolean;
  data: {
    ok: boolean;
  };
  message?: string;
};

export default function ResetPasswordPage() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();

  const initialEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // State validation errors
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    otpCode?: string;
    newPassword?: string;
  }>({});

  // Hàm validate form
  function validateForm() {
    const errors: { email?: string; otpCode?: string; newPassword?: string } =
      {};

    if (!email) {
      errors.email = 'Email không được để trống';
    } else if (!/^[\w.-]+@[\w.-]+\.\w{2,}$/.test(email)) {
      errors.email = 'Email không hợp lệ';
    }

    if (!otpCode) {
      errors.otpCode = 'Mã OTP không được để trống';
    }

    if (!newPassword) {
      errors.newPassword = 'Mật khẩu mới không được để trống';
    } else if (newPassword.length < 8) {
      errors.newPassword = 'Mật khẩu mới phải tối thiểu 8 ký tự';
    }

    setValidationErrors(errors);

    return Object.keys(errors).length === 0;
  }

  // Xử lý submit form
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      const res = await patchJSON<ApiResponse<null>>('/auth/resetPassword', {
        email,
        otpCode,
        newPassword,
      });

      if (res.data.ok) {
        setOk(
          res.message || 'Đổi mật khẩu thành công! Chuyển hướng sang đăng nhập…'
        );
        setTimeout(() => nav('/login'), 2000);
      } else {
        setErr(res.message || 'Đổi mật khẩu thất bại');
      }
    } catch (e: any) {
      console.error('Error:', e);
      const message = e?.message || 'Đổi mật khẩu thất bại';
      setErr(message);

      // Redirect về trang quên mật khẩu nếu OTP hết hạn
      if (
        message.includes('OTP đã hết hạn') ||
        message.includes('OTP không hợp lệ')
      ) {
        setTimeout(() => nav('/forgot-password'), 2000);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h1>Đặt lại mật khẩu</h1>

        {ok && <div className="alert alert-success">{ok}</div>}
        {err && <div className="alert alert-danger">{err}</div>}

        <form onSubmit={onSubmit} className="reset-password-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              placeholder="you@company.com"
            />
            {validationErrors.email && (
              <div className="validation-error">{validationErrors.email}</div>
            )}
          </div>

          <div className="form-group">
            <label>OTP code</label>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              className="form-control"
              placeholder="Nhập mã OTP"
            />
            {validationErrors.otpCode && (
              <div className="validation-error">{validationErrors.otpCode}</div>
            )}
          </div>

          <div className="form-group">
            <label>Mật khẩu mới</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="form-control"
              placeholder="Tối thiểu 8 ký tự"
            />
            {validationErrors.newPassword && (
              <div className="validation-error">
                {validationErrors.newPassword}
              </div>
            )}
          </div>

          <button className="submit-button" disabled={loading}>
            {loading ? 'Đang gửi…' : 'Đổi mật khẩu'}
          </button>
        </form>
      </div>
    </div>
  );
}
