import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { ContractApi } from '../api';
import ContractForm from '../components/ContractForm';
import { Link } from 'react-router-dom';
import '../../../../public/css/contract/ContractListPage.css';
export default function ContractListPage() {
    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    // modal state
    const [openCreate, setOpenCreate] = useState(false);
    const [editRow, setEditRow] = useState(null);
    const pageSize = 20;
    // Enhanced message system with better animations
    const showMessage = (text, type = 'success') => {
        const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
        const icon = type === 'success' ? '✅' : '❌';
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert ${alertClass} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = `
      top: 20px; 
      right: 20px; 
      z-index: 9999; 
      min-width: 350px; 
      box-shadow: 0 10px 35px rgba(0,0,0,0.15);
      border-radius: 15px;
      border: none;
      backdrop-filter: blur(10px);
      animation: slideInRight 0.3s ease-out;
    `;
        alertDiv.innerHTML = `
      <div class="d-flex align-items-center">
        <span class="me-2" style="font-size: 1.2rem;">${icon}</span>
        <strong class="flex-grow-1">${text}</strong>
        <button type="button" class="btn-close ms-2" data-bs-dismiss="alert"></button>
      </div>
    `;
        // Add custom styles for animation
        if (!document.querySelector('#alert-animations')) {
            const style = document.createElement('style');
            style.id = 'alert-animations';
            style.textContent = `
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
            document.head.appendChild(style);
        }
        document.body.appendChild(alertDiv);
        // Auto remove with animation
        setTimeout(() => {
            alertDiv.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => alertDiv.remove(), 300);
        }, 4000);
    };
    async function load(p = page) {
        setLoading(true);
        try {
            const { data, total } = await ContractApi.list({ page: p, pageSize });
            setRows(Array.isArray(data) ? data : []);
            setTotal(Number(total ?? 0));
        }
        catch (e) {
            showMessage(e?.message || 'Không tải được danh sách hợp đồng', 'error');
            setRows([]);
            setTotal(0);
        }
        finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        load(1);
    }, []);
    useEffect(() => {
        load(page);
    }, [page]);
    const onDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa hợp đồng này?'))
            return;
        try {
            await ContractApi.remove(id);
            showMessage('Đã xóa hợp đồng thành công');
            const nextPage = rows.length === 1 && page > 1 ? page - 1 : page;
            setPage(nextPage);
            load(nextPage);
        }
        catch (e) {
            showMessage(e?.message || 'Xóa thất bại', 'error');
        }
    };
    const onExport = async (id) => {
        try {
            await ContractApi.exportWord(id);
            showMessage('Đã xuất file Word thành công');
        }
        catch (error) {
            console.error('Export error:', error);
            if (error?.response?.status === 500) {
                showMessage('Lỗi server: Thư mục exports chưa được tạo. Vui lòng liên hệ admin.', 'error');
            }
            else {
                showMessage('Xuất file thất bại', 'error');
            }
        }
    };
    const getStatusBadge = (status) => {
        const statusConfig = {
            valid: { class: 'bg-success', text: 'Còn hiệu lực', icon: '✅' },
            expired: { class: 'bg-warning text-dark', text: 'Hết hạn', icon: '⚠️' },
            terminated: { class: 'bg-danger', text: 'Đã chấm dứt', icon: '❌' },
        };
        return statusConfig[status] || statusConfig.terminated;
    };
    const totalPages = Math.ceil(total / pageSize);
    const renderPagination = () => {
        if (totalPages <= 1)
            return null;
        const pages = [];
        const startPage = Math.max(1, page - 2);
        const endPage = Math.min(totalPages, page + 2);
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return (_jsx("nav", { className: "d-flex justify-content-center mt-4", "aria-label": "Pagination", children: _jsxs("ul", { className: "pagination pagination-lg shadow-sm", children: [_jsx("li", { className: `page-item ${page === 1 ? 'disabled' : ''}`, children: _jsx("button", { className: "page-link border-0 bg-light text-primary fw-bold", onClick: () => page > 1 && setPage(page - 1), disabled: page === 1, "aria-label": "Trang tr\u01B0\u1EDBc", children: "\u2190 Tr\u01B0\u1EDBc" }) }), startPage > 1 && (_jsxs(_Fragment, { children: [_jsx("li", { className: "page-item", children: _jsx("button", { className: "page-link border-0", onClick: () => setPage(1), children: "1" }) }), startPage > 2 && (_jsx("li", { className: "page-item disabled", children: _jsx("span", { className: "page-link border-0", children: "..." }) }))] })), pages.map((p) => (_jsx("li", { className: `page-item ${p === page ? 'active' : ''}`, children: _jsx("button", { className: `page-link border-0 ${p === page ? 'bg-primary text-white' : 'text-primary'}`, onClick: () => setPage(p), children: p }) }, p))), endPage < totalPages && (_jsxs(_Fragment, { children: [endPage < totalPages - 1 && (_jsx("li", { className: "page-item disabled", children: _jsx("span", { className: "page-link border-0", children: "..." }) })), _jsx("li", { className: "page-item", children: _jsx("button", { className: "page-link border-0", onClick: () => setPage(totalPages), children: totalPages }) })] })), _jsx("li", { className: `page-item ${page === totalPages ? 'disabled' : ''}`, children: _jsx("button", { className: "page-link border-0 bg-light text-primary fw-bold", onClick: () => page < totalPages && setPage(page + 1), disabled: page === totalPages, "aria-label": "Trang sau", children: "Sau \u2192" }) })] }) }));
    };
    // Enhanced modal close handler
    const handleModalClose = (setter) => {
        return (e) => {
            if (e.target === e.currentTarget) {
                setter(false);
            }
        };
    };
    return (_jsxs("div", { className: "container-fluid py-4", children: [_jsx("div", { className: "row mb-4", children: _jsx("div", { className: "col-12", children: _jsx("div", { className: "card border-0 shadow-lg bg-gradient", style: {
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        }, children: _jsx("div", { className: "card-body p-4", children: _jsxs("div", { className: "d-flex justify-content-between align-items-center flex-wrap", children: [_jsxs("div", { className: "text-black mb-3 mb-md-0", children: [_jsxs("h1", { className: "h2 mb-2 fw-bold d-flex align-items-center", children: [_jsx("span", { className: "me-2", children: "\uD83D\uDCCB" }), "Qu\u1EA3n l\u00FD h\u1EE3p \u0111\u1ED3ng"] }), _jsxs("p", { className: "mb-0 opacity-75 d-flex align-items-center text-black", children: [_jsx("span", { className: "me-2", children: "\uD83D\uDCCA" }), "T\u1ED5ng c\u1ED9ng", ' ', _jsx("span", { className: "fw-bold mx-1", children: total.toLocaleString() }), ' ', "h\u1EE3p \u0111\u1ED3ng"] })] }), _jsxs("div", { className: "d-flex gap-3 flex-wrap", children: [_jsxs(Link, { to: "/", className: "btn btn-outline-light btn-lg px-4 py-2 shadow-sm border-2 fw-bold d-flex align-items-center text-black gap-2", style: { borderRadius: '50px' }, children: [_jsx("span", { children: "\uD83C\uDFE0" }), "Trang ch\u1EE7"] }), _jsxs("button", { onClick: () => setOpenCreate(true), className: "btn btn-light btn-lg px-4 py-2 shadow-sm border-0 fw-bold d-flex align-items-center gap-2", style: { borderRadius: '50px' }, children: [_jsx("span", { children: "\u2795" }), "Th\u00EAm h\u1EE3p \u0111\u1ED3ng"] })] })] }) }) }) }) }), _jsx("div", { className: "row", children: _jsx("div", { className: "col-12", children: _jsxs("div", { className: "card border-0 shadow-lg", children: [_jsx("div", { className: "card-body p-0", children: loading ? (_jsxs("div", { className: "text-center py-5", children: [_jsx("div", { className: "spinner-border text-primary mb-3", style: { width: '3rem', height: '3rem' }, role: "status", children: _jsx("span", { className: "visually-hidden", children: "\u0110ang t\u1EA3i..." }) }), _jsx("h5", { className: "text-muted", children: "\u0110ang t\u1EA3i danh s\u00E1ch h\u1EE3p \u0111\u1ED3ng..." }), _jsx("p", { className: "text-muted small", children: "Vui l\u00F2ng ch\u1EDD trong gi\u00E2y l\u00E1t" })] })) : (_jsx("div", { className: "table-responsive", children: _jsxs("table", { className: "table table-hover align-middle mb-0", children: [_jsx("thead", { className: "table-dark", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3 fw-bold", style: { width: '100px' }, children: "\uD83C\uDFF7\uFE0F M\u00E3 H\u0110" }), _jsx("th", { className: "px-4 py-3 fw-bold", children: "\uD83D\uDC64 Nh\u00E2n vi\u00EAn" }), _jsx("th", { className: "px-4 py-3 fw-bold", children: "\uD83D\uDCC4 Lo\u1EA1i H\u0110" }), _jsx("th", { className: "px-4 py-3 fw-bold", children: "\uD83D\uDCC5 B\u1EAFt \u0111\u1EA7u" }), _jsx("th", { className: "px-4 py-3 fw-bold", children: "\uD83D\uDCC5 K\u1EBFt th\u00FAc" }), _jsx("th", { className: "px-4 py-3 fw-bold", children: "\uD83C\uDFC3 Tr\u1EA1ng th\u00E1i" }), _jsx("th", { className: "px-4 py-3 fw-bold text-center", style: { width: '220px' }, children: "\u2699\uFE0F T\u00E1c v\u1EE5" })] }) }), _jsx("tbody", { children: rows.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 7, className: "text-center py-5", children: _jsxs("div", { className: "py-4", children: [_jsx("div", { className: "mb-3", style: { fontSize: '4rem', opacity: 0.3 }, children: "\uD83D\uDCCB" }), _jsx("h5", { className: "text-muted", children: "Ch\u01B0a c\u00F3 h\u1EE3p \u0111\u1ED3ng n\u00E0o" }), _jsx("p", { className: "text-muted mb-3", children: "H\u00E3y th\u00EAm h\u1EE3p \u0111\u1ED3ng \u0111\u1EA7u ti\u00EAn c\u1EE7a b\u1EA1n" }), _jsxs("button", { onClick: () => setOpenCreate(true), className: "btn btn-primary btn-lg px-4", style: { borderRadius: '50px' }, children: [_jsx("span", { className: "me-2", children: "\u2795" }), "T\u1EA1o h\u1EE3p \u0111\u1ED3ng m\u1EDBi"] })] }) }) })) : (rows.map((contract, index) => {
                                                    const statusConfig = getStatusBadge(contract.status);
                                                    return (_jsxs("tr", { className: "border-bottom", style: { transition: 'all 0.2s ease' }, children: [_jsx("td", { className: "px-4 py-3", children: _jsx("div", { className: "d-flex align-items-center", children: _jsxs("span", { className: "badge bg-primary rounded-pill px-3 py-2 fw-bold", children: ["#", contract.id] }) }) }), _jsx("td", { className: "px-4 py-3", children: _jsxs("div", { className: "d-flex align-items-center", children: [_jsx("div", { className: "bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3 fw-bold", style: {
                                                                                width: '40px',
                                                                                height: '40px',
                                                                                fontSize: '14px',
                                                                            }, children: (contract.employee?.full_name?.charAt(0) ||
                                                                                'U').toUpperCase() }), _jsxs("div", { children: [_jsx("div", { className: "fw-semibold text-dark", children: contract.employee?.full_name ||
                                                                                        `Nhân viên #${contract.employee_id}` }), _jsxs("small", { className: "text-muted", children: ["ID: ", contract.employee_id] })] })] }) }), _jsx("td", { className: "px-4 py-3", children: _jsx("span", { className: "badge bg-light text-dark border px-3 py-2 rounded-pill", children: contract.contract_type || 'Chưa xác định' }) }), _jsx("td", { className: "px-4 py-3", children: contract.start_date ? (_jsxs("div", { className: "d-flex align-items-center", children: [_jsx("span", { className: "text-success me-1", children: "\uD83D\uDFE2" }), _jsx("span", { className: "fw-medium", children: dayjs(contract.start_date).format('DD/MM/YYYY') })] })) : (_jsx("span", { className: "text-muted", children: "\u2014" })) }), _jsx("td", { className: "px-4 py-3", children: contract.end_date ? (_jsxs("div", { className: "d-flex align-items-center", children: [_jsx("span", { className: "text-warning me-1", children: "\uD83D\uDFE1" }), _jsx("span", { className: "fw-medium", children: dayjs(contract.end_date).format('DD/MM/YYYY') })] })) : (_jsx("span", { className: "text-muted", children: "\u2014" })) }), _jsx("td", { className: "px-4 py-3", children: _jsxs("span", { className: `badge ${statusConfig.class} px-3 py-2 rounded-pill fw-medium`, children: [statusConfig.icon, " ", statusConfig.text] }) }), _jsx("td", { className: "px-4 py-3", children: _jsxs("div", { className: "btn-group shadow-sm", role: "group", children: [_jsx("button", { onClick: () => setEditRow(contract), className: "btn btn-outline-primary btn-sm fw-medium", title: "Ch\u1EC9nh s\u1EEDa h\u1EE3p \u0111\u1ED3ng", children: "\u270F\uFE0F S\u1EEDa" }), _jsx("button", { onClick: () => onExport(contract.id), className: "btn btn-outline-success btn-sm fw-medium", title: "Xu\u1EA5t file Word", children: "\uD83D\uDCC4 Word" }), _jsx("button", { onClick: () => onDelete(contract.id), className: "btn btn-outline-danger btn-sm fw-medium", title: "X\u00F3a h\u1EE3p \u0111\u1ED3ng", children: "\uD83D\uDDD1\uFE0F X\u00F3a" })] }) })] }, contract.id));
                                                })) })] }) })) }), !loading && rows.length > 0 && (_jsx("div", { className: "card-footer bg-light border-0 py-3", children: _jsxs("div", { className: "d-flex justify-content-between align-items-center flex-wrap", children: [_jsxs("div", { className: "text-muted small mb-2 mb-md-0", children: ["Hi\u1EC3n th\u1ECB ", _jsx("strong", { children: (page - 1) * pageSize + 1 }), " -", ' ', _jsx("strong", { children: Math.min(page * pageSize, total) }), "trong t\u1ED5ng s\u1ED1 ", _jsx("strong", { children: total.toLocaleString() }), " h\u1EE3p \u0111\u1ED3ng"] }), renderPagination()] }) }))] }) }) }), openCreate && (_jsx("div", { className: "modal fade show d-block", style: { backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }, tabIndex: -1, onClick: handleModalClose(() => setOpenCreate(false)), children: _jsx("div", { className: "modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable", children: _jsxs("div", { className: "modal-content border-0 shadow-lg", style: { borderRadius: '20px', zIndex: 1051 }, onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "modal-header border-0 bg-success text-white", style: { borderRadius: '20px 20px 0 0' }, children: [_jsxs("h4", { className: "modal-title fw-bold d-flex align-items-center", children: [_jsx("span", { className: "me-2", children: "\u2795" }), "Th\u00EAm h\u1EE3p \u0111\u1ED3ng m\u1EDBi"] }), _jsx("button", { type: "button", className: "btn-close btn-close-white", onClick: () => setOpenCreate(false) })] }), _jsx("div", { className: "modal-body p-4", style: { maxHeight: '70vh', overflowY: 'auto' }, children: _jsx(ContractForm, { initial: null, onSuccess: () => {
                                        setOpenCreate(false);
                                        load(page);
                                        showMessage('🎉 Thêm hợp đồng thành công!');
                                    } }) })] }) }) })), editRow && (_jsx("div", { className: "modal fade show d-block", style: { backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }, tabIndex: -1, onClick: handleModalClose(() => setEditRow(null)), children: _jsx("div", { className: "modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable", children: _jsxs("div", { className: "modal-content border-0 shadow-lg", style: { borderRadius: '20px', zIndex: 1051 }, onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "modal-header border-0 bg-warning text-dark", style: { borderRadius: '20px 20px 0 0' }, children: [_jsxs("h4", { className: "modal-title fw-bold d-flex align-items-center", children: [_jsx("span", { className: "me-2", children: "\u270F\uFE0F" }), "S\u1EEDa h\u1EE3p \u0111\u1ED3ng #", editRow.id] }), _jsx("button", { type: "button", className: "btn-close", onClick: () => setEditRow(null) })] }), _jsx("div", { className: "modal-body p-4", style: { maxHeight: '70vh', overflowY: 'auto' }, children: _jsx(ContractForm, { initial: editRow, onSuccess: () => {
                                        setEditRow(null);
                                        load(page);
                                        showMessage('🎉 Cập nhật hợp đồng thành công!');
                                    } }) })] }) }) }))] }));
}
