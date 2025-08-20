import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getJSON, delJSON, buildQuery } from '../../../lib/http';
import { debounce } from 'lodash';
import type { Role } from '../../../types/rbac';
import '../../../../public/css/roles/RolesListPage.css';

type Row = Role;
type Resp = {
  data: Row[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export default function RolesListPage() {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [list, setList] = useState<Row[]>([]);
  const [pagination, setPagination] = useState<Resp['pagination']>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  // debounced loader phụ thuộc q, page, pageSize
  const load = useMemo(
    () =>
      debounce(async (qVal: string, pageVal: number, pageSizeVal: number) => {
        setLoading(true);
        setErr('');
        try {
          const params = buildQuery({
            q: qVal,
            page: pageVal,
            pageSize: pageSizeVal,
            _t: Date.now(),
          });
          const res = await getJSON<Resp>(`/roles${params}`);
          setList(Array.isArray(res?.data) ? res.data : []);
          setPagination(
            res?.pagination ?? {
              page: 1,
              pageSize: pageSizeVal,
              total: 0,
              totalPages: 1,
            }
          );
        } catch (e: any) {
          setErr(e?.message || 'Không tải được danh sách vai trò');
        } finally {
          setLoading(false);
        }
      }, 300),
    []
  );

  // gọi load khi state thay đổi (tránh gọi load ngay sau setState)
  useEffect(() => {
    load(q, page, pageSize);
    return () => load.cancel();
  }, [q, page, pageSize, load]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Chỉ reset page, effect ở trên sẽ gọi load với state mới
    setPage(1);
  };

  const onClear = () => {
    setQ('');
    setPage(1);
  };

  const onRefresh = () => {
    load.flush?.(); // chạy ngay nếu đang debounce
    load(q, page, pageSize);
  };

  const onDelete = async (id: number) => {
    if (!confirm('Xoá vai trò này? Hành động không thể hoàn tác.')) return;
    try {
      await delJSON(`/roles/${id}`);
      // sau khi xoá, nếu trang hiện tại rỗng thì lùi trang
      const remaining = list.length - 1;
      if (remaining === 0 && page > 1) {
        setPage((p) => Math.max(1, p - 1));
      } else {
        onRefresh();
      }
    } catch (e: any) {
      alert(e?.message || 'Xoá thất bại');
    }
  };

  const renderPagination = () => {
    const pages = [];
    const maxPagesToShow = 5;
    const startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(
      pagination.totalPages,
      startPage + maxPagesToShow - 1
    );

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`btn hrm-btn btn-sm ${i === page ? 'hrm-button-primary' : 'btn-outline-primary'} rounded-pill px-3`}
          aria-current={i === page ? 'page' : undefined}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="btn-group" role="group" aria-label="Pagination">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="btn hrm-btn btn-outline-primary btn-sm rounded-pill px-3"
        >
          « Trước
        </button>
        {pages}
        <button
          disabled={page >= pagination.totalPages}
          onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
          className="btn hrm-btn btn-outline-primary btn-sm rounded-pill px-3"
        >
          Sau »
        </button>
      </div>
    );
  };

  return (
    <div className="hrm-container role">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 fw-bold gradient-text hrm-title">
            🔐 Quản lý vai trò
          </h1>
          <div className="hrm-action-group">
            <button
              onClick={() => nav(-1)}
              className="btn hrm-btn hrm-button-secondary btn-sm rounded-pill px-4"
            >
              ↩ Trở lại
            </button>
            <button
              onClick={onRefresh}
              className="btn hrm-btn btn-outline-primary btn-sm rounded-pill px-4"
              disabled={loading}
              title="Tải lại danh sách"
            >
              ⟳ Tải lại
            </button>
            <Link
              to="/roles/new"
              className="btn hrm-btn hrm-button-primary btn-sm rounded-pill px-4"
            >
              ➕ Tạo vai trò
            </Link>
          </div>
        </div>

        <form
          onSubmit={onSearch}
          className="d-flex gap-3 mb-4"
          role="search"
          aria-label="Tìm vai trò"
        >
          <div className="hrm-form-input-icon">
            <i className="bi bi-search" aria-hidden="true"></i>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="form-control hrm-form-input"
              placeholder="Tìm theo tên vai trò…"
              aria-label="Tìm theo tên vai trò"
            />
          </div>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="form-select hrm-form-input"
            style={{ width: '140px' }}
            aria-label="Kích thước trang"
          >
            <option value="10">10 / trang</option>
            <option value="20">20 / trang</option>
            <option value="50">50 / trang</option>
            <option value="100">100 / trang</option>
          </select>
          <button
            type="submit"
            className="btn hrm-btn hrm-button-primary rounded-pill px-4"
            disabled={loading}
          >
            <i className="bi bi-search hrm-icon"></i> Tìm
          </button>
          <button
            type="button"
            onClick={onClear}
            className="btn hrm-btn btn-outline-secondary rounded-pill px-4"
            disabled={loading && !q}
            title="Xoá từ khoá"
          >
            Xoá
          </button>
        </form>

        {err && (
          <div
            className="hrm-error mb-4 d-flex justify-content-between align-items-center"
            role="alert"
          >
            <span>{err}</span>
            <button
              onClick={() => setErr('')}
              className="btn-close"
              aria-label="Đóng thông báo"
            ></button>
          </div>
        )}

        {loading ? (
          <div className="text-center text-secondary-emphasis py-5">
            <div
              className="spinner-border text-primary"
              style={{ width: '3rem', height: '3rem' }}
              role="status"
            >
              <span className="visually-hidden">Đang tải…</span>
            </div>
            <p className="mt-3">Đang tải danh sách vai trò...</p>
          </div>
        ) : (
          <div className="hrm-table-container">
            <table className="table table-hover align-middle mb-0 hrm-table">
              <thead className="table-primary">
                <tr>
                  <th style={{ width: 80 }}>
                    <i className="bi bi-hash hrm-icon"></i>ID
                  </th>
                  <th style={{ width: 260 }}>
                    <i className="bi bi-person-badge hrm-icon"></i>Tên
                  </th>
                  <th style={{ width: 220 }}>
                    <i className="bi bi-building hrm-icon"></i>Phòng ban
                  </th>
                  <th>
                    <i className="bi bi-file-text hrm-icon"></i>Mô tả
                  </th>
                  <th className="text-end" style={{ width: 240 }}>
                    <i className="bi bi-gear hrm-icon"></i>Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.map((r, index) => (
                  <tr
                    key={r.id}
                    className={`hrm-table-row ${index % 2 === 0 ? 'bg-light' : 'bg-secondary-subtle'}`}
                  >
                    <td>{r.id}</td>
                    <td className="fw-medium text-primary-emphasis">
                      {r.name}
                      {Array.isArray(r.permissions) &&
                        r.permissions.length > 0 && (
                          <span className="ms-2 hrm-pill" title="Số quyền">
                            {r.permissions.length} quyền
                          </span>
                        )}
                    </td>

                    <td>{(r as any).department ?? '—'}</td>
                    <td className="text-truncate" style={{ maxWidth: 480 }}>
                      {(r as any).description ?? '—'}
                    </td>
                    <td className="text-end hrm-action-group">
                      <Link
                        to={`/roles/${r.id}`}
                        className="btn hrm-btn btn-outline-primary btn-sm rounded-pill px-3"
                      >
                        <i className="bi bi-eye hrm-icon"></i>Xem
                      </Link>
                      <Link
                        to={`/roles/${r.id}/edit`}
                        className="btn hrm-btn btn-outline-secondary btn-sm rounded-pill px-3"
                      >
                        <i className="bi bi-pencil hrm-icon"></i>Sửa
                      </Link>
                      <button
                        onClick={() => onDelete(r.id)}
                        className="btn hrm-btn btn-outline-danger btn-sm rounded-pill px-3"
                      >
                        <i className="bi bi-trash hrm-icon"></i>Xoá
                      </button>
                    </td>
                  </tr>
                ))}
                {!list.length && (
                  <tr>
                    <td colSpan={5} className="text-center bg-light hrm-empty">
                      <div className="mb-2">
                        <i className="bi bi-inbox" style={{ fontSize: 28 }}></i>
                      </div>
                      Không có dữ liệu — thử xoá bộ lọc hoặc tạo vai trò mới.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center mt-4">
          <small className="text-muted">
            Tổng: {pagination.total} — Trang {pagination.page}/
            {pagination.totalPages}
          </small>
          {renderPagination()}
        </div>
      </div>
    </div>
  );
}
