import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJSON, patchJSON, putJSON } from '../../../lib/http';
import '../../../../public/css/roles/RoleDetailPage.css';
export default function RoleDetailPage() {
    const { id } = useParams();
    const nav = useNavigate();
    const [role, setRole] = useState(null);
    const [allPerms, setAllPerms] = useState([]);
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [dept, setDept] = useState('');
    const [sel, setSel] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState('');
    // UI helpers
    const [savingInfo, setSavingInfo] = useState(false);
    const [savingPerms, setSavingPerms] = useState(false);
    const [q, setQ] = useState('');
    const canSave = useMemo(() => name.trim().length > 0, [name]);
    const load = async () => {
        setLoading(true);
        setErr('');
        try {
            const r = await getJSON(`/roles/${id}`);
            setRole(r);
            setName(r.name);
            setDesc(r.description ?? '');
            setDept(r.department ?? '');
            setSel((r.permissions ?? []).map((p) => p.id));
            const perms = await getJSON(`/permissions?pageSize=1000`);
            setAllPerms(perms.data || []);
        }
        catch (e) {
            setErr(e?.message || 'Không tải được vai trò');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        load();
        // eslint-disable-next-line
    }, [id]);
    const toggle = (pid, checked) => {
        setSel((s) => checked ? Array.from(new Set([...s, pid])) : s.filter((x) => x !== pid));
    };
    const filteredPerms = useMemo(() => {
        const term = q.trim().toLowerCase();
        if (!term)
            return allPerms;
        return allPerms.filter((p) => {
            const name = (p.name ?? '').toLowerCase();
            const code = (p.code ?? '').toLowerCase();
            const desc = (p.description ?? '').toLowerCase();
            return name.includes(term) || code.includes(term) || desc.includes(term);
        });
    }, [q, allPerms]);
    const selectedCount = sel.length;
    const totalCount = allPerms.length;
    const selectAllFiltered = () => {
        const ids = filteredPerms.map((p) => p.id);
        setSel((s) => Array.from(new Set([...s, ...ids])));
    };
    const unselectAllFiltered = () => {
        const setFiltered = new Set(filteredPerms.map((p) => p.id));
        setSel((s) => s.filter((id) => !setFiltered.has(id)));
    };
    const onSaveInfo = async (e) => {
        e.preventDefault();
        if (!canSave || !id)
            return;
        setSavingInfo(true);
        try {
            await patchJSON(`/roles/${id}`, {
                name: name.trim(),
                description: desc.trim() || null,
                department: dept.trim() || null,
            });
            await load();
            alert('✅ Đã lưu thông tin');
        }
        catch (e) {
            alert(e?.message || '❌ Lưu thất bại');
        }
        finally {
            setSavingInfo(false);
        }
    };
    const onSavePermissions = async () => {
        if (!id)
            return;
        setSavingPerms(true);
        try {
            await putJSON(`/roles/${id}/permissions`, { permissionIds: sel });
            await load();
            alert('✅ Đã cập nhật quyền');
        }
        catch (e) {
            alert(e?.message || '❌ Cập nhật quyền thất bại');
        }
        finally {
            setSavingPerms(false);
        }
    };
    if (loading) {
        return (_jsxs("div", { className: "container py-5 text-center text-muted", children: [_jsx("div", { className: "spinner-border text-primary", role: "status" }), _jsx("p", { className: "mt-3", children: "\u0110ang t\u1EA3i th\u00F4ng tin vai tr\u00F2..." })] }));
    }
    if (err) {
        return (_jsx("div", { className: "container py-5", children: _jsx("div", { className: "alert alert-danger bg-danger-subtle border-danger-subtle mx-auto w-75", role: "alert", children: err }) }));
    }
    if (!role) {
        return (_jsx("div", { className: "container py-5", children: _jsx("div", { className: "alert alert-warning text-center mx-auto w-75", role: "alert", children: "Kh\u00F4ng t\u00ECm th\u1EA5y vai tr\u00F2" }) }));
    }
    return (_jsx("div", { className: "container py-5", children: _jsxs("div", { className: "rp-card mb-4", children: [_jsxs("div", { className: "rp-header p-4 d-flex align-items-center justify-content-between", children: [_jsxs("h1", { className: "h5 fw-bold mb-0 gradient-text", children: ["\uD83D\uDD10 Vai tr\u00F2: ", role.name] }), _jsx("button", { onClick: () => nav(-1), className: "btn btn-outline-light btn-sm rp-btn", children: "\u21A9 Quay l\u1EA1i" })] }), _jsxs("div", { className: "card-body p-4 rp-form", children: [_jsxs("form", { onSubmit: onSaveInfo, className: "mb-4", children: [_jsxs("div", { className: "row g-3", children: [_jsxs("div", { className: "col-md-4", children: [_jsx("label", { className: "form-label fw-semibold", children: "T\u00EAn" }), _jsx("input", { value: name, onChange: (e) => setName(e.target.value), className: "form-control", placeholder: "T\u00EAn vai tr\u00F2", required: true })] }), _jsxs("div", { className: "col-md-4", children: [_jsx("label", { className: "form-label fw-semibold", children: "Ph\u00F2ng ban" }), _jsx("input", { value: dept, onChange: (e) => setDept(e.target.value), className: "form-control", placeholder: "VD: Kinh doanh / K\u1EF9 thu\u1EADt" })] }), _jsxs("div", { className: "col-md-4", children: [_jsx("label", { className: "form-label fw-semibold", children: "M\u00F4 t\u1EA3" }), _jsx("input", { value: desc, onChange: (e) => setDesc(e.target.value), className: "form-control", placeholder: "M\u00F4 t\u1EA3 ng\u1EAFn" })] })] }), _jsxs("div", { className: "mt-3 d-flex align-items-center gap-2", children: [_jsx("button", { disabled: !canSave || savingInfo, className: "btn btn-primary rp-btn", children: savingInfo ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "spinner-border spinner-border-sm me-2", role: "status" }), "\u0110ang l\u01B0u..."] })) : (_jsx(_Fragment, { children: "\uD83D\uDCBE L\u01B0u th\u00F4ng tin" })) }), _jsxs("span", { className: "rp-chip", title: "T\u1ED5ng quy\u1EC1n hi\u1EC7n c\u00F3 trong vai tr\u00F2", children: [role.permissions?.length ?? 0, " quy\u1EC1n \u0111\u00E3 g\u00E1n"] })] })] }), _jsxs("div", { className: "rp-perm-card bg-light-subtle p-3", children: [_jsxs("div", { className: "d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3", children: [_jsxs("div", { className: "d-flex align-items-center gap-2", children: [_jsx("h2", { className: "h6 rp-section-title mb-0", children: "\uD83D\uDCCB Danh s\u00E1ch quy\u1EC1n" }), _jsxs("span", { className: "rp-chip", title: "\u0110\u00E3 ch\u1ECDn / T\u1ED5ng s\u1ED1 quy\u1EC1n", children: [selectedCount, "/", totalCount, " \u0111\u00E3 ch\u1ECDn"] })] }), _jsxs("div", { className: "d-flex flex-wrap align-items-center gap-2", children: [_jsxs("div", { className: "position-relative rp-search", children: [_jsx("i", { className: "bi bi-search" }), _jsx("input", { className: "form-control", placeholder: "T\u00ECm theo t\u00EAn / m\u00E3 / m\u00F4 t\u1EA3", value: q, onChange: (e) => setQ(e.target.value), "aria-label": "T\u00ECm quy\u1EC1n", style: { width: 260 } })] }), _jsx("button", { type: "button", className: "btn btn-outline-primary btn-sm rp-btn", onClick: selectAllFiltered, disabled: !filteredPerms.length, children: "Ch\u1ECDn t\u1EA5t c\u1EA3 (\u0111ang l\u1ECDc)" }), _jsx("button", { type: "button", className: "btn btn-outline-secondary btn-sm rp-btn", onClick: unselectAllFiltered, disabled: !filteredPerms.length, children: "B\u1ECF ch\u1ECDn (\u0111ang l\u1ECDc)" })] })] }), _jsxs("div", { className: "row row-cols-1 row-cols-md-2 g-3 rp-perm-list", children: [filteredPerms.map((p) => (_jsx("div", { className: "col", children: _jsxs("label", { className: "form-check d-flex align-items-start gap-3 p-3 bg-white border rounded shadow-sm", children: [_jsx("input", { type: "checkbox", className: "form-check-input mt-1", checked: sel.includes(p.id), onChange: (e) => toggle(p.id, e.target.checked) }), _jsxs("div", { children: [_jsxs("div", { className: "fw-semibold", children: [p.name, ' ', p.code ? (_jsx("span", { className: "rp-chip ms-1", children: p.code })) : null] }), _jsx("div", { className: "rp-muted small", children: p.description ?? '—' })] })] }) }, p.id))), !filteredPerms.length && (_jsx("div", { className: "col", children: _jsx("div", { className: "rp-muted small p-3", children: "Kh\u00F4ng c\u00F3 quy\u1EC1n ph\u00F9 h\u1EE3p b\u1ED9 l\u1ECDc." }) }))] }), _jsxs("div", { className: "rp-sticky-footer d-flex justify-content-between align-items-center mt-3", children: [_jsxs("div", { className: "rp-muted small", children: ["\u0110ang hi\u1EC3n th\u1ECB ", _jsx("strong", { children: filteredPerms.length }), " /", ' ', _jsx("strong", { children: totalCount }), " quy\u1EC1n."] }), _jsx("button", { onClick: onSavePermissions, className: "btn btn-success rp-btn", disabled: savingPerms, children: savingPerms ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "spinner-border spinner-border-sm me-2", role: "status" }), "\u0110ang l\u01B0u quy\u1EC1n..."] })) : (_jsx(_Fragment, { children: "\uD83D\uDCBE L\u01B0u quy\u1EC1n" })) })] })] })] })] }) }));
}
