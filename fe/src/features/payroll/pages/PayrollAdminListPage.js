import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { getJSON, delJSON } from '../../../lib/http';
import PayrollForm from '../components/PayrollAdminForm';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import '../../../../public/css/payroll/PayrollList.css';
const PAGE_SIZES = [10, 20, 50, 100];
const toNumber = (val) => {
    if (val === null || val === undefined)
        return 0;
    if (typeof val === 'number')
        return Number.isFinite(val) ? val : 0;
    const n = Number(String(val).replace(/[, ]/g, ''));
    return Number.isFinite(n) ? n : 0;
};
const PayrollList = () => {
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingPayroll, setEditingPayroll] = useState(null);
    const [q, setQ] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [sortKey, setSortKey] = useState('id');
    const [sortDir, setSortDir] = useState('desc');
    const [pageSize, setPageSize] = useState(20);
    const [page, setPage] = useState(1);
    useEffect(() => {
        fetchPayrolls();
    }, []);
    const fetchPayrolls = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getJSON('/payroll/admin');
            setPayrolls(Array.isArray(data) ? data : []);
        }
        catch (err) {
            setError(err?.message || 'Lỗi không xác định');
        }
        finally {
            setLoading(false);
        }
    };
    const handleDelete = async (id) => {
        if (!id)
            return;
        if (!window.confirm('Bạn có chắc muốn xóa bảng lương này không?'))
            return;
        try {
            await delJSON(`/payroll/admin/${id}`);
            setPayrolls((prev) => prev.filter((p) => p.id !== id));
            setPage(1); // Reset to first page after deletion
        }
        catch (err) {
            alert(err?.message || 'Xóa thất bại');
        }
    };
    const formatCurrency = (amount) => {
        const safe = toNumber(amount ?? 0);
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(safe);
    };
    const parseDate = (s) => (s ? new Date(s) : null);
    const toggleSort = (key) => {
        if (sortKey === key) {
            setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        }
        else {
            setSortKey(key);
            setSortDir('asc');
        }
        setPage(1); // Reset to first page on sort change
    };
    const filtered = useMemo(() => {
        let list = [...payrolls];
        if (q.trim()) {
            const term = q.trim().toLowerCase();
            list = list.filter((p) => {
                const name = p.employee?.full_name?.toLowerCase() || '';
                const idStr = (p.employee_id ?? '').toString();
                return name.includes(term) || idStr.includes(term);
            });
        }
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
        const list = [...filtered];
        list.sort((a, b) => {
            const dir = sortDir === 'asc' ? 1 : -1;
            const av = (() => {
                switch (sortKey) {
                    case 'id':
                        return a.id ?? 0;
                    case 'employee':
                        return a.employee?.full_name?.toLowerCase() ?? '';
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
                    default:
                        return 0;
                }
            })();
            const bv = (() => {
                switch (sortKey) {
                    case 'id':
                        return b.id ?? 0;
                    case 'employee':
                        return b.employee?.full_name?.toLowerCase() ?? '';
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
                    default:
                        return 0;
                }
            })();
            if (av < bv)
                return -1 * dir;
            if (av > bv)
                return 1 * dir;
            return 0;
        });
        return list;
    }, [filtered, sortKey, sortDir]);
    const totalItems = sorted.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const currentPage = Math.min(page, totalPages);
    const pageSlice = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return sorted.slice(start, start + pageSize);
    }, [sorted, currentPage, pageSize]);
    useEffect(() => {
        setPage(1);
    }, [q, fromDate, toDate, pageSize]);
    const exportToExcel = () => {
        if (!sorted.length)
            return;
        const worksheetData = sorted.map((p) => ({
            ID: p.id ?? '',
            Nhan_vien: p.employee?.full_name || '',
            Ngay_bat_dau: p.period_start ?? '',
            Ngay_ket_thuc: p.period_end ?? '',
            Luong_co_ban: toNumber(p.base_salary),
            Thuong: toNumber(p.bonus),
            Khoan_tru: toNumber(p.deductions),
            Luong_thuc_nhan: toNumber(p.net_salary),
        }));
        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Payrolls');
        const excelBuffer = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'array',
        });
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(blob, 'Payrolls.xlsx');
    };
    const sum = (sel) => filtered.reduce((acc, p) => acc + toNumber(sel(p)), 0);
    return (_jsxs("div", { className: "container-fluid py-4", children: [_jsxs("div", { className: "payroll-card card mb-4", children: [_jsx("div", { className: "card-header payroll-gradient-header", children: _jsxs("div", { className: "d-flex flex-wrap justify-content-between align-items-center gap-2 payroll-toolbar", children: [_jsxs("div", { children: [_jsxs("h2", { className: "h4 mb-1", style: { color: '#000000' }, children: [_jsx("i", { className: "fas fa-money-check-alt me-2" }), "Qu\u1EA3n l\u00FD b\u1EA3ng l\u01B0\u01A1ng"] }), _jsxs("div", { className: "d-flex align-items-center gap-2", children: [_jsxs("span", { className: "filter-chip", children: [_jsx("i", { className: "fas fa-database" }), _jsx("strong", { children: payrolls.length }), " b\u1EA3n ghi"] }), filtered.length !== payrolls.length && (_jsxs("span", { className: "filter-chip", children: [_jsx("i", { className: "fas fa-filter" }), "\u0110ang l\u1ECDc: ", _jsx("strong", { children: filtered.length })] }))] })] }), _jsxs("div", { className: "d-flex flex-wrap gap-2", children: [_jsxs("button", { className: "btn btn-dark btn-sm", onClick: exportToExcel, disabled: !sorted.length, title: "Xu\u1EA5t to\u00E0n b\u1ED9 danh s\u00E1ch \u0111ang hi\u1EC3n th\u1ECB (\u0111\u00E3 l\u1ECDc/s\u1EAFp x\u1EBFp)", children: [_jsx("i", { className: "fas fa-file-excel me-2" }), " Xu\u1EA5t Excel"] }), _jsxs("button", { className: "btn btn-dark btn-sm", onClick: fetchPayrolls, children: [_jsx("i", { className: "fas fa-rotate me-2" }), " T\u1EA3i l\u1EA1i"] }), !editingPayroll && (_jsxs("button", { className: "btn btn-dark btn-sm", onClick: () => setEditingPayroll({
                                                employee_id: 0,
                                                base_salary: 0,
                                                bonus: 0,
                                                deductions: 0,
                                                net_salary: 0,
                                                period_start: null,
                                                period_end: null,
                                            }), children: [_jsx("i", { className: "fas fa-plus me-2" }), " T\u1EA1o m\u1EDBi"] }))] })] }) }), _jsx("div", { className: "card-body", children: _jsxs("div", { className: "row g-2 input-compact", children: [_jsxs("div", { className: "col-12 col-md-4", children: [_jsx("label", { className: "form-label mb-1", children: "T\u00ECm ki\u1EBFm" }), _jsxs("div", { className: "input-group", children: [_jsx("span", { className: "input-group-text", children: _jsx("i", { className: "fas fa-search" }) }), _jsx("input", { className: "form-control", placeholder: "T\u00EAn nh\u00E2n vi\u00EAn ho\u1EB7c ID", value: q, onChange: (e) => setQ(e.target.value) })] })] }), _jsxs("div", { className: "col-6 col-md-3", children: [_jsx("label", { className: "form-label mb-1", children: "T\u1EEB ng\u00E0y" }), _jsx("input", { type: "date", className: "form-control", value: fromDate, onChange: (e) => setFromDate(e.target.value) })] }), _jsxs("div", { className: "col-6 col-md-3", children: [_jsx("label", { className: "form-label mb-1", children: "\u0110\u1EBFn ng\u00E0y" }), _jsx("input", { type: "date", className: "form-control", value: toDate, onChange: (e) => setToDate(e.target.value) })] }), _jsxs("div", { className: "col-12 col-md-2", children: [_jsx("label", { className: "form-label mb-1", children: "K\u00EDch th\u01B0\u1EDBc trang" }), _jsx("select", { className: "form-select", value: pageSize, onChange: (e) => setPageSize(Number(e.target.value)), children: PAGE_SIZES.map((s) => (_jsxs("option", { value: s, children: [s, " / trang"] }, s))) })] })] }) })] }), editingPayroll && (_jsxs("div", { className: "payroll-card card mb-4", children: [_jsxs("div", { className: "card-header bg-light d-flex align-items-center", children: [_jsx("i", { className: "fas fa-edit me-2 text-primary" }), _jsx("h5", { className: "mb-0", children: editingPayroll.id
                                    ? 'Chỉnh sửa bảng lương'
                                    : 'Tạo bảng lương mới' })] }), _jsx("div", { className: "card-body", children: _jsx(PayrollForm, { payroll: editingPayroll, onSuccess: () => {
                                setEditingPayroll(null);
                                fetchPayrolls();
                            }, onCancel: () => setEditingPayroll(null) }) })] })), loading && (_jsx("div", { className: "payroll-card card", children: _jsxs("div", { className: "card-body text-center py-5", children: [_jsx("div", { className: "spinner-border text-primary", role: "status" }), _jsx("p", { className: "mt-3", children: "\u0110ang t\u1EA3i danh s\u00E1ch b\u1EA3ng l\u01B0\u01A1ng..." })] }) })), !loading && error && (_jsxs("div", { className: "alert alert-danger", children: [_jsx("i", { className: "fas fa-exclamation-triangle me-2" }), _jsx("strong", { children: "L\u1ED7i:" }), " ", error] })), !loading && !error && (_jsxs("div", { className: "payroll-card card", children: [_jsxs("div", { className: "card-header bg-white d-flex justify-content-between align-items-center", children: [_jsxs("h5", { className: "mb-0", children: [_jsx("i", { className: "fas fa-table me-2" }), "Danh s\u00E1ch b\u1EA3ng l\u01B0\u01A1ng", _jsx("span", { className: "badge badge-soft ms-2", children: filtered.length })] }), _jsxs("div", { className: "small", children: ["Trang ", _jsx("strong", { children: currentPage }), "/", _jsx("strong", { children: totalPages })] })] }), filtered.length === 0 ? (_jsxs("div", { className: "payroll-empty text-center", children: [_jsx("i", { className: "fas fa-inbox fa-3x mb-3" }), _jsx("h5", { className: "mb-1", children: "Kh\u00F4ng c\u00F3 d\u1EEF li\u1EC7u" }), _jsx("div", { children: "H\u00E3y th\u1EED b\u1ECF l\u1ECDc ho\u1EB7c t\u1EA1o m\u1EDBi m\u1ED9t b\u1EA3ng l\u01B0\u01A1ng." })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "table-responsive", children: _jsxs("table", { className: "table table-hover align-middle mb-0", children: [_jsx("thead", { className: "table-light", children: _jsxs("tr", { children: [_jsxs("th", { className: "text-center sortable", onClick: () => toggleSort('id'), children: [_jsx("i", { className: "fas fa-hashtag me-1" }), "ID", ' ', sortKey === 'id' && (sortDir === 'asc' ? '▲' : '▼')] }), _jsxs("th", { className: "sortable", onClick: () => toggleSort('employee'), children: [_jsx("i", { className: "fas fa-user me-1" }), "Nh\u00E2n vi\u00EAn", ' ', sortKey === 'employee' &&
                                                                (sortDir === 'asc' ? '▲' : '▼')] }), _jsxs("th", { className: "text-center", children: [_jsx("i", { className: "fas fa-calendar-alt me-1" }), "K\u1EF3 l\u01B0\u01A1ng"] }), _jsxs("th", { className: "text-end sortable", onClick: () => toggleSort('base_salary'), children: [_jsx("i", { className: "fas fa-sack-dollar me-1" }), "L\u01B0\u01A1ng c\u01A1 b\u1EA3n", ' ', sortKey === 'base_salary' &&
                                                                (sortDir === 'asc' ? '▲' : '▼')] }), _jsxs("th", { className: "text-end sortable", onClick: () => toggleSort('bonus'), children: [_jsx("i", { className: "fas fa-gift me-1" }), "Th\u01B0\u1EDFng", ' ', sortKey === 'bonus' && (sortDir === 'asc' ? '▲' : '▼')] }), _jsxs("th", { className: "text-end sortable", onClick: () => toggleSort('deductions'), children: [_jsx("i", { className: "fas fa-minus-circle me-1" }), "Tr\u1EEB", ' ', sortKey === 'deductions' &&
                                                                (sortDir === 'asc' ? '▲' : '▼')] }), _jsxs("th", { className: "text-end sortable", onClick: () => toggleSort('net_salary'), children: [_jsx("i", { className: "fas fa-money-bill-wave me-1" }), "Th\u1EF1c nh\u1EADn", ' ', sortKey === 'net_salary' &&
                                                                (sortDir === 'asc' ? '▲' : '▼')] }), _jsxs("th", { className: "text-center sticky-actions", children: [_jsx("i", { className: "fas fa-cogs me-1" }), "Thao t\u00E1c"] })] }) }), _jsx("tbody", { children: pageSlice.map((p) => (_jsxs("tr", { children: [_jsx("td", { className: "text-center", children: _jsx("span", { className: "badge text-bg-secondary", children: p.id ?? '—' }) }), _jsx("td", { children: _jsxs("div", { className: "d-flex align-items-center", children: [_jsx("span", { className: "avatar-pill me-2", style: { background: '#4e73df' }, title: p.employee?.full_name || 'N/A', children: (p.employee?.full_name || 'N/A')
                                                                        .charAt(0)
                                                                        .toUpperCase() }), _jsxs("div", { children: [_jsx("div", { className: "fw-semibold", children: p.employee?.full_name || 'N/A' }), _jsxs("div", { className: "small", children: ["ID NV: ", p.employee_id ?? '—'] })] })] }) }), _jsxs("td", { className: "text-center", children: [_jsx("div", { className: "fw-medium", children: p.period_start ?? '—' }), _jsxs("div", { className: "small", children: ["\u0111\u1EBFn ", p.period_end ?? '—'] })] }), _jsx("td", { className: "text-end", children: _jsx("span", { className: "text-info fw-semibold", children: formatCurrency(p.base_salary) }) }), _jsx("td", { className: "text-end", children: _jsx("span", { className: "text-success fw-semibold", children: toNumber(p.bonus) > 0
                                                                ? `+${formatCurrency(p.bonus)}`
                                                                : '—' }) }), _jsx("td", { className: "text-end", children: _jsx("span", { className: "text-danger fw-semibold", children: toNumber(p.deductions) > 0
                                                                ? `-${formatCurrency(p.deductions)}`
                                                                : '—' }) }), _jsx("td", { className: "text-end", children: _jsx("span", { className: "text-primary fw-bold", children: formatCurrency(p.net_salary) }) }), _jsx("td", { className: "text-center", children: _jsxs("div", { className: "btn-group", children: [_jsx("button", { className: "btn btn-outline-primary btn-sm", onClick: () => setEditingPayroll(p), title: "Ch\u1EC9nh s\u1EEDa", children: _jsx("i", { className: "fas fa-edit" }) }), _jsx("button", { className: "btn btn-outline-danger btn-sm", onClick: () => handleDelete(p.id), title: "X\u00F3a", children: _jsx("i", { className: "fas fa-trash" }) })] }) })] }, p.id ?? Math.random()))) })] }) }), _jsxs("div", { className: "card-footer bg-white d-flex flex-wrap justify-content-between align-items-center gap-2", children: [_jsxs("div", { className: "small", children: ["Hi\u1EC3n th\u1ECB", ' ', _jsxs("strong", { children: [(currentPage - 1) * pageSize + 1, "-", Math.min(currentPage * pageSize, totalItems)] }), ' ', "trong ", _jsx("strong", { children: totalItems }), " m\u1EE5c"] }), _jsxs("div", { className: "btn-group", children: [_jsx("button", { className: "btn btn-outline-secondary btn-sm", onClick: () => setPage(1), disabled: currentPage === 1, children: "\u00AB \u0110\u1EA7u" }), _jsx("button", { className: "btn btn-outline-secondary btn-sm", onClick: () => setPage((p) => Math.max(1, p - 1)), disabled: currentPage === 1, children: "\u2039 Tr\u01B0\u1EDBc" }), _jsx("button", { className: "btn btn-outline-secondary btn-sm", onClick: () => setPage((p) => Math.min(totalPages, p + 1)), disabled: currentPage === totalPages, children: "Sau \u203A" }), _jsx("button", { className: "btn btn-outline-secondary btn-sm", onClick: () => setPage(totalPages), disabled: currentPage === totalPages, children: "Cu\u1ED1i \u00BB" })] })] })] }))] })), !loading && !error && filtered.length > 0 && (_jsxs("div", { className: "row g-3 mt-3", children: [_jsx("div", { className: "col-12 col-md-3", children: _jsxs("div", { className: "stat-card p-3 h-100", children: [_jsx("div", { className: "small", children: "T\u1ED5ng b\u1EA3ng l\u01B0\u01A1ng" }), _jsx("div", { className: "fs-4 fw-bold text-primary", children: filtered.length })] }) }), _jsx("div", { className: "col-12 col-md-3", children: _jsxs("div", { className: "stat-card p-3 h-100", children: [_jsx("div", { className: "small", children: "T\u1ED5ng l\u01B0\u01A1ng c\u01A1 b\u1EA3n" }), _jsx("div", { className: "fs-5 fw-semibold text-success", children: formatCurrency(sum((p) => p.base_salary)) })] }) }), _jsx("div", { className: "col-12 col-md-3", children: _jsxs("div", { className: "stat-card p-3 h-100", children: [_jsx("div", { className: "small", children: "T\u1ED5ng th\u01B0\u1EDFng" }), _jsx("div", { className: "fs-5 fw-semibold text-info", children: formatCurrency(sum((p) => p.bonus)) })] }) }), _jsx("div", { className: "col-12 col-md-3", children: _jsxs("div", { className: "stat-card p-3 h-100", children: [_jsx("div", { className: "small", children: "T\u1ED5ng th\u1EF1c nh\u1EADn" }), _jsx("div", { className: "fs-5 fw-bold text-dark", children: formatCurrency(sum((p) => p.net_salary)) })] }) })] }))] }));
};
export default PayrollList;
