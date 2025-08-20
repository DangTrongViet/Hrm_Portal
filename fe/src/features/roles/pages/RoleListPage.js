import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getJSON, delJSON, buildQuery } from '../../../lib/http';
import { debounce } from 'lodash';
import '../../../../public/css/roles/RolesListPage.css';
export default function RolesListPage() {
    const nav = useNavigate();
    const [q, setQ] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [list, setList] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 20,
        total: 0,
        totalPages: 1,
    });
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');
    // debounced loader phụ thuộc q, page, pageSize
    const load = useMemo(() => debounce(async (qVal, pageVal, pageSizeVal) => {
        setLoading(true);
        setErr('');
        try {
            const params = buildQuery({
                q: qVal,
                page: pageVal,
                pageSize: pageSizeVal,
                _t: Date.now(),
            });
            const res = await getJSON(`/roles${params}`);
            setList(Array.isArray(res?.data) ? res.data : []);
            setPagination(res?.pagination ?? {
                page: 1,
                pageSize: pageSizeVal,
                total: 0,
                totalPages: 1,
            });
        }
        catch (e) {
            setErr(e?.message || 'Không tải được danh sách vai trò');
        }
        finally {
            setLoading(false);
        }
    }, 300), []);
    // gọi load khi state thay đổi (tránh gọi load ngay sau setState)
    useEffect(() => {
        load(q, page, pageSize);
        return () => load.cancel();
    }, [q, page, pageSize, load]);
    const onSearch = (e) => {
        e.preventDefault();
        // Chỉ reset page, effect ở trên sẽ gọi load với state mới
        setPage(1);
    };
    const onClear = () => {
        setQ('');
        setPage(1);
    };
    const onRefresh = () => {
        load.flush?.(); // chạy ngay nếu đang debounce
        load(q, page, pageSize);
    };
    const onDelete = async (id) => {
        if (!confirm('Xoá vai trò này? Hành động không thể hoàn tác.'))
            return;
        try {
            await delJSON(`/roles/${id}`);
            // sau khi xoá, nếu trang hiện tại rỗng thì lùi trang
            const remaining = list.length - 1;
            if (remaining === 0 && page > 1) {
                setPage((p) => Math.max(1, p - 1));
            }
            else {
                onRefresh();
            }
        }
        catch (e) {
            alert(e?.message || 'Xoá thất bại');
        }
    };
    const renderPagination = () => {
        const pages = [];
        const maxPagesToShow = 5;
        const startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
        const endPage = Math.min(pagination.totalPages, startPage + maxPagesToShow - 1);
        for (let i = startPage; i <= endPage; i++) {
            pages.push(_jsx("button", { onClick: () => setPage(i), className: `btn hrm-btn btn-sm ${i === page ? 'hrm-button-primary' : 'btn-outline-primary'} rounded-pill px-3`, "aria-current": i === page ? 'page' : undefined, children: i }, i));
        }
        return (_jsxs("div", { className: "btn-group", role: "group", "aria-label": "Pagination", children: [_jsx("button", { disabled: page <= 1, onClick: () => setPage((p) => Math.max(1, p - 1)), className: "btn hrm-btn btn-outline-primary btn-sm rounded-pill px-3", children: "\u00AB Tr\u01B0\u1EDBc" }), pages, _jsx("button", { disabled: page >= pagination.totalPages, onClick: () => setPage((p) => Math.min(pagination.totalPages, p + 1)), className: "btn hrm-btn btn-outline-primary btn-sm rounded-pill px-3", children: "Sau \u00BB" })] }));
    };
    return (_jsx("div", { className: "hrm-container role", children: _jsxs("div", { className: "container", children: [_jsxs("div", { className: "d-flex justify-content-between align-items-center mb-4", children: [_jsx("h1", { className: "h3 fw-bold gradient-text hrm-title", children: "\uD83D\uDD10 Qu\u1EA3n l\u00FD vai tr\u00F2" }), _jsxs("div", { className: "hrm-action-group", children: [_jsx("button", { onClick: () => nav(-1), className: "btn hrm-btn hrm-button-secondary btn-sm rounded-pill px-4", children: "\u21A9 Tr\u1EDF l\u1EA1i" }), _jsx("button", { onClick: onRefresh, className: "btn hrm-btn btn-outline-primary btn-sm rounded-pill px-4", disabled: loading, title: "T\u1EA3i l\u1EA1i danh s\u00E1ch", children: "\u27F3 T\u1EA3i l\u1EA1i" }), _jsx(Link, { to: "/roles/new", className: "btn hrm-btn hrm-button-primary btn-sm rounded-pill px-4", children: "\u2795 T\u1EA1o vai tr\u00F2" })] })] }), _jsxs("form", { onSubmit: onSearch, className: "d-flex gap-3 mb-4", role: "search", "aria-label": "T\u00ECm vai tr\u00F2", children: [_jsxs("div", { className: "hrm-form-input-icon", children: [_jsx("i", { className: "bi bi-search", "aria-hidden": "true" }), _jsx("input", { value: q, onChange: (e) => setQ(e.target.value), className: "form-control hrm-form-input", placeholder: "T\u00ECm theo t\u00EAn vai tr\u00F2\u2026", "aria-label": "T\u00ECm theo t\u00EAn vai tr\u00F2" })] }), _jsxs("select", { value: pageSize, onChange: (e) => {
                                setPageSize(Number(e.target.value));
                                setPage(1);
                            }, className: "form-select hrm-form-input", style: { width: '140px' }, "aria-label": "K\u00EDch th\u01B0\u1EDBc trang", children: [_jsx("option", { value: "10", children: "10 / trang" }), _jsx("option", { value: "20", children: "20 / trang" }), _jsx("option", { value: "50", children: "50 / trang" }), _jsx("option", { value: "100", children: "100 / trang" })] }), _jsxs("button", { type: "submit", className: "btn hrm-btn hrm-button-primary rounded-pill px-4", disabled: loading, children: [_jsx("i", { className: "bi bi-search hrm-icon" }), " T\u00ECm"] }), _jsx("button", { type: "button", onClick: onClear, className: "btn hrm-btn btn-outline-secondary rounded-pill px-4", disabled: loading && !q, title: "Xo\u00E1 t\u1EEB kho\u00E1", children: "Xo\u00E1" })] }), err && (_jsxs("div", { className: "hrm-error mb-4 d-flex justify-content-between align-items-center", role: "alert", children: [_jsx("span", { children: err }), _jsx("button", { onClick: () => setErr(''), className: "btn-close", "aria-label": "\u0110\u00F3ng th\u00F4ng b\u00E1o" })] })), loading ? (_jsxs("div", { className: "text-center text-secondary-emphasis py-5", children: [_jsx("div", { className: "spinner-border text-primary", style: { width: '3rem', height: '3rem' }, role: "status", children: _jsx("span", { className: "visually-hidden", children: "\u0110ang t\u1EA3i\u2026" }) }), _jsx("p", { className: "mt-3", children: "\u0110ang t\u1EA3i danh s\u00E1ch vai tr\u00F2..." })] })) : (_jsx("div", { className: "hrm-table-container", children: _jsxs("table", { className: "table table-hover align-middle mb-0 hrm-table", children: [_jsx("thead", { className: "table-primary", children: _jsxs("tr", { children: [_jsxs("th", { style: { width: 80 }, children: [_jsx("i", { className: "bi bi-hash hrm-icon" }), "ID"] }), _jsxs("th", { style: { width: 260 }, children: [_jsx("i", { className: "bi bi-person-badge hrm-icon" }), "T\u00EAn"] }), _jsxs("th", { style: { width: 220 }, children: [_jsx("i", { className: "bi bi-building hrm-icon" }), "Ph\u00F2ng ban"] }), _jsxs("th", { children: [_jsx("i", { className: "bi bi-file-text hrm-icon" }), "M\u00F4 t\u1EA3"] }), _jsxs("th", { className: "text-end", style: { width: 240 }, children: [_jsx("i", { className: "bi bi-gear hrm-icon" }), "Thao t\u00E1c"] })] }) }), _jsxs("tbody", { children: [list.map((r, index) => (_jsxs("tr", { className: `hrm-table-row ${index % 2 === 0 ? 'bg-light' : 'bg-secondary-subtle'}`, children: [_jsx("td", { children: r.id }), _jsxs("td", { className: "fw-medium text-primary-emphasis", children: [r.name, Array.isArray(r.permissions) &&
                                                        r.permissions.length > 0 && (_jsxs("span", { className: "ms-2 hrm-pill", title: "S\u1ED1 quy\u1EC1n", children: [r.permissions.length, " quy\u1EC1n"] }))] }), _jsx("td", { children: r.department ?? '—' }), _jsx("td", { className: "text-truncate", style: { maxWidth: 480 }, children: r.description ?? '—' }), _jsxs("td", { className: "text-end hrm-action-group", children: [_jsxs(Link, { to: `/roles/${r.id}`, className: "btn hrm-btn btn-outline-primary btn-sm rounded-pill px-3", children: [_jsx("i", { className: "bi bi-eye hrm-icon" }), "Xem"] }), _jsxs(Link, { to: `/roles/${r.id}/edit`, className: "btn hrm-btn btn-outline-secondary btn-sm rounded-pill px-3", children: [_jsx("i", { className: "bi bi-pencil hrm-icon" }), "S\u1EEDa"] }), _jsxs("button", { onClick: () => onDelete(r.id), className: "btn hrm-btn btn-outline-danger btn-sm rounded-pill px-3", children: [_jsx("i", { className: "bi bi-trash hrm-icon" }), "Xo\u00E1"] })] })] }, r.id))), !list.length && (_jsx("tr", { children: _jsxs("td", { colSpan: 5, className: "text-center bg-light hrm-empty", children: [_jsx("div", { className: "mb-2", children: _jsx("i", { className: "bi bi-inbox", style: { fontSize: 28 } }) }), "Kh\u00F4ng c\u00F3 d\u1EEF li\u1EC7u \u2014 th\u1EED xo\u00E1 b\u1ED9 l\u1ECDc ho\u1EB7c t\u1EA1o vai tr\u00F2 m\u1EDBi."] }) }))] })] }) })), _jsxs("div", { className: "d-flex justify-content-between align-items-center mt-4", children: [_jsxs("small", { className: "text-muted", children: ["T\u1ED5ng: ", pagination.total, " \u2014 Trang ", pagination.page, "/", pagination.totalPages] }), renderPagination()] })] }) }));
}
