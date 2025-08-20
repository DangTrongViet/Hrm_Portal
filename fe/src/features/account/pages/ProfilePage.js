import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { getJSON, patchJSON } from '../../../lib/http';
import { useNavigate } from 'react-router-dom';
import '../../../../public/css/account/ProfilePage.css';
export default function ProfilePage() {
    const nav = useNavigate();
    const [me, setMe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState('');
    // edit mode
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [birth, setBirth] = useState('');
    const [address, setAdress] = useState('');
    const load = async () => {
        setLoading(true);
        setErr('');
        try {
            const data = await getJSON('/me');
            setMe(data);
            // fill form
            setName(data.name || '');
            setEmail(data.email || '');
            setAdress(data.address || '');
            setPhone(data.phoneNumber || '');
            setBirth(data.birthDate ? data.birthDate.slice(0, 10) : ''); // yyyy-mm-dd
        }
        catch (e) {
            setErr(e?.message || 'Không tải được thông tin cá nhân');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        load();
    }, []);
    const onSave = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: name.trim(),
                email: email.trim(),
                phoneNumber: phone.trim() || null,
                birthDate: birth ? new Date(birth).toISOString() : null,
                address: address.trim(),
            };
            const updated = await patchJSON('/me', payload);
            setMe(updated);
            setEditing(false);
            alert('Đã cập nhật thông tin');
        }
        catch (e) {
            alert(e?.message || 'Cập nhật thất bại');
        }
    };
    if (loading)
        return (_jsx("div", { className: "text-center text-secondary-emphasis py-4", children: "\u0110ang t\u1EA3i\u2026" }));
    if (err)
        return _jsx("div", { className: "hrm-error p-4", children: err });
    if (!me)
        return (_jsx("div", { className: "text-center text-secondary-emphasis py-4", children: "Kh\u00F4ng c\u00F3 d\u1EEF li\u1EC7u" }));
    return (_jsx("div", { className: "hrm-container", children: _jsxs("div", { className: "container", children: [_jsxs("div", { className: "d-flex align-items-center justify-content-between mb-4", children: [_jsx("h1", { className: "gradient-text hrm-title", children: "Th\u00F4ng tin c\u00E1 nh\u00E2n" }), _jsxs("div", { className: "hrm-action-group", children: [_jsx("button", { onClick: () => nav(-1), className: "btn hrm-btn hrm-button-secondary rounded-pill px-4", children: "Tr\u1EDF l\u1EA1i" }), !editing ? (_jsx("button", { onClick: () => setEditing(true), className: "btn hrm-btn hrm-button-primary rounded-pill px-4", children: "Ch\u1EC9nh s\u1EEDa" })) : (_jsx("button", { onClick: () => {
                                        setEditing(false);
                                        load();
                                    }, className: "btn hrm-btn hrm-button-secondary rounded-pill px-4", children: "Hu\u1EF7" }))] })] }), !editing ? (_jsx("div", { className: "hrm-card bg-light p-4", children: _jsxs("div", { className: "row g-3", children: [_jsx(Info, { label: "H\u1ECD t\u00EAn", value: me.name }), _jsx(Info, { label: "Email", value: me.email }), _jsx(Info, { label: "S\u0110T", value: me.phoneNumber || '—' }), _jsx(Info, { label: "Ng\u00E0y sinh", value: me.birthDate
                                    ? new Date(me.birthDate).toLocaleDateString()
                                    : '—' }), _jsx(Info, { label: "Tr\u1EA1ng th\u00E1i", value: me.status }), _jsx(Info, { label: "X\u00E1c minh", value: me.isVerified ? 'Đã xác minh' : 'Chưa' }), _jsx(Info, { label: "\u0110\u0103ng nh\u1EADp g\u1EA7n nh\u1EA5t", value: me.lastLoginAt
                                    ? new Date(me.lastLoginAt).toLocaleString()
                                    : '—' }), _jsx(Info, { label: "Vai tr\u00F2", value: me.role?.name || '—' }), _jsx(Info, { label: "Ph\u00F2ng ban", value: me.role?.department || '—' }), _jsxs("div", { className: "col-12", children: [_jsx("div", { className: "hrm-info-label mb-1", children: "Quy\u1EC1n" }), _jsx("div", { className: "d-flex flex-wrap gap-2", children: me.permissionNames.length ? (me.permissionNames.map((p) => (_jsx("span", { className: "hrm-badge hrm-badge-permission px-2 py-1 rounded-pill text-xs", children: p }, p)))) : (_jsx("span", { className: "text-sm text-secondary-emphasis", children: "\u2014" })) })] }), _jsxs("div", { className: "col-12", children: [_jsx("div", { className: "hrm-info-label mb-1", children: "\u0110\u1ECBa ch\u1EC9" }), _jsx("div", { className: "hrm-info-value", children: me.address || '—' })] })] }) })) : (_jsxs("form", { onSubmit: onSave, className: "hrm-form hrm-card bg-light", children: [_jsxs("div", { className: "row g-3", children: [_jsx(Field, { label: "H\u1ECD t\u00EAn", children: _jsx("input", { value: name, onChange: (e) => setName(e.target.value), className: "form-control hrm-form-input", required: true }) }), _jsx(Field, { label: "Email", children: _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "form-control hrm-form-input", required: true }) }), _jsx(Field, { label: "S\u1ED1 \u0111i\u1EC7n tho\u1EA1i", children: _jsx("input", { value: phone, onChange: (e) => setPhone(e.target.value), className: "form-control hrm-form-input", inputMode: "tel" }) }), _jsx(Field, { label: "\u0110\u1ECBa ch\u1EC9", children: _jsx("input", { type: "address", value: address, onChange: (e) => setAdress(e.target.value), className: "form-control hrm-form-input" }) }), _jsx(Field, { label: "Ng\u00E0y sinh", children: _jsx("input", { type: "date", value: birth, onChange: (e) => setBirth(e.target.value), className: "form-control hrm-form-input" }) })] }), _jsxs("div", { className: "hrm-action-group mt-3", children: [_jsx("button", { className: "btn hrm-btn hrm-button-primary rounded-pill", children: "L\u01B0u" }), _jsx("button", { type: "button", onClick: () => {
                                        setEditing(false);
                                        load();
                                    }, className: "btn hrm-btn hrm-button-secondary rounded-pill", children: "Hu\u1EF7" })] })] }))] }) }));
}
function Info({ label, value }) {
    return (_jsxs("div", { className: "col-sm-6", children: [_jsx("div", { className: "hrm-info-label", children: label }), _jsx("div", { className: "hrm-info-value", children: value })] }));
}
function Field({ label, children, }) {
    return (_jsxs("div", { className: "col-sm-6", children: [_jsx("div", { className: "hrm-form-label mb-1", children: label }), children] }));
}
