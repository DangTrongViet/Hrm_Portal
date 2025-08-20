import React, { useEffect, useMemo, useState } from 'react';
import { getJSON, delJSON } from '../../../lib/http';
import PayrollForm from '../components/PayrollAdminForm';
import type { Payroll } from '../../../types/payroll';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import '../../../../public/css/payroll/PayrollList.css';

type SortKey =
  | 'id'
  | 'employee'
  | 'period_start'
  | 'period_end'
  | 'base_salary'
  | 'bonus'
  | 'deductions'
  | 'net_salary';

type SortDir = 'asc' | 'desc';

const PAGE_SIZES = [10, 20, 50, 100];

const toNumber = (val: string | number | null | undefined): number => {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return Number.isFinite(val) ? val : 0;
  const n = Number(String(val).replace(/[, ]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

const PayrollList: React.FC = () => {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPayroll, setEditingPayroll] = useState<Payroll | null>(null);
  const [q, setQ] = useState('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [pageSize, setPageSize] = useState<number>(20);
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const fetchPayrolls = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getJSON<Payroll[]>('/payroll/admin');
      setPayrolls(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (!window.confirm('Bạn có chắc muốn xóa bảng lương này không?')) return;
    try {
      await delJSON(`/payroll/admin/${id}`);
      setPayrolls((prev) => prev.filter((p) => p.id !== id));
      setPage(1); // Reset to first page after deletion
    } catch (err: any) {
      alert(err?.message || 'Xóa thất bại');
    }
  };

  const formatCurrency = (amount?: string | number | null) => {
    const safe = toNumber(amount ?? 0);
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(safe);
  };

  const parseDate = (s?: string | null) => (s ? new Date(s) : null);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1); // Reset to first page on sort change
  };

  const filtered = useMemo(() => {
    let list = [...payrolls];
    if (q.trim()) {
      const term = q.trim().toLowerCase();
      list = list.filter((p) => {
        const name = p.employee?.full_name?.toLowerCase() || '';
        const idStr = (p.employee_id ?? '').toString();
        return name.includes(term) || idStr.includes(term);
      });
    }
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    if (from || to) {
      list = list.filter((p) => {
        const ps = parseDate(p.period_start);
        const pe = parseDate(p.period_end);
        if (!ps || !pe) return false;
        const inFrom = from ? pe >= from : true;
        const inTo = to ? ps <= to : true;
        return inFrom && inTo;
      });
    }
    return list;
  }, [payrolls, q, fromDate, toDate]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      const av = (() => {
        switch (sortKey) {
          case 'id':
            return a.id ?? 0;
          case 'employee':
            return a.employee?.full_name?.toLowerCase() ?? '';
          case 'period_start':
            return parseDate(a.period_start)?.getTime() ?? 0;
          case 'period_end':
            return parseDate(a.period_end)?.getTime() ?? 0;
          case 'base_salary':
            return toNumber(a.base_salary);
          case 'bonus':
            return toNumber(a.bonus);
          case 'deductions':
            return toNumber(a.deductions);
          case 'net_salary':
            return toNumber(a.net_salary);
          default:
            return 0;
        }
      })();
      const bv = (() => {
        switch (sortKey) {
          case 'id':
            return b.id ?? 0;
          case 'employee':
            return b.employee?.full_name?.toLowerCase() ?? '';
          case 'period_start':
            return parseDate(b.period_start)?.getTime() ?? 0;
          case 'period_end':
            return parseDate(b.period_end)?.getTime() ?? 0;
          case 'base_salary':
            return toNumber(b.base_salary);
          case 'bonus':
            return toNumber(b.bonus);
          case 'deductions':
            return toNumber(b.deductions);
          case 'net_salary':
            return toNumber(b.net_salary);
          default:
            return 0;
        }
      })();
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
    return list;
  }, [filtered, sortKey, sortDir]);

  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageSlice = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [q, fromDate, toDate, pageSize]);

  const exportToExcel = () => {
    if (!sorted.length) return;
    const worksheetData = sorted.map((p) => ({
      ID: p.id ?? '',
      Nhan_vien: p.employee?.full_name || '',
      Ngay_bat_dau: p.period_start ?? '',
      Ngay_ket_thuc: p.period_end ?? '',
      Luong_co_ban: toNumber(p.base_salary),
      Thuong: toNumber(p.bonus),
      Khoan_tru: toNumber(p.deductions),
      Luong_thuc_nhan: toNumber(p.net_salary),
    }));
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payrolls');
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'Payrolls.xlsx');
  };

  const sum = (sel: (p: Payroll) => string | number | null | undefined) =>
    filtered.reduce((acc, p) => acc + toNumber(sel(p)), 0);

  return (
    <div className="container-fluid py-4">
      <div className="payroll-card card mb-4">
        <div className="card-header payroll-gradient-header">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 payroll-toolbar">
            <div>
              <h2 className="h4 mb-1" style={{ color: '#000000' }}>
                <i className="fas fa-money-check-alt me-2"></i>
                Quản lý bảng lương
              </h2>
              <div className="d-flex align-items-center gap-2">
                <span className="filter-chip">
                  <i className="fas fa-database"></i>
                  <strong>{payrolls.length}</strong> bản ghi
                </span>
                {filtered.length !== payrolls.length && (
                  <span className="filter-chip">
                    <i className="fas fa-filter"></i>
                    Đang lọc: <strong>{filtered.length}</strong>
                  </span>
                )}
              </div>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <button
                className="btn btn-dark btn-sm"
                onClick={exportToExcel}
                disabled={!sorted.length}
                title="Xuất toàn bộ danh sách đang hiển thị (đã lọc/sắp xếp)"
              >
                <i className="fas fa-file-excel me-2"></i> Xuất Excel
              </button>
              <button className="btn btn-dark btn-sm" onClick={fetchPayrolls}>
                <i className="fas fa-rotate me-2"></i> Tải lại
              </button>
              {!editingPayroll && (
                <button
                  className="btn btn-dark btn-sm"
                  onClick={() =>
                    setEditingPayroll({
                      employee_id: 0,
                      base_salary: 0,
                      bonus: 0,
                      deductions: 0,
                      net_salary: 0,
                      period_start: null,
                      period_end: null,
                    })
                  }
                >
                  <i className="fas fa-plus me-2"></i> Tạo mới
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="card-body">
          <div className="row g-2 input-compact">
            <div className="col-12 col-md-4">
              <label className="form-label mb-1">Tìm kiếm</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  className="form-control"
                  placeholder="Tên nhân viên hoặc ID"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label mb-1">Từ ngày</label>
              <input
                type="date"
                className="form-control"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label mb-1">Đến ngày</label>
              <input
                type="date"
                className="form-control"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-2">
              <label className="form-label mb-1">Kích thước trang</label>
              <select
                className="form-select"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                {PAGE_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s} / trang
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {editingPayroll && (
        <div className="payroll-card card mb-4">
          <div className="card-header bg-light d-flex align-items-center">
            <i className="fas fa-edit me-2 text-primary"></i>
            <h5 className="mb-0">
              {editingPayroll.id
                ? 'Chỉnh sửa bảng lương'
                : 'Tạo bảng lương mới'}
            </h5>
          </div>
          <div className="card-body">
            <PayrollForm
              payroll={editingPayroll}
              onSuccess={() => {
                setEditingPayroll(null);
                fetchPayrolls();
              }}
              onCancel={() => setEditingPayroll(null)}
            />
          </div>
        </div>
      )}

      {loading && (
        <div className="payroll-card card">
          <div className="card-body text-center py-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-3">Đang tải danh sách bảng lương...</p>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          <strong>Lỗi:</strong> {error}
        </div>
      )}

      {!loading && !error && (
        <div className="payroll-card card">
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="fas fa-table me-2"></i>
              Danh sách bảng lương
              <span className="badge badge-soft ms-2">{filtered.length}</span>
            </h5>
            <div className="small">
              Trang <strong>{currentPage}</strong>/<strong>{totalPages}</strong>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="payroll-empty text-center">
              <i className="fas fa-inbox fa-3x mb-3"></i>
              <h5 className="mb-1">Không có dữ liệu</h5>
              <div>Hãy thử bỏ lọc hoặc tạo mới một bảng lương.</div>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th
                        className="text-center sortable"
                        onClick={() => toggleSort('id')}
                      >
                        <i className="fas fa-hashtag me-1"></i>ID{' '}
                        {sortKey === 'id' && (sortDir === 'asc' ? '▲' : '▼')}
                      </th>
                      <th
                        className="sortable"
                        onClick={() => toggleSort('employee')}
                      >
                        <i className="fas fa-user me-1"></i>Nhân viên{' '}
                        {sortKey === 'employee' &&
                          (sortDir === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="text-center">
                        <i className="fas fa-calendar-alt me-1"></i>Kỳ lương
                      </th>
                      <th
                        className="text-end sortable"
                        onClick={() => toggleSort('base_salary')}
                      >
                        <i className="fas fa-sack-dollar me-1"></i>Lương cơ bản{' '}
                        {sortKey === 'base_salary' &&
                          (sortDir === 'asc' ? '▲' : '▼')}
                      </th>
                      <th
                        className="text-end sortable"
                        onClick={() => toggleSort('bonus')}
                      >
                        <i className="fas fa-gift me-1"></i>Thưởng{' '}
                        {sortKey === 'bonus' && (sortDir === 'asc' ? '▲' : '▼')}
                      </th>
                      <th
                        className="text-end sortable"
                        onClick={() => toggleSort('deductions')}
                      >
                        <i className="fas fa-minus-circle me-1"></i>Trừ{' '}
                        {sortKey === 'deductions' &&
                          (sortDir === 'asc' ? '▲' : '▼')}
                      </th>
                      <th
                        className="text-end sortable"
                        onClick={() => toggleSort('net_salary')}
                      >
                        <i className="fas fa-money-bill-wave me-1"></i>Thực nhận{' '}
                        {sortKey === 'net_salary' &&
                          (sortDir === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="text-center sticky-actions">
                        <i className="fas fa-cogs me-1"></i>Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageSlice.map((p) => (
                      <tr key={p.id ?? Math.random()}>
                        <td className="text-center">
                          <span className="badge text-bg-secondary">
                            {p.id ?? '—'}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <span
                              className="avatar-pill me-2"
                              style={{ background: '#4e73df' }}
                              title={p.employee?.full_name || 'N/A'}
                            >
                              {(p.employee?.full_name || 'N/A')
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                            <div>
                              <div className="fw-semibold">
                                {p.employee?.full_name || 'N/A'}
                              </div>
                              <div className="small">
                                ID NV: {p.employee_id ?? '—'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="text-center">
                          <div className="fw-medium">
                            {p.period_start ?? '—'}
                          </div>
                          <div className="small">đến {p.period_end ?? '—'}</div>
                        </td>
                        <td className="text-end">
                          <span className="text-info fw-semibold">
                            {formatCurrency(p.base_salary)}
                          </span>
                        </td>
                        <td className="text-end">
                          <span className="text-success fw-semibold">
                            {toNumber(p.bonus) > 0
                              ? `+${formatCurrency(p.bonus)}`
                              : '—'}
                          </span>
                        </td>
                        <td className="text-end">
                          <span className="text-danger fw-semibold">
                            {toNumber(p.deductions) > 0
                              ? `-${formatCurrency(p.deductions)}`
                              : '—'}
                          </span>
                        </td>
                        <td className="text-end">
                          <span className="text-primary fw-bold">
                            {formatCurrency(p.net_salary)}
                          </span>
                        </td>
                        <td className="text-center">
                          <div className="btn-group">
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => setEditingPayroll(p)}
                              title="Chỉnh sửa"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleDelete(p.id)}
                              title="Xóa"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="card-footer bg-white d-flex flex-wrap justify-content-between align-items-center gap-2">
                <div className="small">
                  Hiển thị{' '}
                  <strong>
                    {(currentPage - 1) * pageSize + 1}-
                    {Math.min(currentPage * pageSize, totalItems)}
                  </strong>{' '}
                  trong <strong>{totalItems}</strong> mục
                </div>
                <div className="btn-group">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setPage(1)}
                    disabled={currentPage === 1}
                  >
                    « Đầu
                  </button>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    ‹ Trước
                  </button>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Sau ›
                  </button>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    Cuối »
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="row g-3 mt-3">
          <div className="col-12 col-md-3">
            <div className="stat-card p-3 h-100">
              <div className="small">Tổng bảng lương</div>
              <div className="fs-4 fw-bold text-primary">{filtered.length}</div>
            </div>
          </div>
          <div className="col-12 col-md-3">
            <div className="stat-card p-3 h-100">
              <div className="small">Tổng lương cơ bản</div>
              <div className="fs-5 fw-semibold text-success">
                {formatCurrency(sum((p) => p.base_salary))}
              </div>
            </div>
          </div>
          <div className="col-12 col-md-3">
            <div className="stat-card p-3 h-100">
              <div className="small">Tổng thưởng</div>
              <div className="fs-5 fw-semibold text-info">
                {formatCurrency(sum((p) => p.bonus))}
              </div>
            </div>
          </div>
          <div className="col-12 col-md-3">
            <div className="stat-card p-3 h-100">
              <div className="small">Tổng thực nhận</div>
              <div className="fs-5 fw-bold text-dark">
                {formatCurrency(sum((p) => p.net_salary))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollList;
