import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import * as dashboardAdmin from '../api';
const DashboardAdmin = () => {
    const [loading, setLoading] = useState(true);
    const [employeeSummary, setEmployeeSummary] = useState(null);
    const [userSummary, setUserSummary] = useState(null);
    const [contractSummary, setContractSummary] = useState(null);
    const [leaveSummary, setLeaveSummary] = useState(null);
    const [overtimeSummary, setOvertimeSummary] = useState(null);
    const [totalPayrolls, setTotalPayrolls] = useState(null);
    const [totalRoles, setTotalRoles] = useState(null);
    const [totalPermissions, setTotalPermissions] = useState(null);
    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [emp, user, contract, leave, overtime, payrolls, roles, permissions,] = await Promise.all([
                    dashboardAdmin.getEmployeeSummary(),
                    dashboardAdmin.getUsersSummary(),
                    dashboardAdmin.getContractSummary(),
                    dashboardAdmin.getLeaveSummary(),
                    dashboardAdmin.getOvertimeSummary(),
                    dashboardAdmin.getTotalPayrolls(),
                    dashboardAdmin.getTotalRoles(),
                    dashboardAdmin.getTotalPermissions(),
                ]);
                setEmployeeSummary(emp);
                setUserSummary(user);
                setContractSummary(contract);
                setLeaveSummary(leave);
                setOvertimeSummary(overtime);
                setTotalPayrolls(payrolls);
                setTotalRoles(roles);
                setTotalPermissions(permissions);
            }
            catch (err) {
                console.error('Lỗi khi tải dữ liệu dashboard:', err);
            }
            finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);
    if (loading)
        return _jsx("div", { className: "text-center my-5", children: "\u0110ang t\u1EA3i dashboard..." });
    return (_jsxs("div", { className: "container-fluid py-4", children: [_jsx("h1", { className: "display-4 text-center mb-4 text-primary", children: "Dashboard Qu\u1EA3n Tr\u1ECB" }), _jsxs("div", { className: "row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4", children: [_jsx("div", { className: "col", children: _jsx("div", { className: "card h-100 shadow-sm border-primary", children: _jsxs("div", { className: "card-body", children: [_jsx("h3", { className: "card-title text-primary", children: "Nh\u00E2n Vi\u00EAn" }), _jsxs("p", { className: "card-text", children: ["T\u1ED5ng s\u1ED1: ", _jsx("strong", { children: employeeSummary?.total ?? '-' })] }), _jsxs("p", { className: "card-text", children: ["\u0110ang ho\u1EA1t \u0111\u1ED9ng:", ' ', _jsx("strong", { children: employeeSummary?.active ?? '-' })] }), _jsxs("p", { className: "card-text", children: ["Ng\u1EEBng ho\u1EA1t \u0111\u1ED9ng:", ' ', _jsx("strong", { children: employeeSummary?.inactive ?? '-' })] })] }) }) }), _jsx("div", { className: "col", children: _jsx("div", { className: "card h-100 shadow-sm border-success", children: _jsxs("div", { className: "card-body", children: [_jsx("h3", { className: "card-title text-success", children: "Ng\u01B0\u1EDDi D\u00F9ng" }), _jsxs("p", { className: "card-text", children: ["T\u1ED5ng s\u1ED1: ", _jsx("strong", { children: userSummary?.total ?? '-' })] }), _jsxs("p", { className: "card-text", children: ["\u0110ang ho\u1EA1t \u0111\u1ED9ng: ", _jsx("strong", { children: userSummary?.active ?? '-' })] }), _jsxs("p", { className: "card-text", children: ["Ng\u1EEBng ho\u1EA1t \u0111\u1ED9ng: ", _jsx("strong", { children: userSummary?.inactive ?? '-' })] })] }) }) }), _jsx("div", { className: "col", children: _jsx("div", { className: "card h-100 shadow-sm border-warning", children: _jsxs("div", { className: "card-body", children: [_jsx("h3", { className: "card-title text-warning", children: "H\u1EE3p \u0110\u1ED3ng" }), _jsxs("p", { className: "card-text", children: ["T\u1ED5ng s\u1ED1: ", _jsx("strong", { children: contractSummary?.total ?? '-' })] }), _jsxs("p", { className: "card-text", children: ["H\u1EE3p l\u1EC7: ", _jsx("strong", { children: contractSummary?.valid ?? '-' })] }), _jsxs("p", { className: "card-text", children: ["H\u1EBFt h\u1EA1n: ", _jsx("strong", { children: contractSummary?.expire ?? '-' })] }), _jsxs("p", { className: "card-text", children: ["Ch\u1EA5m d\u1EE9t: ", _jsx("strong", { children: contractSummary?.terminate ?? '-' })] })] }) }) }), _jsx("div", { className: "col", children: _jsx("div", { className: "card h-100 shadow-sm border-info", children: _jsxs("div", { className: "card-body", children: [_jsx("h3", { className: "card-title text-info", children: "\u0110\u01A1n Ngh\u1EC9 Ph\u00E9p" }), _jsxs("p", { className: "card-text", children: ["T\u1ED5ng s\u1ED1: ", _jsx("strong", { children: leaveSummary?.total ?? '-' })] }), _jsxs("p", { className: "card-text", children: ["\u0110\u01B0\u1EE3c duy\u1EC7t: ", _jsx("strong", { children: leaveSummary?.approve ?? '-' })] }), _jsxs("p", { className: "card-text", children: ["B\u1ECB t\u1EEB ch\u1ED1i: ", _jsx("strong", { children: leaveSummary?.reject ?? '-' })] }), _jsxs("p", { className: "card-text", children: ["\u0110ang ch\u1EDD: ", _jsx("strong", { children: leaveSummary?.pending ?? '-' })] })] }) }) }), _jsx("div", { className: "col", children: _jsx("div", { className: "card h-100 shadow-sm border-danger", children: _jsxs("div", { className: "card-body", children: [_jsx("h3", { className: "card-title text-danger", children: "T\u0103ng Ca" }), _jsxs("p", { className: "card-text", children: ["T\u1ED5ng s\u1ED1: ", _jsx("strong", { children: overtimeSummary?.total ?? '-' })] }), _jsxs("p", { className: "card-text", children: ["\u0110\u01B0\u1EE3c duy\u1EC7t: ", _jsx("strong", { children: overtimeSummary?.approve ?? '-' })] }), _jsxs("p", { className: "card-text", children: ["B\u1ECB t\u1EEB ch\u1ED1i: ", _jsx("strong", { children: overtimeSummary?.reject ?? '-' })] }), _jsxs("p", { className: "card-text", children: ["\u0110ang ch\u1EDD: ", _jsx("strong", { children: overtimeSummary?.pending ?? '-' })] })] }) }) }), _jsx("div", { className: "col", children: _jsx("div", { className: "card h-100 shadow-sm border-secondary", children: _jsxs("div", { className: "card-body", children: [_jsx("h3", { className: "card-title text-secondary", children: "B\u1EA3ng L\u01B0\u01A1ng" }), _jsxs("p", { className: "card-text", children: ["T\u1ED5ng s\u1ED1: ", _jsx("strong", { children: totalPayrolls ?? '-' })] })] }) }) }), _jsx("div", { className: "col", children: _jsx("div", { className: "card h-100 shadow-sm border-dark", children: _jsxs("div", { className: "card-body", children: [_jsx("h3", { className: "card-title text-dark", children: "Vai Tr\u00F2" }), _jsxs("p", { className: "card-text", children: ["T\u1ED5ng s\u1ED1: ", _jsx("strong", { children: totalRoles ?? '-' })] })] }) }) }), _jsx("div", { className: "col", children: _jsx("div", { className: "card h-100 shadow-sm border-primary", children: _jsxs("div", { className: "card-body", children: [_jsx("h3", { className: "card-title text-primary", children: "Quy\u1EC1n" }), _jsxs("p", { className: "card-text", children: ["T\u1ED5ng s\u1ED1: ", _jsx("strong", { children: totalPermissions ?? '-' })] })] }) }) })] })] }));
};
export default DashboardAdmin;
