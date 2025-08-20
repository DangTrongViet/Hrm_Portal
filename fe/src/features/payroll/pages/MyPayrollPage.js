import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/features/payroll/MyPayrollList.tsx
import { useEffect, useMemo, useState } from 'react';
import { getJSON } from '../../../lib/http';
import '../../../../public/css/payroll/MyPayrollList.css';
const PAGE_SIZES = [5, 10, 20];
const toNumber = (val) => {
    if (val === null || val === undefined)
        return 0;
    if (typeof val === 'number')
        return Number.isFinite(val) ? val : 0;
    const n = Number(String(val).replace(/[^\d.-]/g, '')); // loại mọi ký tự không phải số, dấu . -
    return Number.isFinite(n) ? n : 0;
};
const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(toNumber(amount ?? 0));
const parseDate = (s) => (s ? new Date(s) : null);
const MyPayrollList = () => {
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // UI states
    const [q, setQ] = useState(''); // tìm kiếm theo ngày YYYY-MM hoặc text tự do
    const [fromDate, setFromDate] = useState(''); // lọc từ ngày
    const [toDate, setToDate] = useState(''); // lọc đến ngày
    const [sortKey, setSortKey] = useState('period_start');
    const [sortDir, setSortDir] = useState('desc');
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(1);
    useEffect(() => {
        const fetchPayrolls = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await getJSON('/payroll/me');
                setPayrolls(Array.isArray(res?.data) ? res.data : []);
            }
            catch (err) {
                setError(err?.message || 'Lỗi khi lấy bảng lương');
            }
            finally {
                setLoading(false);
            }
        };
        fetchPayrolls();
    }, []);
    const toggleSort = (key) => {
        if (sortKey === key)
            setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        else {
            setSortKey(key);
            setSortDir('asc');
        }
    };
    const filtered = useMemo(() => {
        let list = [...payrolls];
        // Tìm kiếm nhanh: khớp một phần với period_start/period_end (ví dụ gõ "2025-08")
        if (q.trim()) {
            const term = q.trim().toLowerCase();
            list = list.filter((p) => {
                const s = (p.period_start ?? '').toString().toLowerCase();
                const e = (p.period_end ?? '').toString().toLowerCase();
                return s.includes(term) || e.includes(term);
            });
        }
        // Lọc theo khoảng thời gian có overlap
        const from = fromDate ? new Date(fromDate) : null;
        const to = toDate ? new Date(toDate) : null;
        if (from || to) {
            list = list.filter((p) => {
                const ps = parseDate(p.period_start);
                const pe = parseDate(p.period_end);
                if (!ps || !pe)
                    return false;
                const inFrom = from ? pe >= from : true;
                const inTo = to ? ps <= to : true;
                return inFrom && inTo;
            });
        }
        return list;
    }, [payrolls, q, fromDate, toDate]);
    const sorted = useMemo(() => {
        const arr = [...filtered];
        arr.sort((a, b) => {
            const dir = sortDir === 'asc' ? 1 : -1;
            const av = (() => {
                switch (sortKey) {
                    case 'id':
                        return a.id ?? 0;
                    case 'period_start':
                        return parseDate(a.period_start)?.getTime() ?? 0;
                    case 'period_end':
                        return parseDate(a.period_end)?.getTime() ?? 0;
                    case 'base_salary':
                        return toNumber(a.base_salary);
                    case 'bonus':
                        return toNumber(a.bonus);
                    case 'deductions':
                        return toNumber(a.deductions);
                    case 'net_salary':
                        return toNumber(a.net_salary);
                }
            })();
            const bv = (() => {
                switch (sortKey) {
                    case 'id':
                        return b.id ?? 0;
                    case 'period_start':
                        return parseDate(b.period_start)?.getTime() ?? 0;
                    case 'period_end':
                        return parseDate(b.period_end)?.getTime() ?? 0;
                    case 'base_salary':
                        return toNumber(b.base_salary);
                    case 'bonus':
                        return toNumber(b.bonus);
                    case 'deductions':
                        return toNumber(b.deductions);
                    case 'net_salary':
                        return toNumber(b.net_salary);
                }
            })();
            if (av < bv)
                return -1 * dir;
            if (av > bv)
                return 1 * dir;
            return 0;
        });
        return arr;
    }, [filtered, sortKey, sortDir]);
    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(page, totalPages);
    const pageSlice = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return sorted.slice(start, start + pageSize);
    }, [sorted, currentPage, pageSize]);
    useEffect(() => {
        setPage(1);
    }, [q, fromDate, toDate, pageSize]);
    const sum = (sel) => sorted.reduce((acc, p) => acc + toNumber(sel(p)), 0);
    // Render
    if (loading) {
        return (_jsxs("div", { className: "my-card card", children: [_jsx("div", { className: "my-payroll-header card-header", children: _jsx("div", { className: "d-flex justify-content-between align-items-center my-toolbar", children: _jsxs("div", { children: [_jsxs("h2", { className: "h4 mb-1", children: [_jsx("i", { className: "fas fa-wallet me-2" }), "B\u1EA3ng l\u01B0\u01A1ng c\u1EE7a t\u00F4i"] }), _jsxs("span", { className: "filter-chip", children: [_jsx("i", { className: "fas fa-user" }), " \u0110ang t\u1EA3i d\u1EEF li\u1EC7u\u2026"] })] }) }) }), _jsx("div", { className: "card-body", children: [...Array(6)].map((_, i) => (_jsx("div", { className: "skeleton mb-3" }, i))) })] }));
    }
    if (error)
        return (_jsxs("div", { className: "alert alert-danger", children: [_jsx("i", { className: "fas fa-exclamation-triangle me-2" }), error] }));
    return (_jsxs("div", { className: "container-fluid py-4", children: [_jsxs("div", { className: "my-card card mb-4", children: [_jsx("div", { className: "my-payroll-header card-header", children: _jsxs("div", { className: "d-flex flex-wrap justify-content-between align-items-center gap-2 my-toolbar", children: [_jsxs("div", { children: [_jsxs("h2", { className: "h4 mb-1", children: [_jsx("i", { className: "fas fa-wallet me-2" }), "B\u1EA3ng l\u01B0\u01A1ng c\u1EE7a t\u00F4i"] }), _jsxs("div", { className: "d-flex align-items-center gap-2", children: [_jsxs("span", { className: "filter-chip", children: [_jsx("i", { className: "fas fa-database" }), _jsx("strong", { children: payrolls.length }), " b\u1EA3n ghi"] }), sorted.length !== payrolls.length && (_jsxs("span", { className: "filter-chip text-muted", children: [_jsx("i", { className: "fas fa-filter" }), " Hi\u1EC3n th\u1ECB:", ' ', _jsx("strong", { children: sorted.length })] }))] })] }), _jsx("div", { className: "d-flex flex-wrap gap-2" })] }) }), _jsx("div", { className: "card-body", children: _jsxs("div", { className: "row g-2 input-compact", children: [_jsxs("div", { className: "col-12 col-md-4", children: [_jsx("label", { className: "form-label mb-1", children: "T\u00ECm nhanh theo k\u1EF3 (v\u00ED d\u1EE5: 2025-08)" }), _jsxs("div", { className: "input-group", children: [_jsx("span", { className: "input-group-text", children: _jsx("i", { className: "fas fa-search" }) }), _jsx("input", { className: "form-control", placeholder: "2025-08 ho\u1EB7c nh\u1EADp chu\u1ED7i b\u1EA5t k\u1EF3 kh\u1EDBp ng\u00E0y", value: q, onChange: (e) => setQ(e.target.value) })] })] }), _jsxs("div", { className: "col-6 col-md-3", children: [_jsx("label", { className: "form-label mb-1", children: "T\u1EEB ng\u00E0y" }), _jsx("input", { type: "date", className: "form-control", value: fromDate, onChange: (e) => setFromDate(e.target.value) })] }), _jsxs("div", { className: "col-6 col-md-3", children: [_jsx("label", { className: "form-label mb-1", children: "\u0110\u1EBFn ng\u00E0y" }), _jsx("input", { type: "date", className: "form-control", value: toDate, onChange: (e) => setToDate(e.target.value) })] }), _jsxs("div", { className: "col-12 col-md-2", children: [_jsx("label", { className: "form-label mb-1", children: "K\u00EDch th\u01B0\u1EDBc trang" }), _jsx("select", { className: "form-select", value: pageSize, onChange: (e) => setPageSize(Number(e.target.value)), children: PAGE_SIZES.map((sz) => (_jsxs("option", { value: sz, children: [sz, " / trang"] }, sz))) })] })] }) })] }), _jsxs("div", { className: "my-card card", children: [_jsxs("div", { className: "card-header bg-white d-flex justify-content-between align-items-center", children: [_jsxs("h5", { className: "mb-0", children: [_jsx("i", { className: "fas fa-table me-2" }), "Danh s\u00E1ch", _jsx("span", { className: "badge badge-soft ms-2", children: sorted.length })] }), _jsxs("div", { className: "small text-muted", children: ["Trang ", _jsx("strong", { children: currentPage }), "/", _jsx("strong", { children: Math.max(1, Math.ceil(sorted.length / pageSize)) })] })] }), sorted.length === 0 ? (_jsxs("div", { className: "empty-wrap", children: [_jsx("i", { className: "fas fa-inbox fa-3x mb-3" }), _jsx("h5", { className: "mb-1", children: "Ch\u01B0a c\u00F3 b\u1EA3ng l\u01B0\u01A1ng" }), _jsx("div", { children: "H\u00E3y ki\u1EC3m tra l\u1EA1i b\u1ED9 l\u1ECDc ho\u1EB7c \u0111\u1EE3i HR ph\u00E1t h\u00E0nh k\u1EF3 l\u01B0\u01A1ng m\u1EDBi." })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "table-responsive", children: _jsxs("table", { className: "table table-hover align-middle mb-0", children: [_jsx("thead", { className: "table-light", children: _jsxs("tr", { children: [_jsxs("th", { className: "text-center sortable", onClick: () => toggleSort('id'), children: [_jsx("i", { className: "fas fa-hashtag me-1" }), "ID", ' ', sortKey === 'id' && (sortDir === 'asc' ? '▲' : '▼')] }), _jsxs("th", { className: "text-center sortable", onClick: () => toggleSort('period_start'), children: [_jsx("i", { className: "fas fa-calendar-plus me-1" }), "B\u1EAFt \u0111\u1EA7u", ' ', sortKey === 'period_start' &&
                                                                (sortDir === 'asc' ? '▲' : '▼')] }), _jsxs("th", { className: "text-center sortable", onClick: () => toggleSort('period_end'), children: [_jsx("i", { className: "fas fa-calendar-check me-1" }), "K\u1EBFt th\u00FAc", ' ', sortKey === 'period_end' &&
                                                                (sortDir === 'asc' ? '▲' : '▼')] }), _jsxs("th", { className: "text-end sortable", onClick: () => toggleSort('base_salary'), children: [_jsx("i", { className: "fas fa-sack-dollar me-1" }), "L\u01B0\u01A1ng c\u01A1 b\u1EA3n", ' ', sortKey === 'base_salary' &&
                                                                (sortDir === 'asc' ? '▲' : '▼')] }), _jsxs("th", { className: "text-end sortable", onClick: () => toggleSort('bonus'), children: [_jsx("i", { className: "fas fa-gift me-1" }), "Th\u01B0\u1EDFng", ' ', sortKey === 'bonus' && (sortDir === 'asc' ? '▲' : '▼')] }), _jsxs("th", { className: "text-end sortable", onClick: () => toggleSort('deductions'), children: [_jsx("i", { className: "fas fa-minus-circle me-1" }), "Tr\u1EEB", ' ', sortKey === 'deductions' &&
                                                                (sortDir === 'asc' ? '▲' : '▼')] }), _jsxs("th", { className: "text-end sortable", onClick: () => toggleSort('net_salary'), children: [_jsx("i", { className: "fas fa-money-bill-wave me-1" }), "Th\u1EF1c nh\u1EADn", ' ', sortKey === 'net_salary' &&
                                                                (sortDir === 'asc' ? '▲' : '▼')] })] }) }), _jsx("tbody", { children: pageSlice.map((p) => (_jsxs("tr", { children: [_jsx("td", { className: "text-center", children: _jsx("span", { className: "badge text-bg-secondary", children: p.id ?? '—' }) }), _jsx("td", { className: "text-center", children: p.period_start ?? '—' }), _jsx("td", { className: "text-center", children: p.period_end ?? '—' }), _jsx("td", { className: "text-end", children: _jsx("span", { className: "text-info fw-semibold", children: formatCurrency(p.base_salary) }) }), _jsx("td", { className: "text-end", children: _jsx("span", { className: "text-success fw-semibold", children: toNumber(p.bonus) > 0
                                                                ? `+${formatCurrency(p.bonus)}`
                                                                : '—' }) }), _jsx("td", { className: "text-end", children: _jsx("span", { className: "text-danger fw-semibold", children: toNumber(p.deductions) > 0
                                                                ? `-${formatCurrency(p.deductions)}`
                                                                : '—' }) }), _jsx("td", { className: "text-end", children: _jsx("span", { className: "text-primary fw-bold", children: formatCurrency(p.net_salary) }) })] }, p.id ??
                                                `${p.period_start}-${p.period_end}-${Math.random()}`))) })] }) }), _jsxs("div", { className: "card-footer bg-white d-flex flex-wrap justify-content-between align-items-center gap-2", children: [_jsxs("div", { className: "text-muted small", children: ["Hi\u1EC3n th\u1ECB", ' ', _jsxs("strong", { children: [(currentPage - 1) * pageSize + 1, "-", Math.min(currentPage * pageSize, sorted.length)] }), ' ', "trong ", _jsx("strong", { children: sorted.length }), " m\u1EE5c"] }), _jsxs("div", { className: "btn-group", children: [_jsx("button", { className: "btn btn-outline-secondary btn-sm", onClick: () => setPage(1), disabled: currentPage === 1, children: "\u00AB \u0110\u1EA7u" }), _jsx("button", { className: "btn btn-outline-secondary btn-sm", onClick: () => setPage((p) => Math.max(1, p - 1)), disabled: currentPage === 1, children: "\u2039 Tr\u01B0\u1EDBc" }), _jsx("button", { className: "btn btn-outline-secondary btn-sm", onClick: () => setPage((p) => Math.min(totalPages, p + 1)), disabled: currentPage === totalPages, children: "Sau \u203A" }), _jsx("button", { className: "btn btn-outline-secondary btn-sm", onClick: () => setPage(totalPages), disabled: currentPage === totalPages, children: "Cu\u1ED1i \u00BB" })] })] })] }))] }), sorted.length > 0 && (_jsxs("div", { className: "row g-3 mt-3", children: [_jsx("div", { className: "col-12 col-md-3", children: _jsxs("div", { className: "stat-card p-3 h-100", children: [_jsx("div", { className: "text-muted small", children: "S\u1ED1 k\u1EF3 l\u01B0\u01A1ng hi\u1EC3n th\u1ECB" }), _jsx("div", { className: "fs-4 fw-bold text-primary", children: sorted.length })] }) }), _jsx("div", { className: "col-12 col-md-3", children: _jsxs("div", { className: "stat-card p-3 h-100", children: [_jsx("div", { className: "text-muted small", children: "T\u1ED5ng l\u01B0\u01A1ng c\u01A1 b\u1EA3n" }), _jsx("div", { className: "fs-5 fw-semibold text-success", children: formatCurrency(sum((p) => p.base_salary)) })] }) }), _jsx("div", { className: "col-12 col-md-3", children: _jsxs("div", { className: "stat-card p-3 h-100", children: [_jsx("div", { className: "text-muted small", children: "T\u1ED5ng th\u01B0\u1EDFng" }), _jsx("div", { className: "fs-5 fw-semibold text-info", children: formatCurrency(sum((p) => p.bonus)) })] }) }), _jsx("div", { className: "col-12 col-md-3", children: _jsxs("div", { className: "stat-card p-3 h-100", children: [_jsx("div", { className: "text-muted small", children: "T\u1ED5ng th\u1EF1c nh\u1EADn" }), _jsx("div", { className: "fs-5 fw-bold text-dark", children: formatCurrency(sum((p) => p.net_salary)) })] }) })] }))] }));
};
export default MyPayrollList;
