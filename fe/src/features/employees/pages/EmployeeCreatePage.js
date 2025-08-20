import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getJSON, postJSON } from '../../../lib/http';
import '../../../../public/css/employees/EmployeeCreatePage.css';
export default function EmployeeCreatePage() {
    const nav = useNavigate();
    // form states
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [department, setDepartment] = useState('');
    const [position, setPosition] = useState('');
    const [status, setStatus] = useState('active');
    // user link
    const [userId, setUserId] = useState('');
    const [userOptions, setUserOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');
    // load available users for linking
    useEffect(() => {
        (async () => {
            try {
                const res = await getJSON(`/employees/users-options?_=${Date.now()}`);
                const items = Array.isArray(res?.items)
                    ? res.items
                    : Array.isArray(res)
                        ? res
                        : [];
                setUserOptions(items);
            }
            catch (e) {
                console.error(e);
            }
        })();
    }, []);
    // auto-fill fields when user is selected
    const onChangeUser = (e) => {
        const val = e.target.value;
        if (!val) {
            setUserId('');
            return;
        }
        const uid = Number(val);
        setUserId(uid);
        const u = userOptions.find((x) => x.id === uid);
        if (u) {
            setEmail(u.email || '');
            setFullName(u.name || '');
        }
    };
    // sync user data when options are loaded
    useEffect(() => {
        if (userId === '')
            return;
        const u = userOptions.find((x) => x.id === Number(userId));
        if (u) {
            setEmail(u.email || '');
            setFullName(u.name || '');
        }
    }, [userId, userOptions]);
    const canSubmit = useMemo(() => {
        return fullName.trim().length >= 2 && !loading;
    }, [fullName, loading]);
    const onSubmit = async (e) => {
        e.preventDefault();
        if (!canSubmit)
            return;
        setLoading(true);
        setErr('');
        try {
            const payload = {
                full_name: fullName.trim(),
                email: email.trim() || null,
                phone: phone.trim() || null,
                department: department.trim() || null,
                position: position.trim() || null,
                status,
                user_id: userId === '' ? null : Number(userId),
            };
            await postJSON(`/employees`, payload);
            alert('Tạo nhân viên thành công');
            nav('/employees');
        }
        catch (e) {
            setErr(e?.message || 'Tạo nhân viên thất bại');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "container py-5", children: _jsx("div", { className: "card shadow-lg border-0 hrm-card bg-primary-subtle", children: _jsxs("div", { className: "card-body p-5", children: [_jsxs("div", { className: "d-flex align-items-center justify-content-between mb-5", children: [_jsx("h1", { className: "h3 fw-bold mb-0 gradient-text", children: "T\u1EA1o nh\u00E2n vi\u00EAn m\u1EDBi" }), _jsxs("button", { onClick: () => nav(-1), className: "btn btn-outline-warning btn-sm d-flex align-items-center gap-2 hrm-btn bg-warning-subtle", children: [_jsx("svg", { className: "bi", width: "16", height: "16", fill: "currentColor", viewBox: "0 0 16 16", children: _jsx("path", { fillRule: "evenodd", d: "M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" }) }), "Quay l\u1EA1i"] })] }), err && (_jsxs("div", { className: "alert alert-danger d-flex align-items-center gap-2 mb-5 bg-danger-subtle border-danger-subtle", role: "alert", children: [_jsxs("svg", { className: "bi flex-shrink-0", width: "16", height: "16", fill: "currentColor", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2", children: [_jsx("path", { d: "M12 9v4" }), _jsx("path", { d: "M12 17h.01" }), _jsx("path", { d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" })] }), _jsx("span", { children: err })] })), _jsxs("form", { onSubmit: onSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm text-dark mb-1 fw-semibold", children: "Li\u00EAn k\u1EBFt User (tu\u1EF3 ch\u1ECDn)" }), _jsxs("select", { className: "form-select shadow-sm hrm-select bg-secondary-subtle", value: userId, onChange: onChangeUser, children: [_jsx("option", { value: "", children: "-- Kh\u00F4ng li\u00EAn k\u1EBFt --" }), userOptions.map((u) => (_jsxs("option", { value: u.id, children: [u.name, " \u2014 ", u.email] }, u.id)))] }), _jsx("div", { className: "text-xs text-muted mt-1", children: "Khi ch\u1ECDn user, Email v\u00E0 H\u1ECD & T\u00EAn s\u1EBD t\u1EF1 \u0111i\u1EC1n theo user \u0111\u00F3 (v\u1EABn c\u00F3 th\u1EC3 ch\u1EC9nh tay)." })] }), _jsxs("div", { className: "row g-4", children: [_jsx("div", { className: "col-sm-6", children: _jsxs(Field, { label: "H\u1ECD & T\u00EAn *", children: [_jsx("input", { value: fullName, onChange: (e) => setFullName(e.target.value), className: "form-control shadow-sm", placeholder: "Nguy\u1EC5n V\u0103n A" }), fullName.trim().length < 2 && fullName.length > 0 && (_jsx("p", { className: "text-xs text-danger mt-1", children: "H\u1ECD & T\u00EAn t\u1ED1i thi\u1EC3u 2 k\u00FD t\u1EF1" }))] }) }), _jsx("div", { className: "col-sm-6", children: _jsx(Field, { label: "Email", children: _jsx("input", { value: email, onChange: (e) => setEmail(e.target.value), className: "form-control shadow-sm", type: "email", placeholder: "email@company.com" }) }) }), _jsx("div", { className: "col-sm-6", children: _jsx(Field, { label: "S\u1ED1 \u0111i\u1EC7n tho\u1EA1i", children: _jsx("input", { value: phone, onChange: (e) => setPhone(e.target.value), className: "form-control shadow-sm", inputMode: "tel", placeholder: "0123456789" }) }) }), _jsx("div", { className: "col-sm-6", children: _jsx(Field, { label: "Ph\u00F2ng ban", children: _jsx("input", { value: department, onChange: (e) => setDepartment(e.target.value), className: "form-control shadow-sm", placeholder: "Nh\u1EADp ph\u00F2ng ban" }) }) }), _jsx("div", { className: "col-sm-6", children: _jsx(Field, { label: "Ch\u1EE9c v\u1EE5", children: _jsx("input", { value: position, onChange: (e) => setPosition(e.target.value), className: "form-control shadow-sm", placeholder: "Nh\u1EADp ch\u1EE9c v\u1EE5" }) }) }), _jsx("div", { className: "col-sm-6", children: _jsx(Field, { label: "Tr\u1EA1ng th\u00E1i", children: _jsxs("select", { value: status, onChange: (e) => setStatus(e.target.value), className: "form-select shadow-sm", children: [_jsx("option", { value: "active", children: "Active" }), _jsx("option", { value: "inactive", children: "Inactive" })] }) }) })] }), _jsxs("div", { className: "d-flex gap-2", children: [_jsx("button", { type: "submit", disabled: !canSubmit, className: "btn btn-success bg-gradient d-flex align-items-center gap-2 hrm-btn", children: loading ? 'Đang tạo...' : 'Tạo nhân viên' }), _jsx(Link, { to: "/employees", className: "btn btn-outline-danger btn-sm d-flex align-items-center gap-2 hrm-btn bg-danger-subtle", children: "H\u1EE7y" })] })] })] }) }) }));
}
function Field({ label, children, }) {
    return (_jsxs("div", { children: [_jsx("div", { className: "text-sm text-dark mb-1 fw-semibold", children: label }), children] }));
}
