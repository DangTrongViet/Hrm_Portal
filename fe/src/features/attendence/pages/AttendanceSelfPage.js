import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { getJSON, postJSON, buildQuery } from '../../../lib/http';
import { useNavigate } from 'react-router-dom';
import '../../../../public/css/attendance/AttendanceSelfPage.css';
function fmtDate(d) {
    if (!d)
        return '—';
    try {
        return new Date(d).toLocaleString('vi-VN', {
            dateStyle: 'short',
            timeStyle: 'short',
        });
    }
    catch {
        return d;
    }
}
function ym(d = new Date()) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
export default function AttendanceSelfPage() {
    const nav = useNavigate();
    // today
    const [today, setToday] = useState(null);
    const [loadingToday, setLoadingToday] = useState(true);
    const [errToday, setErrToday] = useState('');
    // list
    const [list, setList] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [errList, setErrList] = useState('');
    // filter
    const [month, setMonth] = useState(ym());
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const canCheckIn = useMemo(() => today && !today.checkedIn, [today]);
    const canCheckOut = useMemo(() => today && today.checkedIn && !today.checkedOut, [today]);
    async function loadToday() {
        setLoadingToday(true);
        setErrToday('');
        try {
            const res = await getJSON('/attendance/today');
            setToday(res);
        }
        catch (e) {
            setErrToday(e?.message || 'Không lấy được trạng thái hôm nay');
            setToday(null);
        }
        finally {
            setLoadingToday(false);
        }
    }
    async function loadList(p = page) {
        setErrList('');
        try {
            const params = buildQuery({
                page: p,
                pageSize,
                month: month || undefined,
                from: from || undefined,
                to: to || undefined,
                _t: Date.now(),
            });
            const res = await getJSON(`/attendance/me${params}`);
            setList(res.data);
            setTotalPages(res.pagination.totalPages);
            setPage(res.pagination.page);
        }
        catch (e) {
            setErrList(e?.message || 'Không tải lịch sử chấm công');
            setList([]);
        }
    }
    useEffect(() => {
        loadToday();
        // eslint-disable-next-line
    }, []);
    useEffect(() => {
        loadList(1);
        // eslint-disable-next-line
    }, [month]);
    const doCheckIn = async () => {
        try {
            await postJSON('/attendance/check-in', {});
            await Promise.all([loadToday(), loadList(page)]);
            alert('Đã check-in!');
        }
        catch (e) {
            alert(e?.message || 'Check-in thất bại');
        }
    };
    const doCheckOut = async () => {
        try {
            await postJSON('/attendance/check-out', {});
            await Promise.all([loadToday(), loadList(page)]);
            alert('Đã check-out!');
        }
        catch (e) {
            alert(e?.message || 'Check-out thất bại');
        }
    };
    const onSearch = (e) => {
        e.preventDefault();
        loadList(1);
    };
    return (_jsx("div", { className: "attendanceSelf container py-5", children: _jsx("div", { className: "card shadow-lg border-0 hrm-card bg-primary-subtle", children: _jsxs("div", { className: "card-body p-5", children: [_jsxs("div", { className: "d-flex align-items-center justify-content-between mb-5 header-section", children: [_jsx("h1", { className: "h3 fw-bold mb-0 gradient-text", children: "\uD83D\uDCCC Ch\u1EA5m c\u00F4ng c\u1EE7a t\u00F4i" }), _jsxs("button", { onClick: () => nav(-1), className: "btn btn-outline-warning btn-sm d-flex align-items-center gap-2 hrm-btn bg-warning-subtle back-btn", children: [_jsx("svg", { className: "bi", width: "16", height: "16", fill: "currentColor", viewBox: "0 0 16 16", children: _jsx("path", { fillRule: "evenodd", d: "M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" }) }), "Tr\u1EDF l\u1EA1i"] })] }), _jsx("div", { className: "card shadow-sm border-0 hrm-card bg-light mb-5 today-section", children: _jsxs("div", { className: "card-body", children: [_jsx("h2", { className: "h5 fw-semibold mb-3 text-primary-emphasis", children: "\uD83D\uDCC5 H\u00F4m nay" }), loadingToday ? (_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "spinner-border text-primary", style: { width: '2rem', height: '2rem' }, role: "status", children: _jsx("span", { className: "visually-hidden", children: "\u0110ang t\u1EA3i\u2026" }) }), _jsx("p", { className: "text-sm text-muted mt-2", children: "\u0110ang t\u1EA3i tr\u1EA1ng th\u00E1i ch\u1EA5m c\u00F4ng..." })] })) : errToday ? (_jsxs("div", { className: "alert alert-danger d-flex align-items-center gap-2 bg-danger-subtle border-danger-subtle", role: "alert", children: [_jsxs("svg", { className: "bi flex-shrink-0", width: "16", height: "16", fill: "currentColor", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2", children: [_jsx("path", { d: "M12 9v4" }), _jsx("path", { d: "M12 17h.01" }), _jsx("path", { d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" })] }), _jsx("span", { children: errToday })] })) : today ? (_jsxs("div", { className: "d-flex flex-column gap-3 sm:flex-row sm:items-center sm:justify-between", children: [_jsxs("div", { className: "text-sm", children: [_jsxs("div", { children: ["Check-in:", ' ', _jsx("span", { className: "font-medium text-dark", children: fmtDate(today.check_in ?? null) })] }), _jsxs("div", { children: ["Check-out:", ' ', _jsx("span", { className: "font-medium text-dark", children: fmtDate(today.check_out ?? null) })] })] }), _jsxs("div", { className: "d-flex gap-2", children: [_jsxs("button", { onClick: doCheckIn, disabled: !canCheckIn, className: "btn btn-primary bg-gradient d-flex align-items-center gap-2 hrm-btn", children: [_jsx("svg", { className: "bi", width: "16", height: "16", fill: "currentColor", viewBox: "0 0 16 16", children: _jsx("path", { d: "M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" }) }), "Check-in"] }), _jsxs("button", { onClick: doCheckOut, disabled: !canCheckOut, className: "btn btn-outline-primary d-flex align-items-center gap-2 hrm-btn bg-primary-subtle", children: [_jsxs("svg", { className: "bi", width: "16", height: "16", fill: "currentColor", viewBox: "0 0 16 16", children: [_jsx("path", { d: "M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2Zm13 1v12H1V2h14Z" }), _jsx("path", { d: "M5 10.5a.5.5 0 0 1 .5-.5h2V9h-2a.5.5 0 0 1-.5-.5V7a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v1.5a.5.5 0 0 1-.5.5h-2v1h2a.5.5 0 0 1 .5.5V11a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5v-1.5Z" })] }), "Check-out"] })] })] })) : (_jsx("div", { className: "text-sm text-muted", children: "Kh\u00F4ng c\u00F3 d\u1EEF li\u1EC7u h\u00F4m nay." }))] }) }), _jsx("div", { className: "card shadow-sm border-0 hrm-card bg-light mb-5 filter-section", children: _jsxs("div", { className: "card-body", children: [_jsx("h2", { className: "h5 fw-semibold mb-3 text-primary-emphasis", children: "\uD83D\uDD0D L\u1ECDc l\u1ECBch s\u1EED ch\u1EA5m c\u00F4ng" }), _jsxs("form", { onSubmit: onSearch, className: "row g-4", children: [_jsxs("div", { className: "col-sm-4", children: [_jsx("div", { className: "text-sm text-dark mb-1 fw-semibold", children: "Th\u00E1ng" }), _jsx("input", { type: "month", value: month, onChange: (e) => setMonth(e.target.value), className: "form-control shadow-sm" })] }), _jsxs("div", { className: "col-sm-4", children: [_jsx("div", { className: "text-sm text-dark mb-1 fw-semibold", children: "T\u1EEB ng\u00E0y" }), _jsx("input", { type: "date", value: from, onChange: (e) => setFrom(e.target.value), className: "form-control shadow-sm" })] }), _jsxs("div", { className: "col-sm-4", children: [_jsx("div", { className: "text-sm text-dark mb-1 fw-semibold", children: "\u0110\u1EBFn ng\u00E0y" }), _jsx("input", { type: "date", value: to, onChange: (e) => setTo(e.target.value), className: "form-control shadow-sm" })] }), _jsx("div", { className: "col-sm-12 d-flex align-items-end", children: _jsxs("button", { type: "submit", className: "btn btn-primary bg-gradient w-100 hrm-btn", children: [_jsx("svg", { className: "bi me-2", width: "16", height: "16", fill: "currentColor", viewBox: "0 0 16 16", children: _jsx("path", { d: "M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" }) }), "L\u1ECDc"] }) })] })] }) }), errList && (_jsxs("div", { className: "alert alert-danger d-flex align-items-center gap-2 mb-5 bg-danger-subtle border-danger-subtle", role: "alert", children: [_jsxs("svg", { className: "bi flex-shrink-0", width: "16", height: "16", fill: "currentColor", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2", children: [_jsx("path", { d: "M12 9v4" }), _jsx("path", { d: "M12 17h.01" }), _jsx("path", { d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" })] }), _jsx("span", { children: errList })] })), _jsx("div", { className: "card shadow-sm border-0 hrm-card bg-light history-section", children: _jsx("div", { className: "card-body p-0", children: _jsx("div", { className: "table-responsive", children: _jsxs("table", { className: "table table-hover hrm-table", children: [_jsx("thead", { className: "table-orange", children: _jsxs("tr", { children: [_jsx("th", { className: "p-3 text-left text-dark", children: "Ng\u00E0y" }), _jsx("th", { className: "p-3 text-left text-dark", children: "Check-in" }), _jsx("th", { className: "p-3 text-left text-dark", children: "Check-out" })] }) }), _jsxs("tbody", { children: [list.map((r) => (_jsxs("tr", { className: "hrm-table-row", children: [_jsx("td", { className: "p-3", children: r.work_date }), _jsx("td", { className: "p-3", children: fmtDate(r.check_in) }), _jsx("td", { className: "p-3", children: fmtDate(r.check_out) })] }, r.id))), !list.length && (_jsx("tr", { children: _jsx("td", { colSpan: 3, className: "p-3 text-center text-muted", children: "Kh\u00F4ng c\u00F3 d\u1EEF li\u1EC7u ch\u1EA5m c\u00F4ng" }) }))] })] }) }) }) }), totalPages > 1 && (_jsxs("div", { className: "d-flex align-items-center justify-content-center gap-3 mt-4 pagination-section", children: [_jsxs("button", { onClick: () => {
                                    if (page > 1) {
                                        setPage(page - 1);
                                        loadList(page - 1);
                                    }
                                }, className: "btn btn-outline-primary btn-sm d-flex align-items-center gap-2 hrm-btn bg-primary-subtle", disabled: page <= 1, children: [_jsx("svg", { className: "bi", width: "16", height: "16", fill: "currentColor", viewBox: "0 0 16 16", children: _jsx("path", { fillRule: "evenodd", d: "M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" }) }), "Tr\u01B0\u1EDBc"] }), _jsxs("span", { className: "text-sm text-dark", children: ["Trang ", page, "/", totalPages] }), _jsxs("button", { onClick: () => {
                                    if (page < totalPages) {
                                        setPage(page + 1);
                                        loadList(page + 1);
                                    }
                                }, className: "btn btn-outline-primary btn-sm d-flex align-items-center gap-2 hrm-btn bg-primary-subtle", disabled: page >= totalPages, children: ["Sau", _jsx("svg", { className: "bi", width: "16", height: "16", fill: "currentColor", viewBox: "0 0 16 16", children: _jsx("path", { fillRule: "evenodd", d: "M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" }) })] })] }))] }) }) }));
}
