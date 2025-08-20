import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getJSON, delJSON, buildQuery } from '../../../lib/http';
import { debounce } from 'lodash';
import '../../../../public/css/employees/EmployeeListPage.css';

type Employee = {
  id: number;
  full_name: string;
  email: string | null;
  phone: string | null;
  department: string | null;
  position: string | null;
  status: 'active' | 'inactive';
  user_id: number | null;
  user?: { id: number; name: string; email: string };
  createdAt: string;
  updatedAt: string;
};

type ListResp = {
  items: Employee[];
  total: number;
  page: number;
  pageSize: number;
};

export default function EmployeesListPage() {
  const nav = useNavigate();

  const [q, setQ] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState<'' | 'active' | 'inactive'>('');
  const [sort, setSort] = useState<
    'full_name' | 'department' | 'status' | 'createdAt' | 'updatedAt'
  >('full_name');
  const [dir, setDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [data, setData] = useState<ListResp>({
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(data.total / data.pageSize)),
    [data.total, data.pageSize]
  );

  const load = useMemo(
    () =>
      debounce(async () => {
        setLoading(true);
        setErr('');
        try {
          const params = buildQuery({
            q,
            department,
            status,
            sort,
            dir,
            page,
            pageSize,
            _t: Date.now(),
          });
          const res = await getJSON<ListResp>(`/employees${params}`);
          setData(res);
        } catch (e: any) {
          setErr(e?.message || 'Không tải được danh sách nhân viên');
        } finally {
          setLoading(false);
        }
      }, 300),
    [q, department, status, sort, dir, page, pageSize]
  );

  useEffect(() => {
    load();
    return () => load.cancel();
  }, [load]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const onDelete = async (id: number) => {
    if (!confirm('Xoá nhân viên này? Hành động không thể hoàn tác.')) return;
    try {
      await delJSON(`/employees/${id}`);
      await load();
    } catch (e: any) {
      alert(e?.message || 'Xoá thất bại');
    }
  };

  const renderPagination = () => {
    const pages = [];
    const maxPagesToShow = 5;
    const startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`btn btn-sm ${i === page ? 'btn-primary' : 'btn-outline-primary'} rounded-pill px-3`}
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
          className="btn btn-outline-primary btn-sm rounded-pill px-3"
        >
          « Trước
        </button>
        {pages}
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="btn btn-outline-primary btn-sm rounded-pill px-3"
        >
          Sau »
        </button>
      </div>
    );
  };

  return (
    <div className="employee container py-5">
      <div className="card shadow-lg border-0 mb-5 bg-light-subtle">
        <div className="card-body p-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3 fw-bold text-primary-emphasis">
              📋 Quản lý nhân viên
            </h1>
            <div className="d-flex gap-3">
              <button
                onClick={() => nav(-1)}
                className="btn btn-outline-dark btn-sm"
              >
                ↩ Quay lại
              </button>
              <Link to="/employees/new" className="btn btn-success btn-sm">
                ➕ Thêm nhân viên
              </Link>
            </div>
          </div>

          <form onSubmit={onSearch} className="row g-3 mb-4">
            <div className="col-md-3">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="form-control shadow-sm"
                placeholder="🔍 Tìm theo tên, email, SĐT…"
              />
            </div>
            <div className="col-md-3">
              <input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="form-control shadow-sm"
                placeholder="🏢 Phòng ban"
              />
            </div>
            <div className="col-md-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="form-select shadow-sm"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Ngưng hoạt động</option>
              </select>
            </div>
            <div className="col-md-2">
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
            <div className="col-md-2">
              <button
                type="submit"
                className="btn btn-primary bg-gradient w-100"
              >
                Tìm
              </button>
            </div>
          </form>

          <div className="d-flex gap-3 align-items-center mb-4">
            <label className="form-label text-muted mb-0">Sắp xếp:</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="form-select w-auto shadow-sm"
            >
              <option value="full_name">Tên</option>
              <option value="department">Phòng ban</option>
              <option value="status">Trạng thái</option>
              <option value="createdAt">Tạo lúc</option>
              <option value="updatedAt">Cập nhật</option>
            </select>
            <select
              value={dir}
              onChange={(e) => setDir(e.target.value as any)}
              className="form-select w-auto shadow-sm"
            >
              <option value="asc">↑ Tăng dần</option>
              <option value="desc">↓ Giảm dần</option>
            </select>
          </div>

          {err && (
            <div className="alert alert-danger bg-danger-subtle border-danger-subtle mb-4 d-flex justify-content-between align-items-center">
              {err}
              <button
                onClick={() => setErr('')}
                className="btn-close"
                aria-label="Close"
              ></button>
            </div>
          )}

          {loading ? (
            <div className="text-center text-muted py-5">
              <div
                className="spinner-border text-primary"
                style={{ width: '3rem', height: '3rem' }}
                role="status"
              >
                <span className="visually-hidden">Đang tải…</span>
              </div>
              <p className="mt-3">Đang tải danh sách nhân viên...</p>
            </div>
          ) : (
            <div className="table-responsive shadow rounded-3">
              <table className="table table-hover align-middle table-fixed">
                <thead className="table-info text-white">
                  <tr>
                    <th className="col-equal">ID</th>
                    <th className="col-equal">Họ tên</th>
                    <th className="col-equal">Email</th>
                    <th className="col-equal">SĐT</th>
                    <th className="col-equal">Phòng ban</th>
                    <th className="col-equal">Tài khoản</th>
                    <th className="col-equal text-end">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((emp, index) => (
                    <tr
                      key={emp.id}
                      className={
                        index % 2 === 0 ? 'bg-light' : 'bg-secondary-subtle'
                      }
                    >
                      <td className="col-equal">{emp.id}</td>
                      <td className="col-equal fw-medium text-primary-emphasis">
                        {emp.full_name}
                      </td>
                      <td className="col-equal text-info-emphasis">
                        {emp.email || '—'}
                      </td>
                      <td className="col-equal">{emp.phone || '—'}</td>
                      <td className="col-equal">{emp.department || '—'}</td>
                      <td className="col-equal">{emp.user?.name || '—'}</td>
                      <td className="col-equal text-end">
                        <Link
                          to={`/employees/${emp.id}`}
                          className="btn btn-sm btn-outline-primary me-2"
                        >
                          Sửa
                        </Link>
                        <button
                          onClick={() => onDelete(emp.id)}
                          className="btn btn-sm btn-outline-danger"
                        >
                          Xoá
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!data.items.length && (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center text-muted py-4 bg-light"
                      >
                        {' '}
                        {/* Adjusted colSpan to 7 */}
                        Không có dữ liệu
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="d-flex justify-content-between align-items-center mt-4">
            <small className="text-muted">
              Tổng: {data.total} — Trang {data.page}/{totalPages}
            </small>
            {renderPagination()}
          </div>
        </div>
      </div>
    </div>
  );
}
