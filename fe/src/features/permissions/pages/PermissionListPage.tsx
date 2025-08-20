import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getJSON,
  postJSON,
  patchJSON,
  delJSON,
  buildQuery,
} from '../../../lib/http';
import { debounce } from 'lodash';
import type { Permission } from '../../../types/rbac';
import '../../../../public/css/permissions/PermissionListPage.css';

type PermRow = Permission;
type Resp = {
  data: PermRow[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export default function PermissionsListPage() {
  const nav = useNavigate();

  // Query + Paging
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Data
  const [list, setList] = useState<PermRow[]>([]);
  const [pagination, setPagination] = useState<Resp['pagination']>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 1,
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  // Modal create/edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PermRow | null>(null);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const canSave = useMemo(() => name.trim().length > 0, [name]);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const load = useMemo(
    () =>
      debounce(async () => {
        setLoading(true);
        setErr('');
        try {
          const params = buildQuery({ q, page, pageSize, _t: Date.now() });
          const res = await getJSON<Resp>(`/permissions${params}`);
          setList(Array.isArray(res?.data) ? res.data : []);
          setPagination(
            res?.pagination ?? { page, pageSize, total: 0, totalPages: 1 }
          );
        } catch (e: any) {
          setErr(e?.message || 'Không tải được permissions');
        } finally {
          setLoading(false);
        }
      }, 250),
    [q, page, pageSize]
  );

  useEffect(() => {
    load();
    return () => load.cancel();
  }, [load]);

  // open modal for create
  const openCreate = () => {
    setEditing(null);
    setName('');
    setDesc('');
    setModalOpen(true);
    setTimeout(() => nameInputRef.current?.focus(), 50);
  };

  // open modal for edit
  const openEdit = (p: PermRow) => {
    setEditing(p);
    setName(p.name);
    setDesc(p.description ?? '');
    setModalOpen(true);
    setTimeout(() => nameInputRef.current?.focus(), 50);
  };

  // save modal
  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    try {
      if (editing) {
        await patchJSON(`/permissions/${editing.id}`, {
          name: name.trim(),
          description: desc.trim() || null,
        });
      } else {
        await postJSON(`/permissions`, {
          name: name.trim(),
          description: desc.trim() || null,
        });
      }
      setModalOpen(false);
      setEditing(null);
      setName('');
      setDesc('');
      await load();
    } catch (e: any) {
      setErr(e?.message || 'Lưu thất bại');
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm('Xoá permission này? Hành động không thể hoàn tác.')) return;
    try {
      await delJSON(`/permissions/${id}`);
      await load();
    } catch (e: any) {
      setErr(e?.message || 'Xoá thất bại');
    }
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    load();
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
        >
          {i}
        </button>
      );
    }

    return (
      <div className="btn-group">
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
    <div className="hrm-container">
      <div className="container">
        {/* Header */}
        <div className="perm-header card shadow-sm border-0 mb-4">
          <div className="card-body p-4 d-flex align-items-center justify-content-between">
            <div>
              <h1 className="h4 mb-1 text-white">
                <i className="bi bi-shield-lock me-2"></i> Quản lý quyền
              </h1>
              <div className="text-white-50 small">
                Tổng: <strong>{pagination.total}</strong> — Trang{' '}
                <strong>{pagination.page}</strong>/
                <strong>{pagination.totalPages}</strong>
              </div>
            </div>
            <div className="d-flex gap-2">
              <button
                onClick={() => nav(-1)}
                className="btn btn-outline-light btn-sm rounded-pill px-3"
              >
                ↩ Trở lại
              </button>
              <button
                onClick={openCreate}
                className="btn btn-light btn-sm rounded-pill px-3"
              >
                + Tạo quyền
              </button>
              <Link
                to="/permissions/new"
                className="btn btn-success btn-sm rounded-pill px-3"
              >
                Tạo bằng trang riêng
              </Link>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <form
          onSubmit={onSearch}
          className="perm-toolbar row g-2 align-items-center mb-3"
        >
          <div className="col-12 col-md">
            <div className="position-relative">
              <i className="bi bi-search perm-search-icon"></i>
              <input
                className="form-control shadow-sm ps-5"
                placeholder="Tìm theo tên quyền…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>
          <div className="col-6 col-md-auto">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="form-select shadow-sm"
            >
              <option value="10">10 / trang</option>
              <option value="20">20 / trang</option>
              <option value="50">50 / trang</option>
              <option value="100">100 / trang</option>
            </select>
          </div>
          <div className="col-6 col-md-auto text-end">
            <button className="btn btn-primary rounded-pill px-4 shadow-sm">
              Tìm
            </button>
          </div>
        </form>

        {/* Error toast */}
        {err && (
          <div className="alert alert-danger bg-danger-subtle border-danger-subtle d-flex align-items-center justify-content-between">
            <span>{err}</span>
            <button
              onClick={() => setErr('')}
              className="btn-close"
              aria-label="Close"
            ></button>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="text-center text-secondary-emphasis py-5">
            <div
              className="spinner-border text-primary"
              style={{ width: '3rem', height: '3rem' }}
              role="status"
            >
              <span className="visually-hidden">Đang tải…</span>
            </div>
            <p className="mt-3">Đang tải danh sách permissions...</p>
          </div>
        ) : (
          <div className="card shadow-sm border-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">ID</th>
                    <th>Tên</th>
                    <th>Mô tả</th>
                    <th className="text-end pe-4">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((p, idx) => (
                    <tr
                      key={p.id}
                      className={idx % 2 === 0 ? 'table-striped-light' : ''}
                    >
                      <td className="ps-4">{p.id}</td>
                      <td className="fw-medium text-primary-emphasis">
                        {p.name}
                      </td>
                      <td className="text-secondary">{p.description ?? '—'}</td>
                      <td className="text-end pe-4">
                        <div className="btn-group">
                          <button
                            onClick={() => openEdit(p)}
                            className="btn btn-outline-primary btn-sm rounded-pill px-3"
                            title="Sửa nhanh"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => onDelete(p.id)}
                            className="btn btn-outline-danger btn-sm rounded-pill px-3"
                            title="Xoá"
                          >
                            Xoá
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!list.length && (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center text-secondary-emphasis py-4"
                      >
                        Không có dữ liệu
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="card-footer bg-white d-flex justify-content-between align-items-center">
              <small className="text-muted">
                Tổng: {pagination.total} — Trang {pagination.page}/
                {pagination.totalPages}
              </small>
              {renderPagination()}
            </div>
          </div>
        )}

        {/* Modal create/edit */}
        {modalOpen && (
          <div
            className="modal fade show"
            style={{ display: 'block', background: 'rgba(0,0,0,.35)' }}
            tabIndex={-1}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content shadow-lg">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editing ? 'Sửa quyền' : 'Tạo quyền'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setModalOpen(false)}
                    aria-label="Close"
                  />
                </div>
                <form onSubmit={onSave}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Tên *</label>
                      <input
                        ref={nameInputRef}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="form-control"
                        required
                      />
                      {name.length > 0 && name.trim().length === 0 && (
                        <div className="form-text text-danger">
                          Tên không hợp lệ
                        </div>
                      )}
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Mô tả</label>
                      <input
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        className="form-control"
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setModalOpen(false)}
                    >
                      Huỷ
                    </button>
                    <button
                      type="submit"
                      disabled={!canSave}
                      className="btn btn-primary"
                    >
                      Lưu
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
