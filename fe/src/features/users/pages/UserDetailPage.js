import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiGet, apiPost } from '../../../lib/api';
import '../../../../public/css/users/UserDetailPage.css';
export default function UserDetailPage() {
    const { id } = useParams();
    const nav = useNavigate();
    const [data, setData] = useState(null);
    const [roleNames, setRoleNames] = useState(null);
    const [newRoleName, setNewRoleName] = useState('');
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState('');
    const [changing, setChanging] = useState(false);
    const [doing, setDoing] = useState(false); // trạng thái hành động nút
    const loadUser = async () => {
        setLoading(true);
        setErr('');
        try {
            const u = await apiGet(`/users/${id}`);
            setData(u);
            setNewRoleName(u.role?.name ?? '');
        }
        catch (e) {
            setErr(e?.message || 'Không tải được chi tiết user');
        }
        finally {
            setLoading(false);
        }
    };
    const loadAllRoleNames = async () => {
        try {
            const res = await apiGet(`/roles/rolesName?minimal=1`);
            const names = Array.isArray(res)
                ? typeof res[0] === 'string'
                    ? res
                    : res.map((r) => r.name)
                : Array.isArray(res?.data)
                    ? typeof res.data[0] === 'string'
                        ? res.data
                        : res.data.map((r) => r.name)
                    : [];
            setRoleNames(names);
        }
        catch (e) {
            alert(e?.message || 'Không tải được danh sách vai trò');
        }
    };
    useEffect(() => {
        loadUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);
    const initials = useMemo(() => {
        const n = (data?.name || '').trim();
        if (!n)
            return 'U';
        const parts = n.split(/\s+/);
        const first = parts[0]?.[0] || '';
        const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
        return (first + last).toUpperCase();
    }, [data?.name]);
    const onStartChangeRole = async () => {
        setChanging(true);
        if (!roleNames)
            await loadAllRoleNames();
    };
    const onCancelChangeRole = () => {
        setChanging(false);
        setRoleNames(null);
        setNewRoleName(data?.role?.name ?? '');
    };
    const onAssignRole = async () => {
        if (!newRoleName || !id)
            return;
        try {
            setDoing(true);
            await apiPost(`/users/${id}/role`, { roleName: newRoleName });
            await loadUser();
            setChanging(false);
            setRoleNames(null);
        }
        catch (e) {
            alert(e?.message || 'Gán role thất bại');
        }
        finally {
            setDoing(false);
        }
    };
    const onResetPassword = async () => {
        if (!id)
            return;
        if (!confirm('Gửi email đặt lại mật khẩu cho người dùng này?'))
            return;
        try {
            setDoing(true);
            await apiPost(`/users/${id}/reset-password`);
            alert('Đã gửi email reset (nếu cấu hình mailer)');
        }
        catch (e) {
            alert(e?.message || 'Không gửi được reset email');
        }
        finally {
            setDoing(false);
        }
    };
    if (loading) {
        return (_jsxs("div", { className: "container py-5 text-center text-muted", children: [_jsx("div", { className: "spinner-border text-primary", style: { width: '3rem', height: '3rem' }, role: "status", children: _jsx("span", { className: "visually-hidden", children: "\u0110ang t\u1EA3i\u2026" }) }), _jsx("p", { className: "mt-3", children: "\u0110ang t\u1EA3i chi ti\u1EBFt ng\u01B0\u1EDDi d\u00F9ng..." })] }));
    }
    if (err) {
        return (_jsx("div", { className: "container py-5", children: _jsxs("div", { className: "alert alert-danger d-flex align-items-center gap-2", role: "alert", children: [_jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "currentColor", children: [_jsx("path", { d: "M12 9v4" }), _jsx("path", { d: "M12 17h.01" }), _jsx("path", { d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" })] }), _jsx("span", { children: err })] }) }));
    }
    if (!data) {
        return (_jsxs("div", { className: "container py-5 text-center text-muted", children: [_jsxs("svg", { className: "mb-2 text-muted", width: "24", height: "24", fill: "currentColor", viewBox: "0 0 16 16", children: [_jsx("path", { d: "M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z" }), _jsx("path", { d: "M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0z" })] }), _jsx("p", { children: "Kh\u00F4ng t\u00ECm th\u1EA5y ng\u01B0\u1EDDi d\u00F9ng" })] }));
    }
    return (_jsx("div", { className: "container py-5", children: _jsxs("div", { className: "card user-card mb-4", children: [_jsxs("div", { className: "card-body user-header p-4", children: [_jsx("nav", { "aria-label": "breadcrumb", children: _jsxs("ol", { className: "breadcrumb breadcrumb-lite mb-3", children: [_jsx("li", { className: "breadcrumb-item", children: _jsx(Link, { className: "text-white text-decoration-none", to: "/users", children: "Ng\u01B0\u1EDDi d\u00F9ng" }) }), _jsx("li", { className: "breadcrumb-item active text-white-50", "aria-current": "page", children: "Chi ti\u1EBFt" })] }) }), _jsxs("div", { className: "d-flex align-items-center justify-content-between gap-3 flex-wrap", children: [_jsxs("div", { className: "d-flex align-items-center gap-3", children: [_jsx("div", { className: "avatar-circle", children: initials }), _jsxs("div", { children: [_jsx("h1", { className: "h4 fw-bold mb-1 gradient-text", children: data.name }), _jsxs("div", { className: "small", children: [_jsx("span", { className: `badge ${data.status === 'active' ? 'text-bg-success' : 'text-bg-warning'} bg-gradient me-2`, children: data.status === 'active'
                                                                ? 'Đang hoạt động'
                                                                : 'Ngưng hoạt động' }), data.role?.name && (_jsx("span", { className: "badge text-bg-light text-dark", children: data.role.name }))] })] })] }), _jsxs("div", { className: "d-flex gap-2", children: [_jsx("button", { onClick: () => nav(-1), className: "btn btn-outline-light btn-sm hrm-btn", children: "Quay l\u1EA1i" }), _jsxs("button", { onClick: onResetPassword, className: "btn btn-warning bg-gradient btn-sm hrm-btn", disabled: doing, children: [doing ? (_jsx("span", { className: "spinner-border spinner-border-sm me-2" })) : (_jsx("i", { className: "bi bi-shield-lock me-2" })), "G\u1EEDi email reset"] })] })] })] }), _jsxs("div", { className: "card-body", children: [_jsxs("div", { className: "info-card p-4 mb-4", children: [_jsx("h2", { className: "h6 fw-bold text-primary mb-3", children: "Th\u00F4ng tin ng\u01B0\u1EDDi d\u00F9ng" }), _jsxs("div", { className: "row g-4 info-grid", children: [_jsx(Info, { label: "H\u1ECD t\u00EAn", value: data.name }), _jsx(Info, { label: "Email", value: _jsx("span", { className: "text-info-emphasis", children: data.email }) }), _jsx(Info, { label: "S\u0110T", value: data.phoneNumber || '—' }), _jsx(Info, { label: "\u0110\u1ECBa ch\u1EC9", value: data.address || '—' }), _jsx(Info, { label: "Ng\u00E0y sinh", value: data.birthDate
                                                ? new Date(data.birthDate).toLocaleDateString('vi-VN')
                                                : '—' }), _jsx(Info, { label: "X\u00E1c minh", value: data.isVerified ? (_jsx("span", { className: "text-success fw-semibold", children: "\u0110\u00E3 x\u00E1c minh" })) : (_jsx("span", { className: "text-danger fw-semibold", children: "Ch\u01B0a x\u00E1c minh" })) }), _jsx(Info, { label: "Ph\u1EA3i \u0111\u1ED5i m\u1EADt kh\u1EA9u", value: data.mustChangePassword ? (_jsx("span", { className: "text-warning fw-semibold", children: "C\u00F3" })) : ('Không') }), _jsx(Info, { label: "Vai tr\u00F2 hi\u1EC7n t\u1EA1i", value: data.role?.name || '—' }), _jsxs("div", { className: "col-12", children: [_jsx("div", { className: "label", children: "Quy\u1EC1n hi\u1EC7n c\u00F3" }), _jsx("div", { className: "d-flex flex-wrap gap-2", children: data.permissionNames.length ? (data.permissionNames.map((p) => (_jsx("span", { className: "badge-perm", children: p }, p)))) : (_jsx("span", { className: "text-muted", children: "\u2014" })) })] }), _jsxs("div", { className: "col-12 meta-block small text-muted", children: [_jsxs("span", { className: "me-3", children: ["T\u1EA1o l\u00FAc:", ' ', _jsx("strong", { className: "text-dark", children: new Date(data.createdAt).toLocaleString('vi-VN') })] }), _jsxs("span", { className: "me-3", children: ["C\u1EADp nh\u1EADt:", ' ', _jsx("strong", { className: "text-dark", children: new Date(data.updatedAt).toLocaleString('vi-VN') })] }), _jsxs("span", { children: ["\u0110\u0103ng nh\u1EADp g\u1EA7n nh\u1EA5t:", ' ', _jsx("strong", { className: "text-dark", children: data.lastLoginAt
                                                                ? new Date(data.lastLoginAt).toLocaleString('vi-VN')
                                                                : '—' })] })] })] })] }), _jsxs("div", { className: "info-card p-4 mb-4 role-wrap", children: [_jsx("h2", { className: "h6 fw-bold text-primary mb-3", children: "G\u00E1n vai tr\u00F2" }), !changing ? (_jsxs("div", { className: "d-flex align-items-center justify-content-between flex-wrap gap-2", children: [_jsxs("div", { className: "value", children: ["Vai tr\u00F2:", ' ', _jsx("span", { className: "fw-semibold", children: data.role?.name || '—' })] }), _jsx("button", { onClick: onStartChangeRole, className: "btn btn-outline-primary btn-sm hrm-btn", children: "\u0110\u1ED5i vai tr\u00F2" })] })) : (_jsxs("div", { className: "d-flex flex-column flex-sm-row align-items-sm-center gap-3", children: [_jsxs("select", { value: newRoleName, onChange: (e) => setNewRoleName(e.target.value), className: "form-select shadow-sm", children: [_jsx("option", { value: "", children: "-- Ch\u1ECDn vai tr\u00F2 --" }), (Array.isArray(roleNames) ? roleNames : []).map((name) => (_jsx("option", { value: name, children: name }, name)))] }), _jsxs("div", { className: "d-flex gap-2", children: [_jsxs("button", { onClick: onAssignRole, className: "btn btn-success btn-sm hrm-btn", disabled: doing || !newRoleName, children: [doing ? (_jsx("span", { className: "spinner-border spinner-border-sm me-2" })) : (_jsx("i", { className: "bi bi-check2 me-2" })), "C\u1EADp nh\u1EADt"] }), _jsx("button", { onClick: onCancelChangeRole, className: "btn btn-outline-danger btn-sm hrm-btn", children: "H\u1EE7y" })] })] }))] }), _jsxs("div", { className: "info-card p-4", children: [_jsx("h2", { className: "h6 fw-bold text-danger mb-3", children: "B\u1EA3o m\u1EADt" }), _jsxs("div", { className: "d-flex flex-wrap gap-2", children: [_jsxs("button", { onClick: onResetPassword, className: "btn btn-warning bg-gradient hrm-btn", disabled: doing, children: [doing ? (_jsx("span", { className: "spinner-border spinner-border-sm me-2" })) : (_jsx("i", { className: "bi bi-envelope-lock me-2" })), "G\u1EEDi email reset m\u1EADt kh\u1EA9u"] }), _jsx(Link, { to: `/users/${data.id}/sessions`, className: "btn btn-outline-secondary hrm-btn", children: "Phi\u00EAn \u0111\u0103ng nh\u1EADp" })] })] })] })] }) }));
}
function Info({ label, value }) {
    return (_jsxs("div", { className: "col-sm-6 col-lg-4", children: [_jsx("div", { className: "label", children: label }), _jsx("div", { className: "value", children: value })] }));
}
