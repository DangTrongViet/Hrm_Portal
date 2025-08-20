import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost } from '../../../lib/api';
import { useNavigate } from 'react-router-dom';
import '../../../../public/css/users/UserCreatePage.css';
export default function UserCreatePage() {
    const nav = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [roleId, setRoleId] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [sendInvite, setSendInvite] = useState(true);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');
    const [created, setCreated] = useState(null);
    const [showTempPwd, setShowTempPwd] = useState(false);
    // field errors (realtime)
    const [touched, setTouched] = useState({});
    useEffect(() => {
        (async () => {
            try {
                const fromRolesName = await apiGet(`/roles/rolesName?minimal=1&_=${Date.now()}`);
                let list = Array.isArray(fromRolesName)
                    ? typeof fromRolesName[0] === 'object' &&
                        fromRolesName[0] &&
                        'id' in fromRolesName[0] &&
                        'name' in fromRolesName[0]
                        ? fromRolesName
                        : []
                    : Array.isArray(fromRolesName?.data) &&
                        typeof fromRolesName.data[0] === 'object' &&
                        'id' in fromRolesName.data[0]
                        ? fromRolesName.data
                        : [];
                if (!list.length) {
                    const fromRoles = await apiGet(`/roles?minimal=1&_=${Date.now()}`);
                    list = Array.isArray(fromRoles)
                        ? typeof fromRoles[0] === 'object' && 'id' in fromRoles[0]
                            ? fromRoles
                            : []
                        : Array.isArray(fromRoles?.data) &&
                            typeof fromRoles.data[0] === 'object' &&
                            'id' in fromRoles.data[0]
                            ? fromRoles.data
                            : [];
                }
                if (!list.length) {
                    setErr('API roles cần trả về dạng [{ id, name }]. Kiểm tra /roles/rolesName?minimal=1 hoặc /roles?minimal=1');
                }
                setRoles(list);
            }
            catch (e) {
                setErr(e?.message || 'Không tải được vai trò');
            }
        })();
    }, []);
    const emailValid = /\S+@\S+\.\S+/.test(email);
    const roleValid = !!roleId;
    const nameValid = name.trim().length >= 2;
    const canSubmit = useMemo(() => {
        return nameValid && emailValid && roleValid && !loading;
    }, [nameValid, emailValid, roleValid, loading]);
    const onSubmit = async (e) => {
        e.preventDefault();
        setTouched({ name: true, email: true, role: true });
        if (!canSubmit)
            return;
        setLoading(true);
        setErr('');
        try {
            const role_id = roleId ? Number(roleId) : undefined;
            const payload = {
                name: name.trim(),
                email: email.trim(),
                role_id,
                sendInvite,
                phoneNumber: phoneNumber.trim() || undefined,
                birthDate: birthDate ? new Date(birthDate).toISOString() : undefined,
            };
            const res = await apiPost('/users', payload);
            setCreated(res);
            if (res?.tempPassword) {
                setShowTempPwd(true);
            }
            else {
                alert(`Đã gửi email mời tới ${res?.email || email}`);
                // reset form
                setName('');
                setEmail('');
                setRoleId('');
                setPhoneNumber('');
                setBirthDate('');
                setSendInvite(true);
                setTouched({});
            }
        }
        catch (e) {
            setErr(e?.message || 'Tạo tài khoản thất bại');
        }
        finally {
            setLoading(false);
        }
    };
    const copyTempPassword = async () => {
        if (!created?.tempPassword)
            return;
        try {
            await navigator.clipboard.writeText(created.tempPassword);
            alert('Đã copy mật khẩu tạm');
        }
        catch {
            // ignore
        }
    };
    const invalidName = touched.name && !nameValid;
    const invalidEmail = touched.email && !emailValid;
    const invalidRole = touched.role && !roleValid;
    return (_jsxs("div", { className: "container py-5", children: [_jsxs("div", { className: "card uc-card bg-primary-subtle mb-4", children: [_jsxs("div", { className: "card-body uc-header p-4 d-flex align-items-center justify-content-between", children: [_jsx("h1", { className: "h4 fw-bold mb-0 gradient-text", children: "T\u1EA1o t\u00E0i kho\u1EA3n nh\u00E2n vi\u00EAn" }), _jsxs("button", { onClick: () => nav(-1), className: "btn btn-outline-light btn-sm d-flex align-items-center gap-2 hrm-btn", children: [_jsx("svg", { width: "16", height: "16", fill: "currentColor", viewBox: "0 0 16 16", children: _jsx("path", { fillRule: "evenodd", d: "M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" }) }), "Tr\u1EDF l\u1EA1i"] })] }), _jsxs("div", { className: "card-body p-4", children: [err && (_jsxs("div", { className: "alert alert-danger d-flex align-items-center gap-2 mb-4 bg-danger-subtle border-danger-subtle", role: "alert", children: [_jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "currentColor", stroke: "currentColor", strokeWidth: "2", children: [_jsx("path", { d: "M12 9v4" }), _jsx("path", { d: "M12 17h.01" }), _jsx("path", { d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" })] }), _jsx("span", { children: err })] })), _jsxs("form", { onSubmit: onSubmit, className: "uc-form", noValidate: true, children: [_jsxs("div", { className: "mb-3", children: [_jsx("label", { className: "field-label", children: "H\u1ECD t\u00EAn" }), _jsx("input", { value: name, onChange: (e) => setName(e.target.value), onBlur: () => setTouched((t) => ({ ...t, name: true })), className: `form-control shadow-sm ${invalidName ? 'is-invalid' : ''}`, placeholder: "Nh\u1EADp h\u1ECD t\u00EAn", required: true }), invalidName && (_jsx("div", { className: "invalid-feedback", children: "H\u1ECD t\u00EAn t\u1ED1i thi\u1EC3u 2 k\u00FD t\u1EF1." }))] }), _jsxs("div", { className: "mb-3", children: [_jsx("label", { className: "field-label", children: "Email c\u00F4ng ty" }), _jsxs("div", { className: `input-group shadow-sm ${invalidEmail ? 'is-invalid' : ''}`, children: [_jsx("span", { className: "input-group-text bg-info-subtle border-end-0 text-info-emphasis", children: _jsx("svg", { width: "16", height: "16", fill: "currentColor", viewBox: "0 0 16 16", children: _jsx("path", { d: "M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.033V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z" }) }) }), _jsx("input", { value: email, onChange: (e) => setEmail(e.target.value), onBlur: () => setTouched((t) => ({ ...t, email: true })), className: `form-control border-start-0 ${invalidEmail ? 'is-invalid' : ''}`, type: "email", placeholder: "Nh\u1EADp email c\u00F4ng ty", required: true })] }), !emailValid && touched.email && (_jsx("div", { className: "text-danger small mt-1", children: "Email ch\u01B0a h\u1EE3p l\u1EC7." })), _jsx("div", { className: "uc-tip mt-1", children: "Email s\u1EBD d\u00F9ng \u0111\u1EC3 g\u1EEDi l\u1EDDi m\u1EDDi k\u00EDch ho\u1EA1t t\u00E0i kho\u1EA3n." })] }), _jsxs("div", { className: "mb-3", children: [_jsx("label", { className: "field-label", children: "Vai tr\u00F2" }), _jsxs("select", { value: roleId, onChange: (e) => setRoleId(e.target.value), onBlur: () => setTouched((t) => ({ ...t, role: true })), className: `form-select shadow-sm ${invalidRole ? 'is-invalid' : ''}`, required: true, disabled: !roles.length, children: [_jsx("option", { value: "", children: roles.length
                                                            ? '-- Chọn vai trò --'
                                                            : 'Đang tải danh sách vai trò...' }), roles.map((r) => (_jsx("option", { value: String(r.id), children: r.name }, r.id)))] }), invalidRole && (_jsx("div", { className: "invalid-feedback", children: "Vui l\u00F2ng ch\u1ECDn vai tr\u00F2." })), !roles.length && (_jsxs("div", { className: "uc-tip mt-1", children: ["Kh\u00F4ng t\u1EA3i \u0111\u01B0\u1EE3c vai tr\u00F2 ho\u1EB7c API ch\u01B0a tr\u1EA3 \u0111\u00FAng d\u1EA1ng", ' ', _jsx("code", { children: "[{ id, name }]" }), "."] }))] }), _jsxs("div", { className: "row g-3", children: [_jsxs("div", { className: "col-sm-6", children: [_jsx("label", { className: "field-label", children: "S\u1ED1 \u0111i\u1EC7n tho\u1EA1i" }), _jsxs("div", { className: "input-group shadow-sm", children: [_jsx("span", { className: "input-group-text bg-info-subtle border-end-0 text-info-emphasis", children: _jsx("svg", { width: "16", height: "16", fill: "currentColor", viewBox: "0 0 16 16", children: _jsx("path", { d: "M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328z" }) }) }), _jsx("input", { value: phoneNumber, onChange: (e) => setPhoneNumber(e.target.value), className: "form-control border-start-0", inputMode: "tel", placeholder: "Nh\u1EADp s\u1ED1 \u0111i\u1EC7n tho\u1EA1i" })] })] }), _jsxs("div", { className: "col-sm-6", children: [_jsx("label", { className: "field-label", children: "Ng\u00E0y sinh" }), _jsx("input", { type: "date", value: birthDate, onChange: (e) => setBirthDate(e.target.value), className: "form-control shadow-sm" })] })] }), _jsxs("div", { className: "form-check mt-3", children: [_jsx("input", { id: "sendInvite", type: "checkbox", checked: sendInvite, onChange: (e) => setSendInvite(e.target.checked), className: "form-check-input" }), _jsxs("label", { htmlFor: "sendInvite", className: "form-check-label", children: ["G\u1EEDi email m\u1EDDi k\u00EDch ho\u1EA1t", ' ', _jsx("span", { className: "uc-muted", children: "(khuy\u1EBFn ngh\u1ECB)" })] })] }), err && (_jsxs("div", { className: "alert alert-danger d-flex align-items-center gap-2 mt-3", role: "alert", children: [_jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "currentColor", stroke: "currentColor", strokeWidth: "2", children: [_jsx("path", { d: "M12 9v4" }), _jsx("path", { d: "M12 17h.01" }), _jsx("path", { d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" })] }), _jsx("span", { children: err })] })), _jsxs("div", { className: "d-flex gap-2 mt-3", children: [_jsx("button", { type: "submit", disabled: !canSubmit, className: "btn btn-success bg-gradient d-flex align-items-center gap-2 hrm-btn", children: loading ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "spinner-border spinner-border-sm", role: "status" }), _jsx("span", { children: "\u0110ang t\u1EA1o..." })] })) : (_jsxs(_Fragment, { children: [_jsx("svg", { width: "16", height: "16", fill: "currentColor", viewBox: "0 0 16 16", children: _jsx("path", { d: "M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" }) }), "T\u1EA1o t\u00E0i kho\u1EA3n"] })) }), _jsxs("button", { type: "button", onClick: () => nav(-1), className: "btn btn-outline-danger btn-sm d-flex align-items-center gap-2 hrm-btn", children: [_jsx("svg", { width: "16", height: "16", fill: "currentColor", viewBox: "0 0 16 16", children: _jsx("path", { d: "M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" }) }), "H\u1EE7y"] })] })] })] })] }), showTempPwd && created?.tempPassword && (_jsx("div", { className: "modal show d-block uc-modal", style: { backgroundColor: 'rgba(0, 0, 0, 0.4)' }, tabIndex: -1, children: _jsx("div", { className: "modal-dialog modal-dialog-centered", children: _jsx("div", { className: "modal-content shadow-lg bg-light", children: _jsxs("div", { className: "modal-body p-4", children: [_jsx("h2", { className: "h5 fw-semibold text-primary mb-2", children: "M\u1EADt kh\u1EA9u t\u1EA1m (ch\u1EC9 hi\u1EC3n th\u1ECB 1 l\u1EA7n)" }), _jsx("p", { className: "uc-muted mb-3", children: "H\u00E3y sao ch\u00E9p v\u00E0 g\u1EEDi an to\u00E0n. H\u1EC7 th\u1ED1ng s\u1EBD y\u00EAu c\u1EA7u \u0111\u1ED5i m\u1EADt kh\u1EA9u khi \u0111\u0103ng nh\u1EADp." }), _jsxs("div", { className: "input-group mb-3", children: [_jsx("input", { type: "text", value: created.tempPassword, className: "form-control font-mono", readOnly: true }), _jsx("button", { onClick: copyTempPassword, className: "btn btn-outline-primary hrm-btn", type: "button", children: "Copy" })] }), _jsx("div", { className: "d-flex justify-content-end", children: _jsx("button", { onClick: () => {
                                            setShowTempPwd(false);
                                            setCreated(null);
                                        }, className: "btn btn-success bg-gradient hrm-btn", children: "\u0110\u00E3 l\u01B0u" }) })] }) }) }) }))] }));
}
