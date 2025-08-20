import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { patchJSON } from '../../../lib/http'; // Hàm gửi PATCH request
import '../../../../public/css/auth/reset-pasword.css';
export default function ResetPasswordPage() {
    const nav = useNavigate();
    const [searchParams] = useSearchParams();
    const initialEmail = searchParams.get('email') || '';
    const [email, setEmail] = useState(initialEmail);
    const [otpCode, setOtpCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);
    const [ok, setOk] = useState(null);
    // State validation errors
    const [validationErrors, setValidationErrors] = useState({});
    // Hàm validate form
    function validateForm() {
        const errors = {};
        if (!email) {
            errors.email = 'Email không được để trống';
        }
        else if (!/^[\w.-]+@[\w.-]+\.\w{2,}$/.test(email)) {
            errors.email = 'Email không hợp lệ';
        }
        if (!otpCode) {
            errors.otpCode = 'Mã OTP không được để trống';
        }
        if (!newPassword) {
            errors.newPassword = 'Mật khẩu mới không được để trống';
        }
        else if (newPassword.length < 8) {
            errors.newPassword = 'Mật khẩu mới phải tối thiểu 8 ký tự';
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    }
    // Xử lý submit form
    async function onSubmit(e) {
        e.preventDefault();
        setErr(null);
        setOk(null);
        if (!validateForm())
            return;
        setLoading(true);
        try {
            const res = await patchJSON('/auth/resetPassword', {
                email,
                otpCode,
                newPassword,
            });
            if (res.data.ok) {
                setOk(res.message || 'Đổi mật khẩu thành công! Chuyển hướng sang đăng nhập…');
                setTimeout(() => nav('/login'), 2000);
            }
            else {
                setErr(res.message || 'Đổi mật khẩu thất bại');
            }
        }
        catch (e) {
            console.error('Error:', e);
            const message = e?.message || 'Đổi mật khẩu thất bại';
            setErr(message);
            // Redirect về trang quên mật khẩu nếu OTP hết hạn
            if (message.includes('OTP đã hết hạn') ||
                message.includes('OTP không hợp lệ')) {
                setTimeout(() => nav('/forgot-password'), 2000);
            }
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsx("div", { className: "reset-password-container", children: _jsxs("div", { className: "reset-password-card", children: [_jsx("h1", { children: "\u0110\u1EB7t l\u1EA1i m\u1EADt kh\u1EA9u" }), ok && _jsx("div", { className: "alert alert-success", children: ok }), err && _jsx("div", { className: "alert alert-danger", children: err }), _jsxs("form", { onSubmit: onSubmit, className: "reset-password-form", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Email" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "form-control", placeholder: "you@company.com" }), validationErrors.email && (_jsx("div", { className: "validation-error", children: validationErrors.email }))] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "OTP code" }), _jsx("input", { type: "text", value: otpCode, onChange: (e) => setOtpCode(e.target.value), className: "form-control", placeholder: "Nh\u1EADp m\u00E3 OTP" }), validationErrors.otpCode && (_jsx("div", { className: "validation-error", children: validationErrors.otpCode }))] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "M\u1EADt kh\u1EA9u m\u1EDBi" }), _jsx("input", { type: "password", value: newPassword, onChange: (e) => setNewPassword(e.target.value), className: "form-control", placeholder: "T\u1ED1i thi\u1EC3u 8 k\u00FD t\u1EF1" }), validationErrors.newPassword && (_jsx("div", { className: "validation-error", children: validationErrors.newPassword }))] }), _jsx("button", { className: "submit-button", disabled: loading, children: loading ? 'Đang gửi…' : 'Đổi mật khẩu' })] })] }) }));
}
