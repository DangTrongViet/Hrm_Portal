import { JSX, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiGet } from '../../../lib/api';
import { debounce } from 'lodash';
import '../../../../public/css/users/UsersListPage.css';

type RoleLite = { id: number; name: string; department?: string | null };
type UserRow = {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  phoneNumber?: string | null;
  isVerified: boolean;
  createdAt: string;
  role?: RoleLite | null;
};
type ListResp = {
  data: UserRow[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

type SortKey =
  | 'name'
  | 'email'
  | 'status'
  | 'isVerified'
  | 'role'
  | 'createdAt';
type SortDir = 'asc' | 'desc';

export default function UsersListPage() {
  const nav = useNavigate();
  const [sp, setSp] = useSearchParams();

  const [rows, setRows] = useState<UserRow[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  // query params
  const page = Number(sp.get('page') || 1);
  const pageSize = Number(sp.get('pageSize') || 10);
  const q = sp.get('q') || '';
  const status = sp.get('status') || '';
  const roleName = sp.get('role') || '';

  // sorting (client-side)
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const setParam = (
    kv: Record<string, string | undefined>,
    opts?: { replace?: boolean }
  ) => {
    const next = new URLSearchParams(sp);
    Object.entries(kv).forEach(([k, v]) =>
      v ? next.set(k, v) : next.delete(k)
    );
    setSp(next, { replace: opts?.replace ?? true });
  };

  const load = useMemo(
    () =>
      debounce(async () => {
        setLoading(true);
        setErr('');
        try {
          const qs = new URLSearchParams();
          if (q) qs.set('q', q);
          if (status) qs.set('status', status);
          if (roleName) qs.set('role', roleName);
          qs.set('page', String(page));
          qs.set('pageSize', String(pageSize));
          const res = await apiGet<ListResp>(`/users?${qs.toString()}`);
          setRows(res.data);
          setPagination(res.pagination);
        } catch (e: any) {
          setErr(e?.message || 'Không tải được danh sách');
        } finally {
          setLoading(false);
        }
      }, 300),
    [q, status, roleName, page, pageSize]
  );

  useEffect(() => {
    load();
    return () => load.cancel();
  }, [load]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const val = (
      e.currentTarget.elements.namedItem('q') as HTMLInputElement
    ).value.trim();
    setParam({ q: val || undefined, page: '1' });
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedRows = useMemo(() => {
    const arr = [...rows];
    const dir = sortDir === 'asc' ? 1 : -1;
    arr.sort((a, b) => {
      const A =
        sortKey === 'role'
          ? (a.role?.name || '').toLowerCase()
          : sortKey === 'isVerified'
            ? a.isVerified
              ? 1
              : 0
            : sortKey === 'createdAt'
              ? new Date(a.createdAt).getTime()
              : // name, email, status
                String((a as any)[sortKey] ?? '').toLowerCase();

      const B =
        sortKey === 'role'
          ? (b.role?.name || '').toLowerCase()
          : sortKey === 'isVerified'
            ? b.isVerified
              ? 1
              : 0
            : sortKey === 'createdAt'
              ? new Date(b.createdAt).getTime()
              : String((b as any)[sortKey] ?? '').toLowerCase();

      if (A < B) return -1 * dir;
      if (A > B) return 1 * dir;
      return 0;
    });
    return arr;
  }, [rows, sortKey, sortDir]);

  const uniqueRoles = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => r.role?.name && set.add(r.role.name));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const renderPagination = () => {
    const pages: JSX.Element[] = [];
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
          onClick={() =>
            setParam({ ...Object.fromEntries(sp), page: String(i) })
          }
          className={`btn btn-sm ${i === page ? 'btn-primary' : 'btn-outline-primary'} px-3`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="btn-group pill-pagination">
        <button
          disabled={page <= 1}
          onClick={() =>
            setParam({
              ...Object.fromEntries(sp),
              page: String(Math.max(1, page - 1)),
            })
          }
          className="btn btn-outline-primary btn-sm px-3"
        >
          « Trước
        </button>
        {pages}
        <button
          disabled={page >= pagination.totalPages}
          onClick={() =>
            setParam({
              ...Object.fromEntries(sp),
              page: String(Math.min(pagination.totalPages, page + 1)),
            })
          }
          className="btn btn-outline-primary btn-sm px-3"
        >
          Sau »
        </button>
      </div>
    );
  };

  const copy = async (text?: string | null) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  };

  return (
    <div className="user container py-5">
      <div className="card users-card mb-5">
        <div className="card-body users-header p-5">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <h1
              className="h3 fw-bold mb-0 font-weight =700px "
              style={{ color: '#000000' }}
            >
              Quản lý người dùng
            </h1>
            <div className="d-flex gap-2">
              <button
                onClick={() => nav(-1)}
                className="btn btn-outline-light btn-sm d-flex align-items-center gap-2 hrm-btn"
              >
                <svg
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path
                    fillRule="evenodd"
                    d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"
                  />
                </svg>
                Trở lại
              </button>
              <Link
                to="/users/new"
                className="btn btn-success btn-sm d-flex align-items-center gap-2 hrm-btn"
              >
                <svg
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                </svg>
                Tạo tài khoản
              </Link>
            </div>
          </div>

          {/* Filters */}
          <form onSubmit={onSubmit} className="row g-2 mt-4 input-compact">
            <div className="col-12 col-md-6">
              <div className="input-group shadow-sm">
                <span className="input-group-text bg-white border-end-0">
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                  </svg>
                </span>
                <input
                  name="q"
                  defaultValue={q}
                  className="form-control border-start-0"
                  placeholder="Tìm tên, email hoặc SĐT"
                />
                <button type="submit" className="btn btn-primary">
                  Tìm
                </button>
              </div>
            </div>

            <div className="col-6 col-md-2">
              <select
                value={status}
                onChange={(e) =>
                  setParam({ status: e.target.value || undefined, page: '1' })
                }
                className="form-select shadow-sm"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Ngưng hoạt động</option>
              </select>
            </div>

            <div className="col-6 col-md-2">
              <select
                value={roleName}
                onChange={(e) =>
                  setParam({ role: e.target.value || undefined, page: '1' })
                }
                className="form-select shadow-sm"
              >
                <option value="">Tất cả vai trò</option>
                {uniqueRoles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-2">
              <select
                value={pageSize}
                onChange={(e) =>
                  setParam({ pageSize: e.target.value, page: '1' })
                }
                className="form-select shadow-sm"
              >
                <option value="10">10 / trang</option>
                <option value="20">20 / trang</option>
                <option value="50">50 / trang</option>
                <option value="100">100 / trang</option>
              </select>
            </div>
          </form>
        </div>

        <div className="card-body">
          {err && (
            <div
              className="alert alert-danger d-flex align-items-center gap-2 mb-4"
              role="alert"
            >
              <svg
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
              </svg>
              <span>{err}</span>
              <button
                onClick={() => setErr('')}
                className="btn-close ms-auto"
                aria-label="Close"
              ></button>
            </div>
          )}

          <div className="table-responsive shadow-sm rounded-3 hrm-table">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th
                    className="px-4 py-3 sortable"
                    onClick={() => toggleSort('name')}
                  >
                    Tên{' '}
                    <span className="sort-ind">
                      {sortKey === 'name'
                        ? sortDir === 'asc'
                          ? '▲'
                          : '▼'
                        : ''}
                    </span>
                  </th>
                  <th
                    className="px-4 py-3 sortable"
                    onClick={() => toggleSort('email')}
                  >
                    Email{' '}
                    <span className="sort-ind">
                      {sortKey === 'email'
                        ? sortDir === 'asc'
                          ? '▲'
                          : '▼'
                        : ''}
                    </span>
                  </th>
                  <th
                    className="px-4 py-3 text-center sortable"
                    onClick={() => toggleSort('status')}
                  >
                    Trạng thái{' '}
                    <span className="sort-ind">
                      {sortKey === 'status'
                        ? sortDir === 'asc'
                          ? '▲'
                          : '▼'
                        : ''}
                    </span>
                  </th>
                  <th
                    className="px-4 py-3 text-center sortable"
                    onClick={() => toggleSort('isVerified')}
                  >
                    Xác minh{' '}
                    <span className="sort-ind">
                      {sortKey === 'isVerified'
                        ? sortDir === 'asc'
                          ? '▲'
                          : '▼'
                        : ''}
                    </span>
                  </th>
                  <th
                    className="px-4 py-3 text-center sortable"
                    onClick={() => toggleSort('role')}
                  >
                    Vai trò{' '}
                    <span className="sort-ind">
                      {sortKey === 'role'
                        ? sortDir === 'asc'
                          ? '▲'
                          : '▼'
                        : ''}
                    </span>
                  </th>
                  <th
                    className="px-4 py-3 text-end sortable"
                    onClick={() => toggleSort('createdAt')}
                  >
                    Tạo lúc{' '}
                    <span className="sort-ind">
                      {sortKey === 'createdAt'
                        ? sortDir === 'asc'
                          ? '▲'
                          : '▼'
                        : ''}
                    </span>
                  </th>
                  <th className="px-4 py-3">Xem</th>
                </tr>
              </thead>
              <tbody>
                {loading &&
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={`skel-${i}`}>
                      <td className="px-4 py-3">
                        <div className="skel-row" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="skel-row" />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div
                          className="skel-row mx-auto"
                          style={{ width: 90 }}
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div
                          className="skel-row mx-auto"
                          style={{ width: 70 }}
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div
                          className="skel-row mx-auto"
                          style={{ width: 120 }}
                        />
                      </td>
                      <td className="px-4 py-3 text-end">
                        <div
                          className="skel-row ms-auto"
                          style={{ width: 120 }}
                        />
                      </td>
                      <td className="px-4 py-3"></td>
                    </tr>
                  ))}

                {!loading &&
                  sortedRows.map((u, index) => (
                    <tr
                      key={u.id}
                      className={`border-bottom border-2 border-light hrm-table-row ${index % 2 === 0 ? 'bg-light' : 'bg-secondary-subtle'}`}
                    >
                      <td className="px-4 py-3 fw-medium text-primary-emphasis">
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge badge-soft">{u.id}</span>
                          {u.name}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="d-flex align-items-center gap-2">
                          <span className="text-info-emphasis">{u.email}</span>
                          <button
                            className="copy-btn"
                            title="Sao chép email"
                            onClick={() => copy(u.email)}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="currentColor"
                            >
                              <path d="M4 1.5A1.5 1.5 0 0 1 5.5 0h6A1.5 1.5 0 0 1 13 1.5v6A1.5 1.5 0 0 1 11.5 9h-6A1.5 1.5 0 0 1 4 7.5v-6z" />
                              <path d="M3 4.5A1.5 1.5 0 0 0 1.5 6v6A1.5 1.5 0 0 0 3 13.5h6A1.5 1.5 0 0 0 10.5 12V11H11v1a2.5 2.5 0 0 1-2.5 2.5h-6A2.5 2.5 0 0 1 0 12V6A2.5 2.5 0 0 1 2.5 3.5H4v1z" />
                            </svg>
                          </button>
                          {u.phoneNumber && (
                            <button
                              className="copy-btn ms-1"
                              title="Sao chép SĐT"
                              onClick={() => copy(u.phoneNumber!)}
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="currentColor"
                              >
                                <path d="M3.654 1.328a.678.678 0 0 1 1.015-.063l2.29 2.29c.329.329.445.81.294 1.243l-.805 2.3a.678.678 0 0 0 .157.69l2.457 2.457a.678.678 0 0 0 .69.157l2.3-.805a1.2 1.2 0 0 1 1.243.294l2.29 2.29a.678.678 0 0 1-.063 1.015c-1.469 1.13-3.54 1.01-5.063-.513L4.167 6.39C2.645 4.87 2.525 2.797 3.654 1.328z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`badge ${u.status === 'active' ? 'text-bg-success' : 'text-bg-warning'} bg-gradient`}
                        >
                          {u.status === 'active'
                            ? 'Đang hoạt động'
                            : 'Ngưng hoạt động'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {u.isVerified ? (
                          <svg
                            className="text-success"
                            width="18"
                            height="18"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                          >
                            <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                          </svg>
                        ) : (
                          <svg
                            className="text-danger"
                            width="18"
                            height="18"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                          >
                            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" />
                          </svg>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-secondary-emphasis">
                        {u.role?.name || '—'}
                      </td>
                      <td className="px-4 py-3 text-end">
                        <small className="text-muted">
                          {new Date(u.createdAt).toLocaleString()}
                        </small>
                      </td>
                      <td className="px-4 py-3 text-end table-actions">
                        <Link
                          to={`/users/${u.id}`}
                          className="text-decoration-none fw-medium"
                        >
                          Chi tiết
                        </Link>
                      </td>
                    </tr>
                  ))}

                {!loading && !sortedRows.length && (
                  <tr>
                    <td colSpan={7} className="px-4 py-5 text-center">
                      <div className="empty-wrap">
                        <svg
                          className="mb-2"
                          width="28"
                          height="28"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                        >
                          <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z" />
                          <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z" />
                        </svg>
                        <p className="mb-0">Không có dữ liệu phù hợp.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-4">
            <small className="text-muted">
              Tổng: {pagination.total} — Trang {pagination.page}/
              {pagination.totalPages}
            </small>
            {renderPagination()}
          </div>
        </div>
      </div>
    </div>
  );
}
