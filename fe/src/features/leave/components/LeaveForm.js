import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import '../../../../public/css/leave/LeaveForm.css';
const LeaveForm = ({ onSubmit, initialData }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    // Nếu có initialData (khi edit) thì prefill form
    useEffect(() => {
        if (initialData) {
            setStartDate(initialData.start_date);
            setEndDate(initialData.end_date);
            setReason(initialData.reason);
        }
        else {
            setStartDate('');
            setEndDate('');
            setReason('');
        }
    }, [initialData]);
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            start_date: startDate,
            end_date: endDate,
            reason,
        });
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "leave-form-container", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "T\u1EEB ng\u00E0y" }), _jsx("input", { type: "date", value: startDate, onChange: (e) => setStartDate(e.target.value), className: "form-input", required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "\u0110\u1EBFn ng\u00E0y" }), _jsx("input", { type: "date", value: endDate, onChange: (e) => setEndDate(e.target.value), className: "form-input", required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "L\u00FD do" }), _jsx("input", { type: "text", value: reason, onChange: (e) => setReason(e.target.value), className: "form-input", required: true })] }), _jsx("button", { type: "submit", className: "submit-button", children: initialData ? 'Cập nhật' : 'Tạo mới' })] }));
};
export default LeaveForm;
