import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { postJSON } from '../../../lib/http';
import '../../../../public/css/auth/LoginPage.css'; // Import file CSS
export default function LoginPage() {
    const nav = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';
    const { register, handleSubmit, formState: { errors, isSubmitting }, } = useForm({
        defaultValues: { email: '', password: '' },
    });
    const [err, setErr] = useState(null);
    const [showPwd, setShowPwd] = useState(false);
    useEffect(() => {
        if (localStorage.getItem('token'))
            nav('/me', { replace: true });
    }, [nav]);
    const onSubmit = async (values) => {
        setErr(null);
        try {
            const data = await postJSON('/auth/login', values);
            localStorage.setItem('token', data.tokenUser);
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            nav(from, { replace: true });
        }
        catch (e) {
            setErr(e?.message || 'Đăng nhập thất bại');
        }
    };
    return (_jsx("div", { className: "login-container", children: _jsxs("div", { className: "login-wrapper", children: [_jsxs("div", { className: "hero-section", children: [_jsxs("div", { className: "logo-section", children: [_jsx("div", { className: "logo", children: _jsx("svg", { width: "24", height: "24", fill: "white", viewBox: "0 0 24 24", children: _jsx("path", { d: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" }) }) }), _jsx("span", { className: "brand-text", children: "HRM Portal" })] }), _jsxs("div", { className: "hero-content", children: [_jsxs("h1", { children: ["Qu\u1EA3n l\u00FD nh\u00E2n s\u1EF1 ", _jsx("br", {}), _jsx("span", { className: "highlight", children: "nhanh & tr\u1EF1c quan" })] }), _jsx("p", { className: "hero-description", children: "Theo d\u00F5i nh\u00E2n vi\u00EAn, ph\u00F2ng ban, ch\u1EA5m c\u00F4ng v\u00E0 l\u01B0\u01A1ng th\u01B0\u1EDFng v\u1EDBi giao di\u1EC7n hi\u1EC7n \u0111\u1EA1i v\u00E0 tr\u1EF1c quan." }), _jsx("div", { className: "stats-grid", children: [
                                        { number: '10k+', label: 'Hồ sơ' },
                                        { number: '99.9%', label: 'Uptime' },
                                        { number: '5 phút', label: 'Triển khai' },
                                    ].map((stat, index) => (_jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-number", children: stat.number }), _jsx("div", { className: "stat-label", children: stat.label })] }, index))) })] }), _jsxs("div", { className: "copyright", children: ["\u00A9 ", new Date().getFullYear(), " HRM Inc. All rights reserved."] })] }), _jsx("div", { className: "form-section", children: _jsxs("div", { className: "form-container", children: [_jsxs("div", { className: "form-card", children: [_jsxs("div", { className: "form-header", children: [_jsx("div", { className: "form-logo", children: _jsx("svg", { width: "28", height: "28", fill: "white", viewBox: "0 0 24 24", children: _jsx("path", { d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" }) }) }), _jsx("h1", { className: "form-title", children: "\u0110\u0103ng nh\u1EADp" }), _jsx("p", { className: "form-subtitle", children: "Truy c\u1EADp c\u1ED5ng qu\u1EA3n l\u00FD nh\u00E2n s\u1EF1" })] }), err && (_jsxs("div", { className: "error-alert", children: [_jsx("svg", { width: "18", height: "18", fill: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { d: "M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" }) }), _jsx("span", { children: err })] })), _jsxs("div", { className: "login-form", onSubmit: handleSubmit(onSubmit), children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Email" }), _jsxs("div", { className: "input-wrapper", children: [_jsx("input", { ...register('email', {
                                                                    required: 'Vui lòng nhập email',
                                                                }), type: "email", className: `form-input ${errors.email ? 'error' : ''}`, placeholder: "you@company.com" }), errors.email && (_jsxs("div", { className: "error-message", children: [_jsxs("svg", { width: "14", height: "14", fill: "currentColor", viewBox: "0 0 24 24", children: [_jsx("circle", { cx: "12", cy: "12", r: "10" }), _jsx("line", { x1: "12", y1: "8", x2: "12", y2: "12" }), _jsx("line", { x1: "12", y1: "16", x2: "12.01", y2: "16" })] }), errors.email.message] }))] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "M\u1EADt kh\u1EA9u" }), _jsxs("div", { className: "input-wrapper", children: [_jsxs("div", { className: "input-group", children: [_jsx("input", { ...register('password', {
                                                                            required: 'Vui lòng nhập mật khẩu',
                                                                        }), type: showPwd ? 'text' : 'password', className: `form-input ${errors.password ? 'error' : ''}`, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" }), _jsx("button", { type: "button", className: "toggle-password", onClick: () => setShowPwd(!showPwd), children: showPwd ? 'Ẩn' : 'Hiện' })] }), errors.password && (_jsxs("div", { className: "error-message", children: [_jsxs("svg", { width: "14", height: "14", fill: "currentColor", viewBox: "0 0 24 24", children: [_jsx("circle", { cx: "12", cy: "12", r: "10" }), _jsx("line", { x1: "12", y1: "8", x2: "12", y2: "12" }), _jsx("line", { x1: "12", y1: "16", x2: "12.01", y2: "16" })] }), errors.password.message] }))] })] }), _jsxs("div", { className: "form-options", children: [_jsxs("div", { className: "checkbox-wrapper", children: [_jsx("input", { type: "checkbox", id: "remember", className: "checkbox" }), _jsx("label", { htmlFor: "remember", className: "checkbox-label", children: "Ghi nh\u1EDB \u0111\u0103ng nh\u1EADp" })] }), _jsx(Link, { to: "/forgot-password", className: "forgot-link", children: "Qu\u00EAn m\u1EADt kh\u1EA9u?" })] }), _jsxs("button", { type: "button", className: "submit-button", disabled: isSubmitting, onClick: handleSubmit(onSubmit), children: [isSubmitting && _jsx("div", { className: "loading-spinner" }), isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'] })] })] }), _jsx("div", { className: "footer", children: _jsxs("p", { className: "copyright", children: ["\u00A9 ", new Date().getFullYear(), " HRM Inc. All rights reserved."] }) })] }) })] }) }));
}
