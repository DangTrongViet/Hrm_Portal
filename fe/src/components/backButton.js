import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
export default function BackButton({ label = 'Trở lại', fallback = '/', className = '', }) {
    const nav = useNavigate();
    const onBack = () => {
        if (window.history.length > 1) {
            nav(-1);
        }
        else {
            nav(fallback);
        }
    };
    return (_jsxs("button", { type: "button", onClick: onBack, className: 'inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 ' +
            'hover:bg-gray-50 shadow-sm ' +
            className, "aria-label": label, children: [_jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", className: "opacity-70", children: _jsx("path", { d: "M15 18l-6-6 6-6", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) }), label] }));
}
