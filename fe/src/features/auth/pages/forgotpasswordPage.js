import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { postJSON } from '../../../lib/http';
import '../../../../public/css/auth/forgot-password.css'; // Import CSS file
export default function ForgotPasswordPage() {
    const nav = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);
    const [ok, setOk] = useState(null);
    async function onSubmit(e) {
        e.preventDefault();
        setErr(null);
        setOk(null);
        setLoading(true);
        try {
            const res = await postJSON('/auth/forgotPassword', { email });
            setOk(res.message || 'Đã gửi mã xác minh (hiệu lực 3 phút).');
            setTimeout(() => nav(`/reset-password?email=${encodeURIComponent(email)}`), 600);
        }
        catch (e) {
            setErr(e?.message || 'Yêu cầu thất bại');
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsx("div", { className: "forgot-password-container", children: _jsx("div", { className: "forgot-password-card", children: _jsxs("div", { className: "forgot-password-card-body", children: [_jsxs("div", { className: "forgot-password-header", children: [_jsx("h1", { className: "forgot-password-title", children: "Qu\u00EAn m\u1EADt kh\u1EA9u" }), _jsx(Link, { to: "/login", className: "forgot-password-login-link", children: "\u0110\u0103ng nh\u1EADp" })] }), ok && (_jsxs("div", { className: "alert alert-success", role: "alert", children: [_jsx("svg", { width: "16", height: "16", fill: "currentColor", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2", children: _jsx("path", { d: "M20 6L9 17l-5-5" }) }), _jsx("span", { children: ok })] })), err && (_jsxs("div", { className: "alert alert-danger", role: "alert", children: [_jsxs("svg", { width: "16", height: "16", fill: "currentColor", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2", children: [_jsx("path", { d: "M12 9v4" }), _jsx("path", { d: "M12 17h.01" }), _jsx("path", { d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" })] }), _jsx("span", { children: err })] })), _jsxs("form", { className: "forgot-password-form", onSubmit: onSubmit, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Email" }), _jsx("input", { value: email, onChange: (e) => setEmail(e.target.value), type: "email", required: true, placeholder: "you@company.com", className: "form-control" })] }), _jsx("button", { className: "submit-button", disabled: loading, children: loading ? 'Đang gửi…' : 'Gửi mã xác minh' })] })] }) }) }));
}
