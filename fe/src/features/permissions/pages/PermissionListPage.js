import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getJSON, postJSON, patchJSON, delJSON, buildQuery, } from '../../../lib/http';
import { debounce } from 'lodash';
import '../../../../public/css/permissions/PermissionListPage.css';
export default function PermissionsListPage() {
    const nav = useNavigate();
    // Query + Paging
    const [q, setQ] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    // Data
    const [list, setList] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 20,
        total: 0,
        totalPages: 1,
    });
    // UI state
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');
    // Modal create/edit
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const canSave = useMemo(() => name.trim().length > 0, [name]);
    const nameInputRef = useRef(null);
    const load = useMemo(() => debounce(async () => {
        setLoading(true);
        setErr('');
        try {
            const params = buildQuery({ q, page, pageSize, _t: Date.now() });
            const res = await getJSON(`/permissions${params}`);
            setList(Array.isArray(res?.data) ? res.data : []);
            setPagination(res?.pagination ?? { page, pageSize, total: 0, totalPages: 1 });
        }
        catch (e) {
            setErr(e?.message || 'Không tải được permissions');
        }
        finally {
            setLoading(false);
        }
    }, 250), [q, page, pageSize]);
    useEffect(() => {
        load();
        return () => load.cancel();
    }, [load]);
    // open modal for create
    const openCreate = () => {
        setEditing(null);
        setName('');
        setDesc('');
        setModalOpen(true);
        setTimeout(() => nameInputRef.current?.focus(), 50);
    };
    // open modal for edit
    const openEdit = (p) => {
        setEditing(p);
        setName(p.name);
        setDesc(p.description ?? '');
        setModalOpen(true);
        setTimeout(() => nameInputRef.current?.focus(), 50);
    };
    // save modal
    const onSave = async (e) => {
        e.preventDefault();
        if (!canSave)
            return;
        try {
            if (editing) {
                await patchJSON(`/permissions/${editing.id}`, {
                    name: name.trim(),
                    description: desc.trim() || null,
                });
            }
            else {
                await postJSON(`/permissions`, {
                    name: name.trim(),
                    description: desc.trim() || null,
                });
            }
            setModalOpen(false);
            setEditing(null);
            setName('');
            setDesc('');
            await load();
        }
        catch (e) {
            setErr(e?.message || 'Lưu thất bại');
        }
    };
    const onDelete = async (id) => {
        if (!confirm('Xoá permission này? Hành động không thể hoàn tác.'))
            return;
        try {
            await delJSON(`/permissions/${id}`);
            await load();
        }
        catch (e) {
            setErr(e?.message || 'Xoá thất bại');
        }
    };
    const onSearch = (e) => {
        e.preventDefault();
        setPage(1);
        load();
    };
    const renderPagination = () => {
        const pages = [];
        const maxPagesToShow = 5;
        const startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
        const endPage = Math.min(pagination.totalPages, startPage + maxPagesToShow - 1);
        for (let i = startPage; i <= endPage; i++) {
            pages.push(_jsx("button", { onClick: () => setPage(i), className: `btn hrm-btn btn-sm ${i === page ? 'hrm-button-primary' : 'btn-outline-primary'} rounded-pill px-3`, children: i }, i));
        }
        return (_jsxs("div", { className: "btn-group", children: [_jsx("button", { disabled: page <= 1, onClick: () => setPage((p) => Math.max(1, p - 1)), className: "btn hrm-btn btn-outline-primary btn-sm rounded-pill px-3", children: "\u00AB Tr\u01B0\u1EDBc" }), pages, _jsx("button", { disabled: page >= pagination.totalPages, onClick: () => setPage((p) => Math.min(pagination.totalPages, p + 1)), className: "btn hrm-btn btn-outline-primary btn-sm rounded-pill px-3", children: "Sau \u00BB" })] }));
    };
    return (_jsx("div", { className: "hrm-container", children: _jsxs("div", { className: "container", children: [_jsx("div", { className: "perm-header card shadow-sm border-0 mb-4", children: _jsxs("div", { className: "card-body p-4 d-flex align-items-center justify-content-between", children: [_jsxs("div", { children: [_jsxs("h1", { className: "h4 mb-1 text-white", children: [_jsx("i", { className: "bi bi-shield-lock me-2" }), " Qu\u1EA3n l\u00FD quy\u1EC1n"] }), _jsxs("div", { className: "text-white-50 small", children: ["T\u1ED5ng: ", _jsx("strong", { children: pagination.total }), " \u2014 Trang", ' ', _jsx("strong", { children: pagination.page }), "/", _jsx("strong", { children: pagination.totalPages })] })] }), _jsxs("div", { className: "d-flex gap-2", children: [_jsx("button", { onClick: () => nav(-1), className: "btn btn-outline-light btn-sm rounded-pill px-3", children: "\u21A9 Tr\u1EDF l\u1EA1i" }), _jsx("button", { onClick: openCreate, className: "btn btn-light btn-sm rounded-pill px-3", children: "+ T\u1EA1o quy\u1EC1n" }), _jsx(Link, { to: "/permissions/new", className: "btn btn-success btn-sm rounded-pill px-3", children: "T\u1EA1o b\u1EB1ng trang ri\u00EAng" })] })] }) }), _jsxs("form", { onSubmit: onSearch, className: "perm-toolbar row g-2 align-items-center mb-3", children: [_jsx("div", { className: "col-12 col-md", children: _jsxs("div", { className: "position-relative", children: [_jsx("i", { className: "bi bi-search perm-search-icon" }), _jsx("input", { className: "form-control shadow-sm ps-5", placeholder: "T\u00ECm theo t\u00EAn quy\u1EC1n\u2026", value: q, onChange: (e) => setQ(e.target.value) })] }) }), _jsx("div", { className: "col-6 col-md-auto", children: _jsxs("select", { value: pageSize, onChange: (e) => {
                                    setPageSize(Number(e.target.value));
                                    setPage(1);
                                }, className: "form-select shadow-sm", children: [_jsx("option", { value: "10", children: "10 / trang" }), _jsx("option", { value: "20", children: "20 / trang" }), _jsx("option", { value: "50", children: "50 / trang" }), _jsx("option", { value: "100", children: "100 / trang" })] }) }), _jsx("div", { className: "col-6 col-md-auto text-end", children: _jsx("button", { className: "btn btn-primary rounded-pill px-4 shadow-sm", children: "T\u00ECm" }) })] }), err && (_jsxs("div", { className: "alert alert-danger bg-danger-subtle border-danger-subtle d-flex align-items-center justify-content-between", children: [_jsx("span", { children: err }), _jsx("button", { onClick: () => setErr(''), className: "btn-close", "aria-label": "Close" })] })), loading ? (_jsxs("div", { className: "text-center text-secondary-emphasis py-5", children: [_jsx("div", { className: "spinner-border text-primary", style: { width: '3rem', height: '3rem' }, role: "status", children: _jsx("span", { className: "visually-hidden", children: "\u0110ang t\u1EA3i\u2026" }) }), _jsx("p", { className: "mt-3", children: "\u0110ang t\u1EA3i danh s\u00E1ch permissions..." })] })) : (_jsxs("div", { className: "card shadow-sm border-0", children: [_jsx("div", { className: "table-responsive", children: _jsxs("table", { className: "table table-hover align-middle mb-0", children: [_jsx("thead", { className: "table-light", children: _jsxs("tr", { children: [_jsx("th", { className: "ps-4", children: "ID" }), _jsx("th", { children: "T\u00EAn" }), _jsx("th", { children: "M\u00F4 t\u1EA3" }), _jsx("th", { className: "text-end pe-4", children: "Thao t\u00E1c" })] }) }), _jsxs("tbody", { children: [list.map((p, idx) => (_jsxs("tr", { className: idx % 2 === 0 ? 'table-striped-light' : '', children: [_jsx("td", { className: "ps-4", children: p.id }), _jsx("td", { className: "fw-medium text-primary-emphasis", children: p.name }), _jsx("td", { className: "text-secondary", children: p.description ?? '—' }), _jsx("td", { className: "text-end pe-4", children: _jsxs("div", { className: "btn-group", children: [_jsx("button", { onClick: () => openEdit(p), className: "btn btn-outline-primary btn-sm rounded-pill px-3", title: "S\u1EEDa nhanh", children: "S\u1EEDa" }), _jsx("button", { onClick: () => onDelete(p.id), className: "btn btn-outline-danger btn-sm rounded-pill px-3", title: "Xo\u00E1", children: "Xo\u00E1" })] }) })] }, p.id))), !list.length && (_jsx("tr", { children: _jsx("td", { colSpan: 4, className: "text-center text-secondary-emphasis py-4", children: "Kh\u00F4ng c\u00F3 d\u1EEF li\u1EC7u" }) }))] })] }) }), _jsxs("div", { className: "card-footer bg-white d-flex justify-content-between align-items-center", children: [_jsxs("small", { className: "text-muted", children: ["T\u1ED5ng: ", pagination.total, " \u2014 Trang ", pagination.page, "/", pagination.totalPages] }), renderPagination()] })] })), modalOpen && (_jsx("div", { className: "modal fade show", style: { display: 'block', background: 'rgba(0,0,0,.35)' }, tabIndex: -1, children: _jsx("div", { className: "modal-dialog modal-dialog-centered", children: _jsxs("div", { className: "modal-content shadow-lg", children: [_jsxs("div", { className: "modal-header", children: [_jsx("h5", { className: "modal-title", children: editing ? 'Sửa quyền' : 'Tạo quyền' }), _jsx("button", { type: "button", className: "btn-close", onClick: () => setModalOpen(false), "aria-label": "Close" })] }), _jsxs("form", { onSubmit: onSave, children: [_jsxs("div", { className: "modal-body", children: [_jsxs("div", { className: "mb-3", children: [_jsx("label", { className: "form-label", children: "T\u00EAn *" }), _jsx("input", { ref: nameInputRef, value: name, onChange: (e) => setName(e.target.value), className: "form-control", required: true }), name.length > 0 && name.trim().length === 0 && (_jsx("div", { className: "form-text text-danger", children: "T\u00EAn kh\u00F4ng h\u1EE3p l\u1EC7" }))] }), _jsxs("div", { className: "mb-3", children: [_jsx("label", { className: "form-label", children: "M\u00F4 t\u1EA3" }), _jsx("input", { value: desc, onChange: (e) => setDesc(e.target.value), className: "form-control" })] })] }), _jsxs("div", { className: "modal-footer", children: [_jsx("button", { type: "button", className: "btn btn-outline-secondary", onClick: () => setModalOpen(false), children: "Hu\u1EF7" }), _jsx("button", { type: "submit", disabled: !canSave, className: "btn btn-primary", children: "L\u01B0u" })] })] })] }) }) }))] }) }));
}
