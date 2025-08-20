import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
const LeaveList = ({ leaves, onEdit, onDelete }) => {
    return (_jsxs("div", { className: "leave-list-container", children: [_jsx("h2", { className: "text-2xl font-semibold mb-4", children: "Danh s\u00E1ch \u0111\u01A1n ngh\u1EC9" }), _jsxs("table", { className: "min-w-full table-auto border-collapse border w-full", children: [_jsx("thead", { className: "table-header", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-2 text-left", children: "ID" }), _jsx("th", { className: "px-4 py-2 text-left", children: "T\u1EEB ng\u00E0y" }), _jsx("th", { className: "px-4 py-2 text-left", children: "\u0110\u1EBFn ng\u00E0y" }), _jsx("th", { className: "px-4 py-2 text-left", children: "L\u00FD do" }), _jsx("th", { className: "px-4 py-2 text-left", children: "Tr\u1EA1ng th\u00E1i" }), _jsx("th", { className: "px-4 py-2 text-left", children: "H\u00E0nh \u0111\u1ED9ng" })] }) }), _jsx("tbody", { children: leaves.map((leave) => (_jsxs("tr", { className: "table-row", children: [_jsx("td", { className: "table-cell", children: leave.id }), _jsx("td", { className: "table-cell", children: leave.start_date }), _jsx("td", { className: "table-cell", children: leave.end_date }), _jsx("td", { className: "table-cell", children: leave.reason }), _jsx("td", { className: "table-cell", children: _jsx("span", { className: `${leave.status === 'pending'
                                            ? 'status-pending'
                                            : leave.status === 'approved'
                                                ? 'status-approved'
                                                : 'status-rejected'}`, children: leave.status === 'pending'
                                            ? 'Chờ duyệt'
                                            : leave.status === 'approved'
                                                ? 'Đã duyệt'
                                                : 'Từ chối' }) }), _jsx("td", { className: "table-cell space-x-2", children: leave.status === 'pending' ? (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => onEdit(leave), className: "button button-edit", children: "S\u1EEDa" }), _jsx("button", { onClick: () => onDelete(leave.id), className: "button button-delete", children: "X\u00F3a" })] })) : (_jsx("span", { className: "text-sm text-gray-500", children: "Kh\u00F4ng th\u1EC3 ch\u1EC9nh s\u1EEDa" })) })] }, leave.id))) })] })] }));
};
export default LeaveList;
