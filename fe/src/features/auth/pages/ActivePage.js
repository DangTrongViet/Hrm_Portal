import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    const onSubmit = async (e) => {
        e.preventDefault();
        if (!can)
            return;
        setLoading(true);
        setErr('');
        try {
            await apiPost('/auth/activate', { token, newPassword: pwd });
            alert('Kích hoạt thành công. Hãy đăng nhập.');
            nav('/login', { replace: true });
        }
        catch (e) {
            setErr(e?.message || 'Kích hoạt thất bại hoặc token đã hết hạn');
        }
        finally {
            setLoading(false);
        }
    };
    // Get validation classes for inputs
    const getPasswordClass = () => {
        if (pwd.length === 0)
            return 'form-control';
        return `form-control ${isPasswordValid ? 'valid' : 'invalid'}`;
    };
    const getConfirmPasswordClass = () => {
        if (pwd2.length === 0)
            return 'form-control';
        return `form-control ${isPasswordMatch ? 'valid' : 'invalid'}`;
    };
    return (_jsx("div", { className: "activate-container", children: _jsxs("div", { className: "activate-card", children: [_jsxs("div", { className: "activate-card-body", children: [_jsx("h1", { className: "activate-title", children: "K\u00EDch ho\u1EA1t t\u00E0i kho\u1EA3n" }), !token && (_jsxs("div", { className: "alert alert-danger", role: "alert", children: [_jsxs("svg", { width: "16", height: "16", fill: "currentColor", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2", children: [_jsx("path", { d: "M12 9v4" }), _jsx("path", { d: "M12 17h.01" }), _jsx("path", { d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" })] }), _jsx("span", { children: "Thi\u1EBFu token." })] })), err && (_jsxs("div", { className: "alert alert-danger", role: "alert", children: [_jsxs("svg", { width: "16", height: "16", fill: "currentColor", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2", children: [_jsx("path", { d: "M12 9v4" }), _jsx("path", { d: "M12 17h.01" }), _jsx("path", { d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" })] }), _jsx("span", { children: err })] })), _jsxs("form", { onSubmit: onSubmit, className: "activate-form", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "M\u1EADt kh\u1EA9u m\u1EDBi" }), _jsx("input", { type: "password", value: pwd, onChange: (e) => setPwd(e.target.value), className: getPasswordClass(), placeholder: "\u00CDt nh\u1EA5t 8 k\u00FD t\u1EF1" }), pwd.length > 0 && (_jsx("div", { className: `password-requirements ${isPasswordValid ? 'valid' : 'invalid'}`, children: isPasswordValid
                                                ? '✓ Mật khẩu hợp lệ'
                                                : '✗ Mật khẩu phải có ít nhất 8 ký tự' }))] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Nh\u1EADp l\u1EA1i m\u1EADt kh\u1EA9u" }), _jsx("input", { type: "password", value: pwd2, onChange: (e) => setPwd2(e.target.value), className: getConfirmPasswordClass(), placeholder: "Nh\u1EADp l\u1EA1i m\u1EADt kh\u1EA9u" }), pwd2.length > 0 && (_jsx("div", { className: `password-requirements ${isPasswordMatch ? 'valid' : 'invalid'}`, children: isPasswordMatch
                                                ? '✓ Mật khẩu khớp'
                                                : '✗ Mật khẩu không khớp' }))] }), _jsx("button", { disabled: !can, className: `submit-button ${loading ? 'loading' : ''}`, children: loading ? 'Đang kích hoạt...' : 'Kích hoạt' })] })] }), _jsxs("div", { className: "activate-footer", children: ["\u00A9 ", new Date().getFullYear(), " HRM Inc. All rights reserved."] })] }) }));
}
