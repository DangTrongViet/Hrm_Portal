import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiGet } from '../../../lib/api';
import { debounce } from 'lodash';
import '../../../../public/css/users/UsersListPage.css';
export default function UsersListPage() {
    const nav = useNavigate();
    const [sp, setSp] = useSearchParams();
    const [rows, setRows] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 1,
    });
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');
    // query params
    const page = Number(sp.get('page') || 1);
    const pageSize = Number(sp.get('pageSize') || 10);
    const q = sp.get('q') || '';
    const status = sp.get('status') || '';
    const roleName = sp.get('role') || '';
    // sorting (client-side)
    const [sortKey, setSortKey] = useState('createdAt');
    const [sortDir, setSortDir] = useState('desc');
    const setParam = (kv, opts) => {
        const next = new URLSearchParams(sp);
        Object.entries(kv).forEach(([k, v]) => v ? next.set(k, v) : next.delete(k));
        setSp(next, { replace: opts?.replace ?? true });
    };
    const load = useMemo(() => debounce(async () => {
        setLoading(true);
        setErr('');
        try {
            const qs = new URLSearchParams();
            if (q)
                qs.set('q', q);
            if (status)
                qs.set('status', status);
            if (roleName)
                qs.set('role', roleName);
            qs.set('page', String(page));
            qs.set('pageSize', String(pageSize));
            const res = await apiGet(`/users?${qs.toString()}`);
            setRows(res.data);
            setPagination(res.pagination);
        }
        catch (e) {
            setErr(e?.message || 'Không tải được danh sách');
        }
        finally {
            setLoading(false);
        }
    }, 300), [q, status, roleName, page, pageSize]);
    useEffect(() => {
        load();
        return () => load.cancel();
    }, [load]);
    const onSubmit = (e) => {
        e.preventDefault();
        const val = e.currentTarget.elements.namedItem('q').value.trim();
        setParam({ q: val || undefined, page: '1' });
    };
    const toggleSort = (key) => {
        if (sortKey === key)
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        else {
            setSortKey(key);
            setSortDir('asc');
        }
    };
    const sortedRows = useMemo(() => {
        const arr = [...rows];
        const dir = sortDir === 'asc' ? 1 : -1;
        arr.sort((a, b) => {
            const A = sortKey === 'role'
                ? (a.role?.name || '').toLowerCase()
                : sortKey === 'isVerified'
                    ? a.isVerified
                        ? 1
                        : 0
                    : sortKey === 'createdAt'
                        ? new Date(a.createdAt).getTime()
                        : // name, email, status
                            String(a[sortKey] ?? '').toLowerCase();
            const B = sortKey === 'role'
                ? (b.role?.name || '').toLowerCase()
                : sortKey === 'isVerified'
                    ? b.isVerified
                        ? 1
                        : 0
                    : sortKey === 'createdAt'
                        ? new Date(b.createdAt).getTime()
                        : String(b[sortKey] ?? '').toLowerCase();
            if (A < B)
                return -1 * dir;
            if (A > B)
                return 1 * dir;
            return 0;
        });
        return arr;
    }, [rows, sortKey, sortDir]);
    const uniqueRoles = useMemo(() => {
        const set = new Set();
        rows.forEach((r) => r.role?.name && set.add(r.role.name));
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [rows]);
    const renderPagination = () => {
        const pages = [];
        const maxPagesToShow = 5;
        const startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
        const endPage = Math.min(pagination.totalPages, startPage + maxPagesToShow - 1);
        for (let i = startPage; i <= endPage; i++) {
            pages.push(_jsx("button", { onClick: () => setParam({ ...Object.fromEntries(sp), page: String(i) }), className: `btn btn-sm ${i === page ? 'btn-primary' : 'btn-outline-primary'} px-3`, children: i }, i));
        }
        return (_jsxs("div", { className: "btn-group pill-pagination", children: [_jsx("button", { disabled: page <= 1, onClick: () => setParam({
                        ...Object.fromEntries(sp),
                        page: String(Math.max(1, page - 1)),
                    }), className: "btn btn-outline-primary btn-sm px-3", children: "\u00AB Tr\u01B0\u1EDBc" }), pages, _jsx("button", { disabled: page >= pagination.totalPages, onClick: () => setParam({
                        ...Object.fromEntries(sp),
                        page: String(Math.min(pagination.totalPages, page + 1)),
                    }), className: "btn btn-outline-primary btn-sm px-3", children: "Sau \u00BB" })] }));
    };
    const copy = async (text) => {
        if (!text)
            return;
        try {
            await navigator.clipboard.writeText(text);
        }
        catch {
            // ignore
        }
    };
    return (_jsx("div", { className: "user container py-5", children: _jsxs("div", { className: "card users-card mb-5", children: [_jsxs("div", { className: "card-body users-header p-5", children: [_jsxs("div", { className: "d-flex align-items-center justify-content-between flex-wrap gap-3", children: [_jsx("h1", { className: "h3 fw-bold mb-0 font-weight =700px ", style: { color: '#000000' }, children: "Qu\u1EA3n l\u00FD ng\u01B0\u1EDDi d\u00F9ng" }), _jsxs("div", { className: "d-flex gap-2", children: [_jsxs("button", { onClick: () => nav(-1), className: "btn btn-outline-light btn-sm d-flex align-items-center gap-2 hrm-btn", children: [_jsx("svg", { width: "16", height: "16", fill: "currentColor", viewBox: "0 0 16 16", children: _jsx("path", { fillRule: "evenodd", d: "M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" }) }), "Tr\u1EDF l\u1EA1i"] }), _jsxs(Link, { to: "/users/new", className: "btn btn-success btn-sm d-flex align-items-center gap-2 hrm-btn", children: [_jsx("svg", { width: "16", height: "16", fill: "currentColor", viewBox: "0 0 16 16", children: _jsx("path", { d: "M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" }) }), "T\u1EA1o t\u00E0i kho\u1EA3n"] })] })] }), _jsxs("form", { onSubmit: onSubmit, className: "row g-2 mt-4 input-compact", children: [_jsx("div", { className: "col-12 col-md-6", children: _jsxs("div", { className: "input-group shadow-sm", children: [_jsx("span", { className: "input-group-text bg-white border-end-0", children: _jsx("svg", { width: "16", height: "16", fill: "currentColor", viewBox: "0 0 16 16", children: _jsx("path", { d: "M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" }) }) }), _jsx("input", { name: "q", defaultValue: q, className: "form-control border-start-0", placeholder: "T\u00ECm t\u00EAn, email ho\u1EB7c S\u0110T" }), _jsx("button", { type: "submit", className: "btn btn-primary", children: "T\u00ECm" })] }) }), _jsx("div", { className: "col-6 col-md-2", children: _jsxs("select", { value: status, onChange: (e) => setParam({ status: e.target.value || undefined, page: '1' }), className: "form-select shadow-sm", children: [_jsx("option", { value: "", children: "T\u1EA5t c\u1EA3 tr\u1EA1ng th\u00E1i" }), _jsx("option", { value: "active", children: "\u0110ang ho\u1EA1t \u0111\u1ED9ng" }), _jsx("option", { value: "inactive", children: "Ng\u01B0ng ho\u1EA1t \u0111\u1ED9ng" })] }) }), _jsx("div", { className: "col-6 col-md-2", children: _jsxs("select", { value: roleName, onChange: (e) => setParam({ role: e.target.value || undefined, page: '1' }), className: "form-select shadow-sm", children: [_jsx("option", { value: "", children: "T\u1EA5t c\u1EA3 vai tr\u00F2" }), uniqueRoles.map((r) => (_jsx("option", { value: r, children: r }, r)))] }) }), _jsx("div", { className: "col-12 col-md-2", children: _jsxs("select", { value: pageSize, onChange: (e) => setParam({ pageSize: e.target.value, page: '1' }), className: "form-select shadow-sm", children: [_jsx("option", { value: "10", children: "10 / trang" }), _jsx("option", { value: "20", children: "20 / trang" }), _jsx("option", { value: "50", children: "50 / trang" }), _jsx("option", { value: "100", children: "100 / trang" })] }) })] })] }), _jsxs("div", { className: "card-body", children: [err && (_jsxs("div", { className: "alert alert-danger d-flex align-items-center gap-2 mb-4", role: "alert", children: [_jsxs("svg", { width: "16", height: "16", fill: "currentColor", viewBox: "0 0 24 24", children: [_jsx("path", { d: "M12 9v4" }), _jsx("path", { d: "M12 17h.01" }), _jsx("path", { d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" })] }), _jsx("span", { children: err }), _jsx("button", { onClick: () => setErr(''), className: "btn-close ms-auto", "aria-label": "Close" })] })), _jsx("div", { className: "table-responsive shadow-sm rounded-3 hrm-table", children: _jsxs("table", { className: "table table-hover align-middle mb-0", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsxs("th", { className: "px-4 py-3 sortable", onClick: () => toggleSort('name'), children: ["T\u00EAn", ' ', _jsx("span", { className: "sort-ind", children: sortKey === 'name'
                                                                ? sortDir === 'asc'
                                                                    ? '▲'
                                                                    : '▼'
                                                                : '' })] }), _jsxs("th", { className: "px-4 py-3 sortable", onClick: () => toggleSort('email'), children: ["Email", ' ', _jsx("span", { className: "sort-ind", children: sortKey === 'email'
                                                                ? sortDir === 'asc'
                                                                    ? '▲'
                                                                    : '▼'
                                                                : '' })] }), _jsxs("th", { className: "px-4 py-3 text-center sortable", onClick: () => toggleSort('status'), children: ["Tr\u1EA1ng th\u00E1i", ' ', _jsx("span", { className: "sort-ind", children: sortKey === 'status'
                                                                ? sortDir === 'asc'
                                                                    ? '▲'
                                                                    : '▼'
                                                                : '' })] }), _jsxs("th", { className: "px-4 py-3 text-center sortable", onClick: () => toggleSort('isVerified'), children: ["X\u00E1c minh", ' ', _jsx("span", { className: "sort-ind", children: sortKey === 'isVerified'
                                                                ? sortDir === 'asc'
                                                                    ? '▲'
                                                                    : '▼'
                                                                : '' })] }), _jsxs("th", { className: "px-4 py-3 text-center sortable", onClick: () => toggleSort('role'), children: ["Vai tr\u00F2", ' ', _jsx("span", { className: "sort-ind", children: sortKey === 'role'
                                                                ? sortDir === 'asc'
                                                                    ? '▲'
                                                                    : '▼'
                                                                : '' })] }), _jsxs("th", { className: "px-4 py-3 text-end sortable", onClick: () => toggleSort('createdAt'), children: ["T\u1EA1o l\u00FAc", ' ', _jsx("span", { className: "sort-ind", children: sortKey === 'createdAt'
                                                                ? sortDir === 'asc'
                                                                    ? '▲'
                                                                    : '▼'
                                                                : '' })] }), _jsx("th", { className: "px-4 py-3", children: "Xem" })] }) }), _jsxs("tbody", { children: [loading &&
                                                Array.from({ length: 6 }).map((_, i) => (_jsxs("tr", { children: [_jsx("td", { className: "px-4 py-3", children: _jsx("div", { className: "skel-row" }) }), _jsx("td", { className: "px-4 py-3", children: _jsx("div", { className: "skel-row" }) }), _jsx("td", { className: "px-4 py-3 text-center", children: _jsx("div", { className: "skel-row mx-auto", style: { width: 90 } }) }), _jsx("td", { className: "px-4 py-3 text-center", children: _jsx("div", { className: "skel-row mx-auto", style: { width: 70 } }) }), _jsx("td", { className: "px-4 py-3 text-center", children: _jsx("div", { className: "skel-row mx-auto", style: { width: 120 } }) }), _jsx("td", { className: "px-4 py-3 text-end", children: _jsx("div", { className: "skel-row ms-auto", style: { width: 120 } }) }), _jsx("td", { className: "px-4 py-3" })] }, `skel-${i}`))), !loading &&
                                                sortedRows.map((u, index) => (_jsxs("tr", { className: `border-bottom border-2 border-light hrm-table-row ${index % 2 === 0 ? 'bg-light' : 'bg-secondary-subtle'}`, children: [_jsx("td", { className: "px-4 py-3 fw-medium text-primary-emphasis", children: _jsxs("div", { className: "d-flex align-items-center gap-2", children: [_jsx("span", { className: "badge badge-soft", children: u.id }), u.name] }) }), _jsx("td", { className: "px-4 py-3", children: _jsxs("div", { className: "d-flex align-items-center gap-2", children: [_jsx("span", { className: "text-info-emphasis", children: u.email }), _jsx("button", { className: "copy-btn", title: "Sao ch\u00E9p email", onClick: () => copy(u.email), children: _jsxs("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "currentColor", children: [_jsx("path", { d: "M4 1.5A1.5 1.5 0 0 1 5.5 0h6A1.5 1.5 0 0 1 13 1.5v6A1.5 1.5 0 0 1 11.5 9h-6A1.5 1.5 0 0 1 4 7.5v-6z" }), _jsx("path", { d: "M3 4.5A1.5 1.5 0 0 0 1.5 6v6A1.5 1.5 0 0 0 3 13.5h6A1.5 1.5 0 0 0 10.5 12V11H11v1a2.5 2.5 0 0 1-2.5 2.5h-6A2.5 2.5 0 0 1 0 12V6A2.5 2.5 0 0 1 2.5 3.5H4v1z" })] }) }), u.phoneNumber && (_jsx("button", { className: "copy-btn ms-1", title: "Sao ch\u00E9p S\u0110T", onClick: () => copy(u.phoneNumber), children: _jsx("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "currentColor", children: _jsx("path", { d: "M3.654 1.328a.678.678 0 0 1 1.015-.063l2.29 2.29c.329.329.445.81.294 1.243l-.805 2.3a.678.678 0 0 0 .157.69l2.457 2.457a.678.678 0 0 0 .69.157l2.3-.805a1.2 1.2 0 0 1 1.243.294l2.29 2.29a.678.678 0 0 1-.063 1.015c-1.469 1.13-3.54 1.01-5.063-.513L4.167 6.39C2.645 4.87 2.525 2.797 3.654 1.328z" }) }) }))] }) }), _jsx("td", { className: "px-4 py-3 text-center", children: _jsx("span", { className: `badge ${u.status === 'active' ? 'text-bg-success' : 'text-bg-warning'} bg-gradient`, children: u.status === 'active'
                                                                    ? 'Đang hoạt động'
                                                                    : 'Ngưng hoạt động' }) }), _jsx("td", { className: "px-4 py-3 text-center", children: u.isVerified ? (_jsx("svg", { className: "text-success", width: "18", height: "18", fill: "currentColor", viewBox: "0 0 16 16", children: _jsx("path", { d: "M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" }) })) : (_jsx("svg", { className: "text-danger", width: "18", height: "18", fill: "currentColor", viewBox: "0 0 16 16", children: _jsx("path", { d: "M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" }) })) }), _jsx("td", { className: "px-4 py-3 text-center text-secondary-emphasis", children: u.role?.name || '—' }), _jsx("td", { className: "px-4 py-3 text-end", children: _jsx("small", { className: "text-muted", children: new Date(u.createdAt).toLocaleString() }) }), _jsx("td", { className: "px-4 py-3 text-end table-actions", children: _jsx(Link, { to: `/users/${u.id}`, className: "text-decoration-none fw-medium", children: "Chi ti\u1EBFt" }) })] }, u.id))), !loading && !sortedRows.length && (_jsx("tr", { children: _jsx("td", { colSpan: 7, className: "px-4 py-5 text-center", children: _jsxs("div", { className: "empty-wrap", children: [_jsxs("svg", { className: "mb-2", width: "28", height: "28", fill: "currentColor", viewBox: "0 0 16 16", children: [_jsx("path", { d: "M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z" }), _jsx("path", { d: "M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z" })] }), _jsx("p", { className: "mb-0", children: "Kh\u00F4ng c\u00F3 d\u1EEF li\u1EC7u ph\u00F9 h\u1EE3p." })] }) }) }))] })] }) }), _jsxs("div", { className: "d-flex justify-content-between align-items-center mt-4", children: [_jsxs("small", { className: "text-muted", children: ["T\u1ED5ng: ", pagination.total, " \u2014 Trang ", pagination.page, "/", pagination.totalPages] }), renderPagination()] })] })] }) }));
}
