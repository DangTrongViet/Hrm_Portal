import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { getJSON, putJSON, delJSON } from '../../../lib/http';
import '../../../../public/css/leave/AdminLeavePage.css';
const AdminLeavePage = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchLeaves = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getJSON('/leaves/admin');
            setLeaves(Array.isArray(res.data.rows) ? res.data.rows : []);
        }
        catch (err) {
            setError(err?.message || 'Không thể tải danh sách đơn nghỉ');
        }
        finally {
            setLoading(false);
        }
    };
    const handleApprove = async (id) => {
        try {
            await putJSON(`/leaves/admin/${id}/approve`, {});
            setLeaves((prev) => prev.map((leave) => leave.id === id ? { ...leave, status: 'approved' } : leave));
        }
        catch (err) {
            setError(err?.message || 'Phê duyệt thất bại');
        }
    };
    const handleReject = async (id) => {
        try {
            await putJSON(`/leaves/admin/${id}/reject`, {});
            setLeaves((prev) => prev.map((leave) => leave.id === id ? { ...leave, status: 'rejected' } : leave));
        }
        catch (err) {
            setError(err?.message || 'Từ chối thất bại');
        }
    };
    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa đơn nghỉ này?'))
            return;
        try {
            await delJSON(`/leaves/admin/${id}`);
            setLeaves((prev) => prev.filter((leave) => leave.id !== id));
        }
        catch (err) {
            setError(err?.message || 'Xóa thất bại');
        }
    };
    useEffect(() => {
        fetchLeaves();
    }, []);
    return (_jsxs("div", { className: "leaveAdmin container max-w-6xl mx-auto p-6", children: [_jsxs("h1", { className: "page-title", children: [_jsx("i", { className: "fas fa-money-check-alt" }), "Qu\u1EA3n l\u00FD \u0111\u01A1n ngh\u1EC9"] }), loading && (_jsxs("div", { className: "loading-box", children: [_jsx("div", { className: "spinner" }), _jsx("p", { children: "\u0110ang t\u1EA3i danh s\u00E1ch \u0111\u01A1n ngh\u1EC9..." })] })), error && (_jsxs("div", { className: "error-box", children: [_jsx("i", { className: "fas fa-exclamation-triangle" }), " ", error] })), !loading && !error && (_jsxs("div", { className: "table-wrapper", children: [_jsxs("table", { className: "leave-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "#" }), _jsx("th", { children: "Nh\u00E2n vi\u00EAn" }), _jsx("th", { children: "T\u1EEB ng\u00E0y" }), _jsx("th", { children: "\u0110\u1EBFn ng\u00E0y" }), _jsx("th", { children: "L\u00FD do" }), _jsx("th", { children: "Tr\u1EA1ng th\u00E1i" }), _jsx("th", { children: "H\u00E0nh \u0111\u1ED9ng" })] }) }), _jsx("tbody", { children: leaves.map((leave, index) => (_jsxs("tr", { children: [_jsx("td", { children: index + 1 }), _jsx("td", { children: leave.employee_id }), _jsx("td", { children: leave.start_date }), _jsx("td", { children: leave.end_date }), _jsx("td", { children: leave.reason }), _jsxs("td", { children: [leave.status === 'pending' && (_jsx("span", { className: "status pending", children: "Ch\u1EDD duy\u1EC7t" })), leave.status === 'approved' && (_jsx("span", { className: "status approved", children: "\u0110\u00E3 duy\u1EC7t" })), leave.status === 'rejected' && (_jsx("span", { className: "status rejected", children: "T\u1EEB ch\u1ED1i" }))] }), _jsxs("td", { className: "actions", children: [leave.status === 'pending' && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => handleApprove(leave.id), className: "btn approve", children: "\u2705 Duy\u1EC7t" }), _jsx("button", { onClick: () => handleReject(leave.id), className: "btn reject", children: "\u274C T\u1EEB ch\u1ED1i" })] })), _jsx("button", { onClick: () => handleDelete(leave.id), className: "btn delete", children: "\uD83D\uDDD1 X\u00F3a" })] })] }, leave.id))) })] }), leaves.length === 0 && (_jsx("p", { className: "empty", children: "Ch\u01B0a c\u00F3 \u0111\u01A1n ngh\u1EC9 n\u00E0o." }))] }))] }));
};
export default AdminLeavePage;
