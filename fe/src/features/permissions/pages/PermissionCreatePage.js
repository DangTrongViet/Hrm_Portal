import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postJSON } from '../../../lib/http';
import '../../../../public/css/permissions/PermissionCreatePage.css';
export default function PermissionCreatePage() {
    const nav = useNavigate();
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');
    const nameRef = useRef(null);
    useEffect(() => {
        nameRef.current?.focus();
    }, []);
    const nameValid = name.trim().length > 0;
    const can = nameValid && !loading;
    const onSubmit = async (e) => {
        e.preventDefault();
        if (!can)
            return;
        setLoading(true);
        setErr('');
        try {
            await postJSON(`/permissions`, {
                name: name.trim(),
                description: desc.trim() || null,
            });
            // Có thể thay alert bằng toast nếu bạn có lib toast
            alert('✅ Đã tạo permission');
            nav('/permissions', { replace: true });
        }
        catch (e) {
            setErr(e?.message || '❌ Tạo permission thất bại');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "container py-5", children: [_jsx("div", { className: "pcp-header card shadow-sm border-0 mb-4", children: _jsxs("div", { className: "card-body p-4 d-flex align-items-center justify-content-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "h4 mb-1 text-white", children: "\u2795 T\u1EA1o Permission" }), _jsxs("div", { className: "text-white-50 small", children: ["\u0110i\u1EC1n th\u00F4ng tin v\u00E0 b\u1EA5m ", _jsx("strong", { children: "T\u1EA1o permission" }), "."] })] }), _jsx("button", { onClick: () => nav(-1), className: "btn btn-outline-light btn-sm rounded-pill px-3", children: "\u21A9 Quay l\u1EA1i" })] }) }), _jsx("form", { onSubmit: onSubmit, noValidate: true, children: _jsxs("div", { className: "card shadow-sm border-0 pcp-card", children: [_jsxs("div", { className: "card-body p-4", children: [_jsxs("div", { className: "row g-3", children: [_jsxs("div", { className: "col-12 col-md-6", children: [_jsx("label", { className: "form-label fw-semibold", children: "T\u00EAn *" }), _jsx("input", { ref: nameRef, value: name, onChange: (e) => setName(e.target.value), className: `form-control ${!nameValid && name ? 'is-invalid' : ''}`, placeholder: "VD: user.read", required: true }), !nameValid && name.length > 0 && (_jsx("div", { className: "invalid-feedback", children: "T\u00EAn quy\u1EC1n kh\u00F4ng \u0111\u01B0\u1EE3c \u0111\u1EC3 tr\u1ED1ng." }))] }), _jsxs("div", { className: "col-12 col-md-6", children: [_jsx("label", { className: "form-label fw-semibold", children: "M\u00F4 t\u1EA3" }), _jsx("input", { value: desc, onChange: (e) => setDesc(e.target.value), className: "form-control", placeholder: "M\u00F4 t\u1EA3 ng\u1EAFn cho quy\u1EC1n" })] })] }), err && (_jsx("div", { className: "alert alert-danger bg-danger-subtle border-danger-subtle mt-3 mb-0", children: err }))] }), _jsx("div", { className: "card-footer bg-white d-flex justify-content-end", children: _jsx("button", { type: "submit", disabled: !can, className: "btn btn-success rounded-pill px-4 pcp-btn", children: loading ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "spinner-border spinner-border-sm me-2", role: "status" }), "\u0110ang t\u1EA1o..."] })) : ('Tạo permission') }) })] }) })] }));
}
