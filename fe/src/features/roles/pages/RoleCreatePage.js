import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getJSON, postJSON, putJSON } from '../../../lib/http';
import '../../../../public/css/roles/RoleCreatePage.css';
export default function RoleCreatePage() {
    const nav = useNavigate();
    const [name, setName] = useState('');
    const [department, setDepartment] = useState('');
    const [description, setDescription] = useState('');
    const [allPerms, setAllPerms] = useState([]);
    const [sel, setSel] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');
    const [q, setQ] = useState('');
    const can = useMemo(() => name.trim().length >= 2 && !loading, [name, loading]);
    useEffect(() => {
        (async () => {
            try {
                const res = await getJSON(`/permissions?pageSize=1000`);
                setAllPerms(Array.isArray(res?.data) ? res.data : []);
            }
            catch (e) {
                setErr(e?.message || 'Không tải được danh sách quyền');
            }
        })();
    }, []);
    const toggle = (pid, checked) => {
        setSel((s) => checked ? Array.from(new Set([...s, pid])) : s.filter((x) => x !== pid));
    };
    const filteredPerms = useMemo(() => {
        const term = q.trim().toLowerCase();
        if (!term)
            return allPerms;
        return allPerms.filter((p) => {
            const n = (p.name ?? '').toLowerCase();
            const d = (p.description ?? '').toLowerCase();
            // Nếu Permission có code ở backend, bạn có thể thêm:
            // const c = (p as any).code?.toLowerCase?.() ?? "";
            return n.includes(term) || d.includes(term);
        });
    }, [q, allPerms]);
    const selectAllFiltered = () => {
        const ids = filteredPerms.map((p) => p.id);
        setSel((s) => Array.from(new Set([...s, ...ids])));
    };
    const unselectAllFiltered = () => {
        const ids = new Set(filteredPerms.map((p) => p.id));
        setSel((s) => s.filter((id) => !ids.has(id)));
    };
    const onSubmit = async (e) => {
        e.preventDefault();
        if (!can)
            return;
        setLoading(true);
        setErr('');
        try {
            const role = await postJSON(`/roles`, {
                name: name.trim(),
                department: department.trim() || null,
                description: description.trim() || null,
            });
            if (sel.length) {
                await putJSON(`/roles/${role.id}/permissions`, { permissionIds: sel });
            }
            alert('✅ Đã tạo vai trò');
            nav(`/roles/${role.id}`, { replace: true });
        }
        catch (e) {
            setErr(e?.message || '❌ Tạo vai trò thất bại');
        }
        finally {
            setLoading(false);
        }
    };
    const totalCount = allPerms.length;
    const selectedCount = sel.length;
    return (_jsx("div", { className: "rolecreate container py-5", children: _jsxs("div", { className: "rc-card mb-4", children: [_jsxs("div", { className: "rc-header p-4 d-flex justify-content-between align-items-center", children: [_jsx("h1", { className: "h5 fw-bold mb-0 gradient-text", children: "\u2795 T\u1EA1o vai tr\u00F2 m\u1EDBi" }), _jsx("button", { onClick: () => nav(-1), className: "btn btn-outline-light btn-sm rc-btn", children: "\u21A9 Quay l\u1EA1i" })] }), _jsx("div", { className: "card-body p-4 rc-form", children: _jsxs("form", { onSubmit: onSubmit, children: [_jsxs("div", { className: "row g-3 mb-3", children: [_jsxs("div", { className: "col-md-4", children: [_jsx("label", { className: "form-label fw-semibold", children: "T\u00EAn vai tr\u00F2 *" }), _jsx("input", { value: name, onChange: (e) => setName(e.target.value), className: "form-control", placeholder: "VD: HR Manager", required: true }), name.length > 0 && name.trim().length < 2 && (_jsx("div", { className: "form-text text-danger", children: "T\u00EAn t\u1ED1i thi\u1EC3u 2 k\u00FD t\u1EF1" }))] }), _jsxs("div", { className: "col-md-4", children: [_jsx("label", { className: "form-label fw-semibold", children: "Ph\u00F2ng ban" }), _jsx("input", { value: department, onChange: (e) => setDepartment(e.target.value), className: "form-control", placeholder: "VD: HR" })] }), _jsxs("div", { className: "col-md-4", children: [_jsx("label", { className: "form-label fw-semibold", children: "M\u00F4 t\u1EA3" }), _jsx("input", { value: description, onChange: (e) => setDescription(e.target.value), className: "form-control", placeholder: "M\u00F4 t\u1EA3 ng\u1EAFn" })] })] }), _jsxs("div", { className: "rc-perm-card p-3", children: [_jsxs("div", { className: "d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3", children: [_jsxs("div", { className: "d-flex align-items-center gap-2", children: [_jsx("h2", { className: "h6 rc-section-title mb-0", children: "\uD83D\uDCCB Ch\u1ECDn quy\u1EC1n" }), _jsxs("span", { className: "rc-chip", title: "\u0110\u00E3 ch\u1ECDn / T\u1ED5ng s\u1ED1 quy\u1EC1n", children: [selectedCount, "/", totalCount, " \u0111\u00E3 ch\u1ECDn"] })] }), _jsxs("div", { className: "d-flex gap-2 flex-wrap align-items-center", children: [_jsxs("div", { className: "position-relative rc-search", children: [_jsx("i", { className: "bi bi-search" }), _jsx("input", { className: "form-control", placeholder: "T\u00ECm theo t\u00EAn / m\u00F4 t\u1EA3", value: q, onChange: (e) => setQ(e.target.value), "aria-label": "T\u00ECm quy\u1EC1n", style: { width: 260 } })] }), _jsx("button", { type: "button", className: "btn btn-outline-primary btn-sm rc-btn", onClick: selectAllFiltered, disabled: !filteredPerms.length, children: "Ch\u1ECDn t\u1EA5t c\u1EA3 (\u0111ang l\u1ECDc)" }), _jsx("button", { type: "button", className: "btn btn-outline-secondary btn-sm rc-btn", onClick: unselectAllFiltered, disabled: !filteredPerms.length, children: "B\u1ECF ch\u1ECDn (\u0111ang l\u1ECDc)" })] })] }), _jsxs("div", { className: "row row-cols-1 row-cols-md-2 g-3 rc-perm-list", children: [filteredPerms.map((p) => (_jsx("div", { className: "col", children: _jsxs("label", { className: "form-check d-flex align-items-start gap-3 p-3 bg-white border rounded shadow-sm", children: [_jsx("input", { type: "checkbox", className: "form-check-input mt-1", checked: sel.includes(p.id), onChange: (e) => toggle(p.id, e.target.checked) }), _jsxs("div", { children: [_jsx("div", { className: "fw-semibold", children: p.name }), _jsx("div", { className: "text-muted small", children: p.description ?? '—' })] })] }) }, p.id))), !filteredPerms.length && (_jsx("div", { className: "col", children: _jsx("div", { className: "text-muted small p-3", children: "Kh\u00F4ng c\u00F3 quy\u1EC1n ph\u00F9 h\u1EE3p b\u1ED9 l\u1ECDc." }) }))] }), _jsxs("div", { className: "rc-sticky-footer d-flex justify-content-between align-items-center mt-3", children: [_jsxs("div", { className: "text-muted small", children: ["\u0110ang hi\u1EC3n th\u1ECB ", _jsx("strong", { children: filteredPerms.length }), " /", ' ', _jsx("strong", { children: totalCount }), " quy\u1EC1n."] }), _jsxs("div", { className: "d-flex gap-2", children: [err && (_jsx("div", { className: "alert alert-danger py-1 px-2 mb-0 bg-danger-subtle border-danger-subtle", children: err })), _jsx("button", { type: "submit", disabled: !can, className: "btn btn-success rc-btn", children: loading ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "spinner-border spinner-border-sm me-2", role: "status" }), "\u0110ang t\u1EA1o..."] })) : (_jsx(_Fragment, { children: "\uD83D\uDCBE T\u1EA1o vai tr\u00F2" })) })] })] })] })] }) })] }) }));
}
