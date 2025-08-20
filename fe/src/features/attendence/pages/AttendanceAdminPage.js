import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getJSON, postJSON, patchJSON, delJSON, buildQuery, } from '../../../lib/http';
import '../../../../public/css/attendance/AttendanceAdminPage.css';
const fmtDT = (s) => s
    ? new Date(s).toLocaleString('vi-VN', {
        dateStyle: 'short',
        timeStyle: 'short',
    })
    : '—';
const fmtDate = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};
const toDateInputValue = (d) => fmtDate(d);
const toMonth = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const toInputDateTimeLocal = (iso) => {
    if (!iso)
        return '';
    const dt = new Date(iso);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    const hh = String(dt.getHours()).padStart(2, '0');
    const mm = String(dt.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${d}T${hh}:${mm}`;
};
export default function AttendanceAdminPage() {
    // filters
    const [employeeId, setEmployeeId] = useState('');
    const [month, setMonth] = useState(toMonth());
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    // data
    const [rows, setRows] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [sum, setSum] = useState(null);
    const [err, setErr] = useState('');
    // employees for select
    const [emps, setEmps] = useState([]);
    const [loading, setLoading] = useState(false);
    // form state
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [editEmp, setEditEmp] = useState('');
    const [editDate, setEditDate] = useState(toDateInputValue(new Date()));
    const [editIn, setEditIn] = useState('');
    const [editOut, setEditOut] = useState('');
    const canSave = useMemo(() => !!editEmp && !!editDate, [editEmp, editDate]);
    async function loadEmployees() {
        try {
            const res = await getJSON(`/employees${buildQuery({
                page: 1,
                pageSize: 500,
                status: 'active',
            })}`);
            setEmps(res.items || []);
        }
        catch (e) {
            console.error(e);
        }
    }
    async function loadList(p = page) {
        setLoading(true);
        setErr('');
        try {
            const params = buildQuery({
                page: p,
                pageSize,
                month: month || undefined,
                from: from || undefined,
                to: to || undefined,
                employeeId: employeeId || undefined,
                _t: Date.now(),
            });
            const res = await getJSON(`/attendance/admin${params}`);
            setRows(res.data);
            setTotalPages(res.pagination.totalPages);
            setPage(res.pagination.page);
        }
        catch (e) {
            setErr(e?.message || 'Không tải được danh sách chấm công');
            setRows([]);
        }
        finally {
            setLoading(false);
        }
    }
    async function loadSummary() {
        try {
            const params = buildQuery({
                month: month || undefined,
                from: from || undefined,
                to: to || undefined,
                employeeId: employeeId || undefined,
                _t: Date.now(),
            });
            const res = await getJSON(`/attendance/admin/summary${params}`);
            setSum(res);
        }
        catch {
            setSum(null);
        }
    }
    useEffect(() => {
        loadEmployees();
    }, []);
    useEffect(() => {
        loadList(1);
        loadSummary();
    }, [month]);
    const onSearch = (e) => {
        e.preventDefault();
        loadList(1);
        loadSummary();
    };
    const openCreate = () => {
        setFormOpen(true);
        setEditing(null);
        setEditEmp(employeeId || '');
        setEditDate(toDateInputValue(new Date()));
        setEditIn('');
        setEditOut('');
    };
    const openEdit = (r) => {
        setFormOpen(true);
        setEditing(r);
        setEditEmp(r.employee_id);
        setEditDate(r.work_date);
        setEditIn(toInputDateTimeLocal(r.check_in ?? null));
        setEditOut(toInputDateTimeLocal(r.check_out ?? null));
    };
    const closeForm = () => {
        setFormOpen(false);
        setEditing(null);
        setEditEmp('');
        setEditDate(toDateInputValue(new Date()));
        setEditIn('');
        setEditOut('');
    };
    const clearIn = () => setEditIn('');
    const clearOut = () => setEditOut('');
    const onSave = async (e) => {
        e.preventDefault();
        if (!canSave)
            return;
        try {
            const payload = {
                employee_id: Number(editEmp),
                work_date: editDate,
                check_in: editIn ? new Date(editIn).toISOString() : null,
                check_out: editOut ? new Date(editOut).toISOString() : null,
            };
            if (editing) {
                await patchJSON(`/attendance/admin/${editing.id}`, payload);
            }
            else {
                await postJSON(`/attendance/admin`, payload);
            }
            closeForm();
            await Promise.all([loadList(page), loadSummary()]);
            alert('Đã lưu bản ghi chấm công');
        }
        catch (e) {
            alert(e?.message || 'Lưu thất bại');
        }
    };
    const onDelete = async (id) => {
        if (!confirm('Xoá bản ghi chấm công này?'))
            return;
        try {
            await delJSON(`/attendance/admin/${id}`);
            const nextPage = rows.length === 1 && page > 1 ? page - 1 : page;
            await Promise.all([loadList(nextPage), loadSummary()]);
        }
        catch (e) {
            alert(e?.message || 'Xoá thất bại');
        }
    };
    return (_jsx("div", { className: "attendance container py-5", children: _jsxs("div", { className: "attendance card shadow-lg border-0", children: [_jsx("div", { className: "attendance card-header", children: _jsxs("div", { className: "attendance d-flex align-items-center justify-content-between flex-wrap", children: [_jsx("h1", { className: "attendance h3 fw-bold mb-0", children: "Qu\u1EA3n l\u00FD ch\u1EA5m c\u00F4ng" }), _jsxs("div", { className: "attendance d-flex gap-2", children: [_jsxs(Link, { to: "/", className: "attendance btn btn-outline-warning btn-sm d-flex align-items-center gap-2", children: [_jsx("svg", { className: "attendance bi", width: "16", height: "16", fill: "currentColor", viewBox: "0 0 16 16", children: _jsx("path", { fillRule: "evenodd", d: "M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" }) }), "Quay v\u1EC1"] }), _jsxs("button", { onClick: openCreate, className: "attendance btn btn-success d-flex align-items-center gap-2", children: [_jsx("svg", { className: "attendance bi", width: "16", height: "16", fill: "currentColor", viewBox: "0 0 16 16", children: _jsx("path", { d: "M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" }) }), "Th\u00EAm b\u1EA3n ghi"] })] })] }) }), _jsxs("div", { className: "attendance card-body", children: [err && (_jsxs("div", { className: "attendance alert alert-danger d-flex align-items-center gap-2 mb-4", role: "alert", children: [_jsxs("svg", { className: "attendance bi flex-shrink-0", width: "16", height: "16", fill: "currentColor", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2", children: [_jsx("path", { d: "M12 9v4" }), _jsx("path", { d: "M12 17h.01" }), _jsx("path", { d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" })] }), _jsx("span", { children: err })] })), _jsx("div", { className: "attendance card border-0 mb-4", children: _jsxs("div", { className: "attendance card-body", children: [_jsx("h2", { className: "attendance h5 fw-semibold mb-3", children: "B\u1ED9 l\u1ECDc" }), _jsxs("form", { onSubmit: onSearch, className: "attendance row g-3", children: [_jsxs("div", { className: "attendance col-sm-5", children: [_jsx("label", { className: "attendance form-label text-dark fw-semibold", children: "Nh\u00E2n vi\u00EAn" }), _jsxs("select", { className: "attendance form-select", value: employeeId, onChange: (e) => setEmployeeId(e.target.value ? Number(e.target.value) : ''), children: [_jsx("option", { value: "", children: "\u2014 T\u1EA5t c\u1EA3 \u2014" }), emps.map((emp) => (_jsxs("option", { value: emp.id, children: [emp.full_name, " ", emp.email ? `(${emp.email})` : ''] }, emp.id)))] })] }), _jsxs("div", { className: "attendance col-sm-3", children: [_jsx("label", { className: "attendance form-label text-dark fw-semibold", children: "Th\u00E1ng" }), _jsx("input", { type: "month", className: "attendance form-control", value: month, onChange: (e) => setMonth(e.target.value) })] }), _jsxs("div", { className: "attendance col-sm-2", children: [_jsx("label", { className: "attendance form-label text-dark fw-semibold", children: "T\u1EEB ng\u00E0y" }), _jsx("input", { type: "date", className: "attendance form-control", value: from, onChange: (e) => setFrom(e.target.value) })] }), _jsxs("div", { className: "attendance col-sm-2", children: [_jsx("label", { className: "attendance form-label text-dark fw-semibold", children: "\u0110\u1EBFn ng\u00E0y" }), _jsx("input", { type: "date", className: "attendance form-control", value: to, onChange: (e) => setTo(e.target.value) })] }), _jsxs("div", { className: "attendance col-sm-12 d-flex gap-2", children: [_jsxs("button", { type: "submit", className: "attendance btn btn-primary d-flex align-items-center gap-2 flex-grow-1", children: [_jsx("svg", { className: "attendance bi", width: "16", height: "16", fill: "currentColor", viewBox: "0 0 16 16", children: _jsx("path", { d: "M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" }) }), "L\u1ECDc"] }), _jsxs("button", { type: "button", className: "attendance btn btn-outline-secondary d-flex align-items-center gap-2 flex-grow-1", onClick: () => {
                                                            setEmployeeId('');
                                                            setFrom('');
                                                            setTo('');
                                                            setMonth(toMonth());
                                                            setPage(1);
                                                            loadList(1);
                                                            loadSummary();
                                                        }, children: [_jsx("svg", { className: "attendance bi", width: "16", height: "16", fill: "currentColor", viewBox: "0 0 16 16", children: _jsx("path", { fillRule: "evenodd", d: "M10.354 6.354a.5.5 0 0 0-.708-.708L8 7.293 6.354 5.646a.5.5 0 0 0-.708.708L7.293 8l-1.647 1.646a.5.5 0 0 0 .708.708L8 8.707l1.646 1.647a.5.5 0 0 0 .708-.708L8.707 8l1.647-1.646z" }) }), "\u0110\u1EB7t l\u1EA1i"] })] })] })] }) }), _jsx("div", { className: "attendance card border-0 mb-4", children: _jsxs("div", { className: "attendance card-body", children: [_jsx("h2", { className: "attendance h5 fw-semibold mb-3", children: "T\u1ED5ng h\u1EE3p" }), sum ? (_jsxs("div", { className: "attendance row g-3", children: [_jsx("div", { className: "attendance col-sm-4", children: _jsx("div", { className: "attendance card border-0 hrm-badge-0 text-white", children: _jsxs("div", { className: "attendance card-body", children: [_jsx("div", { className: "attendance text-sm", children: "S\u1ED1 ng\u00E0y c\u00F3 m\u1EB7t" }), _jsx("div", { className: "attendance h4 fw-bold mb-0", children: sum.daysPresent })] }) }) }), _jsx("div", { className: "attendance col-sm-4", children: _jsx("div", { className: "attendance card border-0 hrm-badge-1 text-white", children: _jsxs("div", { className: "attendance card-body", children: [_jsx("div", { className: "attendance text-sm", children: "Ng\u00E0y \u0111\u1EE7 c\u00F4ng (in/out)" }), _jsx("div", { className: "attendance h4 fw-bold mb-0", children: sum.daysCompleted })] }) }) }), _jsx("div", { className: "attendance col-sm-4", children: _jsx("div", { className: "attendance card border-0 hrm-badge-2 text-white", children: _jsxs("div", { className: "attendance card-body", children: [_jsx("div", { className: "attendance text-sm", children: "T\u1ED5ng gi\u1EDD (\u01B0\u1EDBc t\u00EDnh)" }), _jsx("div", { className: "attendance h4 fw-bold mb-0", children: sum.totalHours })] }) }) })] })) : (_jsx("div", { className: "attendance text-sm text-muted", children: "Kh\u00F4ng c\u00F3 d\u1EEF li\u1EC7u t\u1ED5ng h\u1EE3p." }))] }) }), formOpen && (_jsx("div", { className: "attendance card border-0 mb-4", children: _jsxs("div", { className: "attendance card-body", children: [_jsx("h2", { className: "attendance h5 fw-semibold mb-3", children: editing ? 'Sửa bản ghi' : 'Thêm bản ghi' }), _jsxs("form", { onSubmit: onSave, className: "attendance row g-3", children: [_jsxs("div", { className: "attendance col-sm-6", children: [_jsx("label", { className: "attendance form-label text-dark fw-semibold", children: "Nh\u00E2n vi\u00EAn" }), _jsxs("select", { className: "attendance form-select", value: editEmp, onChange: (e) => setEditEmp(e.target.value ? Number(e.target.value) : ''), required: true, children: [_jsx("option", { value: "", children: "\u2014 Ch\u1ECDn nh\u00E2n vi\u00EAn \u2014" }), emps.map((emp) => (_jsxs("option", { value: emp.id, children: [emp.full_name, " ", emp.email ? `(${emp.email})` : ''] }, emp.id)))] })] }), _jsxs("div", { className: "attendance col-sm-6", children: [_jsx("label", { className: "attendance form-label text-dark fw-semibold", children: "Ng\u00E0y l\u00E0m vi\u1EC7c" }), _jsx("input", { type: "date", className: "attendance form-control", value: editDate, onChange: (e) => setEditDate(e.target.value), required: true })] }), _jsxs("div", { className: "attendance col-sm-6", children: [_jsx("label", { className: "attendance form-label text-dark fw-semibold", children: "Check-in" }), _jsxs("div", { className: "attendance input-group", children: [_jsx("input", { type: "datetime-local", className: "attendance form-control", value: editIn, onChange: (e) => setEditIn(e.target.value) }), _jsxs("button", { type: "button", onClick: clearIn, className: "attendance btn btn-outline-danger btn-sm", children: [_jsx("svg", { className: "attendance bi", width: "16", height: "16", fill: "currentColor", viewBox: "0 0 16 16", children: _jsx("path", { d: "M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" }) }), "Xo\u00E1"] })] })] }), _jsxs("div", { className: "attendance col-sm-6", children: [_jsx("label", { className: "attendance form-label text-dark fw-semibold", children: "Check-out" }), _jsxs("div", { className: "attendance input-group", children: [_jsx("input", { type: "datetime-local", className: "attendance form-control", value: editOut, onChange: (e) => setEditOut(e.target.value) }), _jsxs("button", { type: "button", onClick: clearOut, className: "attendance btn btn-outline-danger btn-sm", children: [_jsx("svg", { className: "attendance bi", width: "16", height: "16", fill: "currentColor", viewBox: "0 0 16 16", children: _jsx("path", { d: "M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" }) }), "Xo\u00E1"] })] })] }), _jsxs("div", { className: "attendance col-sm-12 d-flex gap-2", children: [_jsxs("button", { disabled: !canSave, className: "attendance btn btn-success d-flex align-items-center gap-2 flex-grow-1", children: [_jsxs("svg", { className: "attendance bi", width: "16", height: "16", fill: "currentColor", viewBox: "0 0 16 16", children: [_jsx("path", { d: "M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2Zm13 1v12H1V2h14Z" }), _jsx("path", { d: "M5 10.5a.5.5 0 0 1 .5-.5h2V9h-2a.5.5 0 0 1-.5-.5V7a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v1.5a.5.5 0 0 1-.5.5h-2v1h2a.5.5 0 0 1 .5.5V11a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5v-1.5Z" })] }), "L\u01B0u"] }), _jsxs("button", { type: "button", onClick: closeForm, className: "attendance btn btn-outline-danger d-flex align-items-center gap-2 flex-grow-1", children: [_jsx("svg", { className: "attendance bi", width: "16", height: "16", fill: "currentColor", viewBox: "0 0 16 16", children: _jsx("path", { d: "M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" }) }), "H\u1EE7y"] })] })] })] }) })), _jsx("div", { className: "attendance card border-0", children: _jsx("div", { className: "attendance card-body p-0", children: loading ? (_jsxs("div", { className: "attendance text-center p-4", children: [_jsx("div", { className: "attendance spinner-border text-primary", role: "status", children: _jsx("span", { className: "visually-hidden", children: "\u0110ang t\u1EA3i\u2026" }) }), _jsx("p", { className: "attendance text-sm text-muted mt-2", children: "\u0110ang t\u1EA3i danh s\u00E1ch ch\u1EA5m c\u00F4ng..." })] })) : (_jsx("div", { className: "attendance table-responsive", children: _jsxs("table", { className: "attendance table table-hover hrm-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { className: "attendance p-3 text-left text-dark", children: "Nh\u00E2n vi\u00EAn" }), _jsx("th", { className: "attendance p-3 text-left text-dark", children: "Email" }), _jsx("th", { className: "attendance p-3 text-left text-dark", children: "Ng\u00E0y" }), _jsx("th", { className: "attendance p-3 text-left text-dark", children: "Check-in" }), _jsx("th", { className: "attendance p-3 text-left text-dark", children: "Check-out" }), _jsx("th", { className: "attendance p-3 text-right text-dark", children: "Thao t\u00E1c" })] }) }), _jsxs("tbody", { children: [rows.map((r) => (_jsxs("tr", { className: "attendance hrm-table-row", children: [_jsx("td", { className: "attendance p-3", children: r.employee?.full_name || r.employee_id }), _jsx("td", { className: "attendance p-3", children: r.employee?.email || '—' }), _jsx("td", { className: "attendance p-3", children: r.work_date }), _jsx("td", { className: "attendance p-3", children: fmtDT(r.check_in) }), _jsx("td", { className: "attendance p-3", children: fmtDT(r.check_out) }), _jsxs("td", { className: "attendance p-3 text-right", children: [_jsxs("button", { onClick: () => openEdit(r), className: "attendance btn btn-outline-primary btn-sm me-2", children: [_jsx("svg", { className: "attendance bi", width: "16", height: "16", fill: "currentColor", viewBox: "0 0 16 16", children: _jsx("path", { d: "M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" }) }), "S\u1EEDa"] }), _jsxs("button", { onClick: () => onDelete(r.id), className: "attendance btn btn-outline-danger btn-sm", children: [_jsxs("svg", { className: "attendance bi", width: "16", height: "16", fill: "currentColor", viewBox: "0 0 16 16", children: [_jsx("path", { d: "M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" }), _jsx("path", { fillRule: "evenodd", d: "M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" })] }), "Xo\u00E1"] })] })] }, r.id))), !rows.length && (_jsx("tr", { children: _jsx("td", { colSpan: 6, className: "attendance p-3 text-center text-muted", children: "Kh\u00F4ng c\u00F3 d\u1EEF li\u1EC7u" }) }))] })] }) })) }) }), totalPages > 1 && (_jsxs("div", { className: "attendance d-flex align-items-center justify-content-center gap-3 mt-4", children: [_jsxs("button", { onClick: () => {
                                        if (page > 1) {
                                            setPage(page - 1);
                                            loadList(page - 1);
                                        }
                                    }, className: "attendance btn btn-outline-primary btn-sm d-flex align-items-center gap-2", disabled: page <= 1, children: [_jsx("svg", { className: "attendance bi", width: "16", height: "16", fill: "currentColor", viewBox: "0 0 16 16", children: _jsx("path", { fillRule: "evenodd", d: "M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" }) }), "Tr\u01B0\u1EDBc"] }), _jsxs("span", { className: "attendance text-sm text-dark", children: ["Trang ", page, "/", totalPages] }), _jsxs("button", { onClick: () => {
                                        if (page < totalPages) {
                                            setPage(page + 1);
                                            loadList(page + 1);
                                        }
                                    }, className: "attendance btn btn-outline-primary btn-sm d-flex align-items-center gap-2", disabled: page >= totalPages, children: ["Sau", _jsx("svg", { className: "attendance bi", width: "16", height: "16", fill: "currentColor", viewBox: "0 0 16 16", children: _jsx("path", { fillRule: "evenodd", d: "M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" }) })] })] }))] })] }) }));
}
