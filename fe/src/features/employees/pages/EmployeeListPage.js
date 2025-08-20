import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getJSON, delJSON, buildQuery } from '../../../lib/http';
import { debounce } from 'lodash';
import '../../../../public/css/employees/EmployeeListPage.css';
export default function EmployeesListPage() {
    const nav = useNavigate();
    const [q, setQ] = useState('');
    const [department, setDepartment] = useState('');
    const [status, setStatus] = useState('');
    const [sort, setSort] = useState('full_name');
    const [dir, setDir] = useState('asc');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [data, setData] = useState({
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
    });
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');
    const totalPages = useMemo(() => Math.max(1, Math.ceil(data.total / data.pageSize)), [data.total, data.pageSize]);
    const load = useMemo(() => debounce(async () => {
        setLoading(true);
        setErr('');
        try {
            const params = buildQuery({
                q,
                department,
                status,
                sort,
                dir,
                page,
                pageSize,
                _t: Date.now(),
            });
            const res = await getJSON(`/employees${params}`);
            setData(res);
        }
        catch (e) {
            setErr(e?.message || 'Không tải được danh sách nhân viên');
        }
        finally {
            setLoading(false);
        }
    }, 300), [q, department, status, sort, dir, page, pageSize]);
    useEffect(() => {
        load();
        return () => load.cancel();
    }, [load]);
    const onSearch = (e) => {
        e.preventDefault();
        setPage(1);
        load();
    };
    const onDelete = async (id) => {
        if (!confirm('Xoá nhân viên này? Hành động không thể hoàn tác.'))
            return;
        try {
            await delJSON(`/employees/${id}`);
            await load();
        }
        catch (e) {
            alert(e?.message || 'Xoá thất bại');
        }
    };
    const renderPagination = () => {
        const pages = [];
        const maxPagesToShow = 5;
        const startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
        const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
        for (let i = startPage; i <= endPage; i++) {
            pages.push(_jsx("button", { onClick: () => setPage(i), className: `btn btn-sm ${i === page ? 'btn-primary' : 'btn-outline-primary'} rounded-pill px-3`, children: i }, i));
        }
        return (_jsxs("div", { className: "btn-group", children: [_jsx("button", { disabled: page <= 1, onClick: () => setPage((p) => Math.max(1, p - 1)), className: "btn btn-outline-primary btn-sm rounded-pill px-3", children: "\u00AB Tr\u01B0\u1EDBc" }), pages, _jsx("button", { disabled: page >= totalPages, onClick: () => setPage((p) => Math.min(totalPages, p + 1)), className: "btn btn-outline-primary btn-sm rounded-pill px-3", children: "Sau \u00BB" })] }));
    };
    return (_jsx("div", { className: "employee container py-5", children: _jsx("div", { className: "card shadow-lg border-0 mb-5 bg-light-subtle", children: _jsxs("div", { className: "card-body p-5", children: [_jsxs("div", { className: "d-flex justify-content-between align-items-center mb-4", children: [_jsx("h1", { className: "h3 fw-bold text-primary-emphasis", children: "\uD83D\uDCCB Qu\u1EA3n l\u00FD nh\u00E2n vi\u00EAn" }), _jsxs("div", { className: "d-flex gap-3", children: [_jsx("button", { onClick: () => nav(-1), className: "btn btn-outline-dark btn-sm", children: "\u21A9 Quay l\u1EA1i" }), _jsx(Link, { to: "/employees/new", className: "btn btn-success btn-sm", children: "\u2795 Th\u00EAm nh\u00E2n vi\u00EAn" })] })] }), _jsxs("form", { onSubmit: onSearch, className: "row g-3 mb-4", children: [_jsx("div", { className: "col-md-3", children: _jsx("input", { value: q, onChange: (e) => setQ(e.target.value), className: "form-control shadow-sm", placeholder: "\uD83D\uDD0D T\u00ECm theo t\u00EAn, email, S\u0110T\u2026" }) }), _jsx("div", { className: "col-md-3", children: _jsx("input", { value: department, onChange: (e) => setDepartment(e.target.value), className: "form-control shadow-sm", placeholder: "\uD83C\uDFE2 Ph\u00F2ng ban" }) }), _jsx("div", { className: "col-md-2", children: _jsxs("select", { value: status, onChange: (e) => setStatus(e.target.value), className: "form-select shadow-sm", children: [_jsx("option", { value: "", children: "T\u1EA5t c\u1EA3 tr\u1EA1ng th\u00E1i" }), _jsx("option", { value: "active", children: "\u0110ang ho\u1EA1t \u0111\u1ED9ng" }), _jsx("option", { value: "inactive", children: "Ng\u01B0ng ho\u1EA1t \u0111\u1ED9ng" })] }) }), _jsx("div", { className: "col-md-2", children: _jsxs("select", { value: pageSize, onChange: (e) => {
                                        setPageSize(Number(e.target.value));
                                        setPage(1);
                                    }, className: "form-select shadow-sm", children: [_jsx("option", { value: "10", children: "10 / trang" }), _jsx("option", { value: "20", children: "20 / trang" }), _jsx("option", { value: "50", children: "50 / trang" }), _jsx("option", { value: "100", children: "100 / trang" })] }) }), _jsx("div", { className: "col-md-2", children: _jsx("button", { type: "submit", className: "btn btn-primary bg-gradient w-100", children: "T\u00ECm" }) })] }), _jsxs("div", { className: "d-flex gap-3 align-items-center mb-4", children: [_jsx("label", { className: "form-label text-muted mb-0", children: "S\u1EAFp x\u1EBFp:" }), _jsxs("select", { value: sort, onChange: (e) => setSort(e.target.value), className: "form-select w-auto shadow-sm", children: [_jsx("option", { value: "full_name", children: "T\u00EAn" }), _jsx("option", { value: "department", children: "Ph\u00F2ng ban" }), _jsx("option", { value: "status", children: "Tr\u1EA1ng th\u00E1i" }), _jsx("option", { value: "createdAt", children: "T\u1EA1o l\u00FAc" }), _jsx("option", { value: "updatedAt", children: "C\u1EADp nh\u1EADt" })] }), _jsxs("select", { value: dir, onChange: (e) => setDir(e.target.value), className: "form-select w-auto shadow-sm", children: [_jsx("option", { value: "asc", children: "\u2191 T\u0103ng d\u1EA7n" }), _jsx("option", { value: "desc", children: "\u2193 Gi\u1EA3m d\u1EA7n" })] })] }), err && (_jsxs("div", { className: "alert alert-danger bg-danger-subtle border-danger-subtle mb-4 d-flex justify-content-between align-items-center", children: [err, _jsx("button", { onClick: () => setErr(''), className: "btn-close", "aria-label": "Close" })] })), loading ? (_jsxs("div", { className: "text-center text-muted py-5", children: [_jsx("div", { className: "spinner-border text-primary", style: { width: '3rem', height: '3rem' }, role: "status", children: _jsx("span", { className: "visually-hidden", children: "\u0110ang t\u1EA3i\u2026" }) }), _jsx("p", { className: "mt-3", children: "\u0110ang t\u1EA3i danh s\u00E1ch nh\u00E2n vi\u00EAn..." })] })) : (_jsx("div", { className: "table-responsive shadow rounded-3", children: _jsxs("table", { className: "table table-hover align-middle table-fixed", children: [_jsx("thead", { className: "table-info text-white", children: _jsxs("tr", { children: [_jsx("th", { className: "col-equal", children: "ID" }), _jsx("th", { className: "col-equal", children: "H\u1ECD t\u00EAn" }), _jsx("th", { className: "col-equal", children: "Email" }), _jsx("th", { className: "col-equal", children: "S\u0110T" }), _jsx("th", { className: "col-equal", children: "Ph\u00F2ng ban" }), _jsx("th", { className: "col-equal", children: "T\u00E0i kho\u1EA3n" }), _jsx("th", { className: "col-equal text-end", children: "Thao t\u00E1c" })] }) }), _jsxs("tbody", { children: [data.items.map((emp, index) => (_jsxs("tr", { className: index % 2 === 0 ? 'bg-light' : 'bg-secondary-subtle', children: [_jsx("td", { className: "col-equal", children: emp.id }), _jsx("td", { className: "col-equal fw-medium text-primary-emphasis", children: emp.full_name }), _jsx("td", { className: "col-equal text-info-emphasis", children: emp.email || '—' }), _jsx("td", { className: "col-equal", children: emp.phone || '—' }), _jsx("td", { className: "col-equal", children: emp.department || '—' }), _jsx("td", { className: "col-equal", children: emp.user?.name || '—' }), _jsxs("td", { className: "col-equal text-end", children: [_jsx(Link, { to: `/employees/${emp.id}`, className: "btn btn-sm btn-outline-primary me-2", children: "S\u1EEDa" }), _jsx("button", { onClick: () => onDelete(emp.id), className: "btn btn-sm btn-outline-danger", children: "Xo\u00E1" })] })] }, emp.id))), !data.items.length && (_jsx("tr", { children: _jsxs("td", { colSpan: 7, className: "text-center text-muted py-4 bg-light", children: [' ', "Kh\u00F4ng c\u00F3 d\u1EEF li\u1EC7u"] }) }))] })] }) })), _jsxs("div", { className: "d-flex justify-content-between align-items-center mt-4", children: [_jsxs("small", { className: "text-muted", children: ["T\u1ED5ng: ", data.total, " \u2014 Trang ", data.page, "/", totalPages] }), renderPagination()] })] }) }) }));
}
