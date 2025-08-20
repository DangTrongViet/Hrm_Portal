import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { ContractApi } from '../api';
import type { Contract } from '../type';
import ContractForm from '../components/ContractForm';
import { Link } from 'react-router-dom';
import '../../../../public/css/contract/ContractListPage.css';

export default function ContractListPage() {
  const [rows, setRows] = useState<Contract[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // modal state
  const [openCreate, setOpenCreate] = useState(false);
  const [editRow, setEditRow] = useState<Contract | null>(null);

  const pageSize = 20;

  // Enhanced message system with better animations
  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
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
    } catch (e: any) {
      showMessage(e?.message || 'Không tải được danh sách hợp đồng', 'error');
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1);
  }, []);
  useEffect(() => {
    load(page);
  }, [page]);

  const onDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa hợp đồng này?')) return;

    try {
      await ContractApi.remove(id);
      showMessage('Đã xóa hợp đồng thành công');
      const nextPage = rows.length === 1 && page > 1 ? page - 1 : page;
      setPage(nextPage);
      load(nextPage);
    } catch (e: any) {
      showMessage(e?.message || 'Xóa thất bại', 'error');
    }
  };

  const onExport = async (id: number) => {
    try {
      await ContractApi.exportWord(id);
      showMessage('Đã xuất file Word thành công');
    } catch (error: any) {
      console.error('Export error:', error);
      if (error?.response?.status === 500) {
        showMessage(
          'Lỗi server: Thư mục exports chưa được tạo. Vui lòng liên hệ admin.',
          'error'
        );
      } else {
        showMessage('Xuất file thất bại', 'error');
      }
    }
  };

  const getStatusBadge = (status: Contract['status']) => {
    const statusConfig = {
      valid: { class: 'bg-success', text: 'Còn hiệu lực', icon: '✅' },
      expired: { class: 'bg-warning text-dark', text: 'Hết hạn', icon: '⚠️' },
      terminated: { class: 'bg-danger', text: 'Đã chấm dứt', icon: '❌' },
    };
    return statusConfig[status] || statusConfig.terminated;
  };

  const totalPages = Math.ceil(total / pageSize);

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(totalPages, page + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <nav
        className="d-flex justify-content-center mt-4"
        aria-label="Pagination"
      >
        <ul className="pagination pagination-lg shadow-sm">
          <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
            <button
              className="page-link border-0 bg-light text-primary fw-bold"
              onClick={() => page > 1 && setPage(page - 1)}
              disabled={page === 1}
              aria-label="Trang trước"
            >
              ← Trước
            </button>
          </li>

          {startPage > 1 && (
            <>
              <li className="page-item">
                <button
                  className="page-link border-0"
                  onClick={() => setPage(1)}
                >
                  1
                </button>
              </li>
              {startPage > 2 && (
                <li className="page-item disabled">
                  <span className="page-link border-0">...</span>
                </li>
              )}
            </>
          )}

          {pages.map((p) => (
            <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
              <button
                className={`page-link border-0 ${p === page ? 'bg-primary text-white' : 'text-primary'}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            </li>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <li className="page-item disabled">
                  <span className="page-link border-0">...</span>
                </li>
              )}
              <li className="page-item">
                <button
                  className="page-link border-0"
                  onClick={() => setPage(totalPages)}
                >
                  {totalPages}
                </button>
              </li>
            </>
          )}

          <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
            <button
              className="page-link border-0 bg-light text-primary fw-bold"
              onClick={() => page < totalPages && setPage(page + 1)}
              disabled={page === totalPages}
              aria-label="Trang sau"
            >
              Sau →
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  // Enhanced modal close handler
  const handleModalClose = (setter: (value: any) => void) => {
    return (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        setter(false);
      }
    };
  };

  return (
    <div className="container-fluid py-4">
      {/* Enhanced Header Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div
            className="card border-0 shadow-lg bg-gradient"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap">
                <div className="text-black mb-3 mb-md-0">
                  <h1 className="h2 mb-2 fw-bold d-flex align-items-center">
                    <span className="me-2">📋</span>
                    Quản lý hợp đồng
                  </h1>
                  <p className="mb-0 opacity-75 d-flex align-items-center text-black">
                    <span className="me-2">📊</span>
                    Tổng cộng{' '}
                    <span className="fw-bold mx-1">
                      {total.toLocaleString()}
                    </span>{' '}
                    hợp đồng
                  </p>
                </div>
                <div className="d-flex gap-3 flex-wrap">
                  <Link
                    to="/"
                    className="btn btn-outline-light btn-lg px-4 py-2 shadow-sm border-2 fw-bold d-flex align-items-center text-black gap-2"
                    style={{ borderRadius: '50px' }}
                  >
                    <span>🏠</span>
                    Trang chủ
                  </Link>
                  <button
                    onClick={() => setOpenCreate(true)}
                    className="btn btn-light btn-lg px-4 py-2 shadow-sm border-0 fw-bold d-flex align-items-center gap-2"
                    style={{ borderRadius: '50px' }}
                  >
                    <span>➕</span>
                    Thêm hợp đồng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Table Section */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-lg">
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div
                    className="spinner-border text-primary mb-3"
                    style={{ width: '3rem', height: '3rem' }}
                    role="status"
                  >
                    <span className="visually-hidden">Đang tải...</span>
                  </div>
                  <h5 className="text-muted">Đang tải danh sách hợp đồng...</h5>
                  <p className="text-muted small">
                    Vui lòng chờ trong giây lát
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th
                          className="px-4 py-3 fw-bold"
                          style={{ width: '100px' }}
                        >
                          🏷️ Mã HĐ
                        </th>
                        <th className="px-4 py-3 fw-bold">👤 Nhân viên</th>
                        <th className="px-4 py-3 fw-bold">📄 Loại HĐ</th>
                        <th className="px-4 py-3 fw-bold">📅 Bắt đầu</th>
                        <th className="px-4 py-3 fw-bold">📅 Kết thúc</th>
                        <th className="px-4 py-3 fw-bold">🏃 Trạng thái</th>
                        <th
                          className="px-4 py-3 fw-bold text-center"
                          style={{ width: '220px' }}
                        >
                          ⚙️ Tác vụ
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-5">
                            <div className="py-4">
                              <div
                                className="mb-3"
                                style={{ fontSize: '4rem', opacity: 0.3 }}
                              >
                                📋
                              </div>
                              <h5 className="text-muted">
                                Chưa có hợp đồng nào
                              </h5>
                              <p className="text-muted mb-3">
                                Hãy thêm hợp đồng đầu tiên của bạn
                              </p>
                              <button
                                onClick={() => setOpenCreate(true)}
                                className="btn btn-primary btn-lg px-4"
                                style={{ borderRadius: '50px' }}
                              >
                                <span className="me-2">➕</span>
                                Tạo hợp đồng mới
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        rows.map((contract: Contract, index: number) => {
                          const statusConfig = getStatusBadge(contract.status);
                          return (
                            <tr
                              key={contract.id}
                              className="border-bottom"
                              style={{ transition: 'all 0.2s ease' }}
                            >
                              <td className="px-4 py-3">
                                <div className="d-flex align-items-center">
                                  <span className="badge bg-primary rounded-pill px-3 py-2 fw-bold">
                                    #{contract.id}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="d-flex align-items-center">
                                  <div
                                    className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3 fw-bold"
                                    style={{
                                      width: '40px',
                                      height: '40px',
                                      fontSize: '14px',
                                    }}
                                  >
                                    {(
                                      contract.employee?.full_name?.charAt(0) ||
                                      'U'
                                    ).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="fw-semibold text-dark">
                                      {contract.employee?.full_name ||
                                        `Nhân viên #${contract.employee_id}`}
                                    </div>
                                    <small className="text-muted">
                                      ID: {contract.employee_id}
                                    </small>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="badge bg-light text-dark border px-3 py-2 rounded-pill">
                                  {contract.contract_type || 'Chưa xác định'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {contract.start_date ? (
                                  <div className="d-flex align-items-center">
                                    <span className="text-success me-1">
                                      🟢
                                    </span>
                                    <span className="fw-medium">
                                      {dayjs(contract.start_date).format(
                                        'DD/MM/YYYY'
                                      )}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-muted">—</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {contract.end_date ? (
                                  <div className="d-flex align-items-center">
                                    <span className="text-warning me-1">
                                      🟡
                                    </span>
                                    <span className="fw-medium">
                                      {dayjs(contract.end_date).format(
                                        'DD/MM/YYYY'
                                      )}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-muted">—</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`badge ${statusConfig.class} px-3 py-2 rounded-pill fw-medium`}
                                >
                                  {statusConfig.icon} {statusConfig.text}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div
                                  className="btn-group shadow-sm"
                                  role="group"
                                >
                                  <button
                                    onClick={() => setEditRow(contract)}
                                    className="btn btn-outline-primary btn-sm fw-medium"
                                    title="Chỉnh sửa hợp đồng"
                                  >
                                    ✏️ Sửa
                                  </button>
                                  <button
                                    onClick={() => onExport(contract.id)}
                                    className="btn btn-outline-success btn-sm fw-medium"
                                    title="Xuất file Word"
                                  >
                                    📄 Word
                                  </button>
                                  <button
                                    onClick={() => onDelete(contract.id)}
                                    className="btn btn-outline-danger btn-sm fw-medium"
                                    title="Xóa hợp đồng"
                                  >
                                    🗑️ Xóa
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Enhanced Pagination Footer */}
            {!loading && rows.length > 0 && (
              <div className="card-footer bg-light border-0 py-3">
                <div className="d-flex justify-content-between align-items-center flex-wrap">
                  <div className="text-muted small mb-2 mb-md-0">
                    Hiển thị <strong>{(page - 1) * pageSize + 1}</strong> -{' '}
                    <strong>{Math.min(page * pageSize, total)}</strong>
                    trong tổng số <strong>{total.toLocaleString()}</strong> hợp
                    đồng
                  </div>
                  {renderPagination()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Create Modal */}
      {openCreate && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}
          tabIndex={-1}
          onClick={handleModalClose(() => setOpenCreate(false))}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div
              className="modal-content border-0 shadow-lg"
              style={{ borderRadius: '20px', zIndex: 1051 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="modal-header border-0 bg-success text-white"
                style={{ borderRadius: '20px 20px 0 0' }}
              >
                <h4 className="modal-title fw-bold d-flex align-items-center">
                  <span className="me-2">➕</span>
                  Thêm hợp đồng mới
                </h4>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setOpenCreate(false)}
                ></button>
              </div>
              <div
                className="modal-body p-4"
                style={{ maxHeight: '70vh', overflowY: 'auto' }}
              >
                <ContractForm
                  initial={null}
                  onSuccess={() => {
                    setOpenCreate(false);
                    load(page);
                    showMessage('🎉 Thêm hợp đồng thành công!');
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Edit Modal */}
      {editRow && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}
          tabIndex={-1}
          onClick={handleModalClose(() => setEditRow(null))}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div
              className="modal-content border-0 shadow-lg"
              style={{ borderRadius: '20px', zIndex: 1051 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="modal-header border-0 bg-warning text-dark"
                style={{ borderRadius: '20px 20px 0 0' }}
              >
                <h4 className="modal-title fw-bold d-flex align-items-center">
                  <span className="me-2">✏️</span>
                  Sửa hợp đồng #{editRow.id}
                </h4>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEditRow(null)}
                ></button>
              </div>
              <div
                className="modal-body p-4"
                style={{ maxHeight: '70vh', overflowY: 'auto' }}
              >
                <ContractForm
                  initial={editRow}
                  onSuccess={() => {
                    setEditRow(null);
                    load(page);
                    showMessage('🎉 Cập nhật hợp đồng thành công!');
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
