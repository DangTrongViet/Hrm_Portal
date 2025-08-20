import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { getJSON, postJSON, putJSON } from '../../../lib/http';
import '../../../../public/css/payroll/PayrollAdminform.css';
/** Ép mọi giá trị tiền tệ về số an toàn */
const toNumber = (val) => {
    if (val === null || val === undefined)
        return 0;
    if (typeof val === 'number')
        return Number.isFinite(val) ? val : 0;
    const n = Number(String(val).replace(/[^\d.-]/g, ''));
    return Number.isFinite(n) ? n : 0;
};
const formatVND = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(toNumber(v));
const PayrollForm = ({ payroll, onSuccess, onCancel }) => {
    const [form, setForm] = useState(payroll || {});
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingEmp, setLoadingEmp] = useState(true);
    const [error, setError] = useState(null);
    // Fetch employees
    useEffect(() => {
        const fetchEmployees = async () => {
            setLoadingEmp(true);
            try {
                const res = await getJSON('/employees');
                setEmployees(res?.items || []);
            }
            catch (err) {
                console.error(err);
            }
            finally {
                setLoadingEmp(false);
            }
        };
        fetchEmployees();
    }, []);
    // Tự tính net_salary khi các trường thay đổi
    const base = toNumber(form.base_salary);
    const bonus = toNumber(form.bonus);
    const deductions = toNumber(form.deductions);
    const net = useMemo(() => base + bonus - deductions, [base, bonus, deductions]);
    useEffect(() => {
        setForm((prev) => ({ ...prev, net_salary: net }));
    }, [net]);
    // Đảm bảo period_end >= period_start nếu có đủ đôi
    const minEnd = form.period_start || undefined;
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };
    const handleNumber = (name) => (e) => {
        const { value } = e.target;
        // Lưu dưới dạng string để input number kiểm soát, nhưng đã có toNumber ở trên
        setForm((prev) => ({ ...prev, [name]: value }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const payload = {
                ...form,
                employee_id: form.employee_id ? Number(form.employee_id) : undefined,
                base_salary: base,
                bonus: bonus,
                deductions: deductions,
                net_salary: net,
            };
            if (payload.id) {
                await putJSON(`/payroll/admin/${payload.id}`, payload);
            }
            else {
                await postJSON('/payroll/admin', payload);
            }
            onSuccess();
        }
        catch (err) {
            setError(err?.message || 'Lỗi khi lưu bảng lương');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "payroll-form-card card payroll-form", children: [_jsxs("div", { className: "payroll-form-header card-header d-flex align-items-center justify-content-between", children: [_jsxs("div", { className: "d-flex align-items-center gap-2", children: [_jsx("i", { className: "fas fa-file-invoice-dollar" }), _jsx("h5", { className: "mb-0", children: form.id ? 'Chỉnh sửa bảng lương' : 'Tạo bảng lương mới' })] }), form.id && (_jsxs("span", { className: "badge bg-light text-dark", children: ["ID: ", _jsx("strong", { children: form.id })] }))] }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "card-body", children: [error && (_jsxs("div", { className: "alert alert-danger", children: [_jsx("i", { className: "fas fa-exclamation-triangle me-2" }), error] })), _jsxs("div", { className: "row g-3 input-compact", children: [_jsxs("div", { className: "col-12 col-md-6", children: [_jsxs("label", { className: "form-label", children: ["Nh\u00E2n vi\u00EAn ", _jsx("span", { className: "text-danger", children: "*" })] }), loadingEmp ? (_jsx("div", { className: "skeleton" })) : (_jsxs("select", { name: "employee_id", className: "form-select", value: form.employee_id || '', onChange: handleChange, required: true, children: [_jsx("option", { value: "", children: "\u2014 Ch\u1ECDn nh\u00E2n vi\u00EAn \u2014" }), employees.map((emp) => (_jsxs("option", { value: emp.id, children: [emp.full_name, " (ID: ", emp.id, ")"] }, emp.id)))] })), _jsxs("div", { className: "form-text small-hint", children: ["D\u1EEF li\u1EC7u t\u1EEB endpoint ", _jsx("code", { children: "/employees" }), "."] })] }), _jsxs("div", { className: "col-6 col-md-3", children: [_jsx("label", { className: "form-label", children: "Ng\u00E0y b\u1EAFt \u0111\u1EA7u" }), _jsxs("div", { className: "input-group", children: [_jsx("span", { className: "input-group-text", children: _jsx("i", { className: "fas fa-calendar-plus" }) }), _jsx("input", { type: "date", name: "period_start", className: "form-control", value: form.period_start || '', onChange: handleChange })] })] }), _jsxs("div", { className: "col-6 col-md-3", children: [_jsx("label", { className: "form-label", children: "Ng\u00E0y k\u1EBFt th\u00FAc" }), _jsxs("div", { className: "input-group", children: [_jsx("span", { className: "input-group-text", children: _jsx("i", { className: "fas fa-calendar-check" }) }), _jsx("input", { type: "date", name: "period_end", className: "form-control", value: form.period_end || '', min: minEnd, onChange: handleChange })] })] }), _jsxs("div", { className: "col-12 col-md-4", children: [_jsx("label", { className: "form-label", children: "L\u01B0\u01A1ng c\u01A1 b\u1EA3n" }), _jsxs("div", { className: "input-group", children: [_jsx("span", { className: "input-group-text", children: _jsx("i", { className: "fas fa-sack-dollar" }) }), _jsx("input", { type: "number", name: "base_salary", className: "form-control", value: form.base_salary ?? '', onChange: handleNumber('base_salary'), min: 0, step: "1000", placeholder: "0" })] }), _jsx("div", { className: "form-text", children: _jsx("span", { className: "preview-money base", children: formatVND(form.base_salary) }) })] }), _jsxs("div", { className: "col-12 col-md-4", children: [_jsx("label", { className: "form-label", children: "Th\u01B0\u1EDFng" }), _jsxs("div", { className: "input-group", children: [_jsx("span", { className: "input-group-text", children: _jsx("i", { className: "fas fa-gift" }) }), _jsx("input", { type: "number", name: "bonus", className: "form-control", value: form.bonus ?? '', onChange: handleNumber('bonus'), min: 0, step: "1000", placeholder: "0" })] }), _jsx("div", { className: "form-text", children: _jsx("span", { className: "preview-money bonus", children: formatVND(form.bonus) }) })] }), _jsxs("div", { className: "col-12 col-md-4", children: [_jsx("label", { className: "form-label", children: "Kho\u1EA3n tr\u1EEB" }), _jsxs("div", { className: "input-group", children: [_jsx("span", { className: "input-group-text", children: _jsx("i", { className: "fas fa-minus-circle" }) }), _jsx("input", { type: "number", name: "deductions", className: "form-control", value: form.deductions ?? '', onChange: handleNumber('deductions'), min: 0, step: "1000", placeholder: "0" })] }), _jsx("div", { className: "form-text", children: _jsxs("span", { className: "preview-money deduct", children: ["-", formatVND(form.deductions)] }) })] }), _jsx("div", { className: "col-12", children: _jsxs("div", { className: "p-3 bg-light rounded d-flex align-items-center flex-wrap gap-2", children: [_jsxs("div", { children: [_jsx("span", { className: "small text-muted", children: "T\u1ED5ng th\u1EF1c nh\u1EADn" }), _jsx("br", {}), _jsx("span", { className: "h5 mb-0 preview-money net", children: formatVND(net) })] }), _jsx("span", { className: "separator-dot" }), _jsx("div", { className: "small text-muted", children: "= L\u01B0\u01A1ng c\u01A1 b\u1EA3n + Th\u01B0\u1EDFng \u2212 Kho\u1EA3n tr\u1EEB" }), _jsx("input", { type: "hidden", name: "net_salary", value: net, readOnly: true })] }) })] })] }), _jsxs("div", { className: "card-footer d-flex justify-content-between align-items-center gap-2 form-footer", children: [_jsxs("div", { className: "small text-muted", children: [_jsx("i", { className: "fas fa-info-circle me-1" }), "Ki\u1EC3m tra l\u1EA1i k\u1EF3 l\u01B0\u01A1ng tr\u01B0\u1EDBc khi l\u01B0u."] }), _jsxs("div", { className: "d-flex gap-2", children: [_jsx("button", { type: "button", className: "btn btn-outline-secondary", onClick: onCancel, disabled: loading, children: "H\u1EE7y" }), _jsx("button", { type: "submit", className: "btn btn-primary", disabled: loading, children: loading ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "spinner-border spinner-border-sm me-2", role: "status" }), "\u0110ang l\u01B0u..."] })) : (_jsxs(_Fragment, { children: [_jsx("i", { className: "fas fa-save me-2" }), "L\u01B0u"] })) })] })] })] })] }));
};
export default PayrollForm;
