// src/features/payroll/MyPayrollList.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { getJSON } from '../../../lib/http';
import type { Payroll } from '../../../types/payroll';
import '../../../../public/css/payroll/MyPayrollList.css';

type SortKey =
  | 'id'
  | 'period_start'
  | 'period_end'
  | 'base_salary'
  | 'bonus'
  | 'deductions'
  | 'net_salary';

type SortDir = 'asc' | 'desc';
const PAGE_SIZES = [5, 10, 20];

const toNumber = (val: string | number | null | undefined): number => {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return Number.isFinite(val) ? val : 0;
  const n = Number(String(val).replace(/[^\d.-]/g, '')); // loại mọi ký tự không phải số, dấu . -
  return Number.isFinite(n) ? n : 0;
};

const formatCurrency = (amount?: string | number | null) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    toNumber(amount ?? 0)
  );

const parseDate = (s?: string | null) => (s ? new Date(s) : null);

const MyPayrollList: React.FC = () => {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI states
  const [q, setQ] = useState(''); // tìm kiếm theo ngày YYYY-MM hoặc text tự do
  const [fromDate, setFromDate] = useState(''); // lọc từ ngày
  const [toDate, setToDate] = useState(''); // lọc đến ngày
  const [sortKey, setSortKey] = useState<SortKey>('period_start');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    const fetchPayrolls = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getJSON<{ message?: string; data?: Payroll[] }>(
          '/payroll/me'
        );
        setPayrolls(Array.isArray(res?.data) ? res.data! : []);
      } catch (err: any) {
        setError(err?.message || 'Lỗi khi lấy bảng lương');
      } finally {
        setLoading(false);
      }
    };
    fetchPayrolls();
  }, []);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key)
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filtered = useMemo(() => {
    let list = [...payrolls];

    // Tìm kiếm nhanh: khớp một phần với period_start/period_end (ví dụ gõ "2025-08")
    if (q.trim()) {
      const term = q.trim().toLowerCase();
      list = list.filter((p) => {
        const s = (p.period_start ?? '').toString().toLowerCase();
        const e = (p.period_end ?? '').toString().toLowerCase();
        return s.includes(term) || e.includes(term);
      });
    }

    // Lọc theo khoảng thời gian có overlap
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
    const arr = [...filtered];
    arr.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      const av = (() => {
        switch (sortKey) {
          case 'id':
            return a.id ?? 0;
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
        }
      })();
      const bv = (() => {
        switch (sortKey) {
          case 'id':
            return b.id ?? 0;
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
        }
      })();
      if (av! < bv!) return -1 * dir;
      if (av! > bv!) return 1 * dir;
      return 0;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageSlice = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [q, fromDate, toDate, pageSize]);

  const sum = (sel: (p: Payroll) => string | number | null | undefined) =>
    sorted.reduce((acc, p) => acc + toNumber(sel(p)), 0);

  // Render
  if (loading) {
    return (
      <div className="my-card card">
        <div className="my-payroll-header card-header">
          <div className="d-flex justify-content-between align-items-center my-toolbar">
            <div>
              <h2 className="h4 mb-1">
                <i className="fas fa-wallet me-2"></i>Bảng lương của tôi
              </h2>
              <span className="filter-chip">
                <i className="fas fa-user"></i> Đang tải dữ liệu…
              </span>
            </div>
          </div>
        </div>
        <div className="card-body">
          {[...Array(6)].map((_, i) => (
            <div className="skeleton mb-3" key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error)
    return (
      <div className="alert alert-danger">
        <i className="fas fa-exclamation-triangle me-2"></i>
        {error}
      </div>
    );

  return (
    <div className="container-fluid py-4">
      <div className="my-card card mb-4">
        <div className="my-payroll-header card-header">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 my-toolbar">
            <div>
              <h2 className="h4 mb-1">
                <i className="fas fa-wallet me-2"></i>Bảng lương của tôi
              </h2>
              <div className="d-flex align-items-center gap-2">
                <span className="filter-chip">
                  <i className="fas fa-database"></i>
                  <strong>{payrolls.length}</strong> bản ghi
                </span>
                {sorted.length !== payrolls.length && (
                  <span className="filter-chip text-muted">
                    <i className="fas fa-filter"></i> Hiển thị:{' '}
                    <strong>{sorted.length}</strong>
                  </span>
                )}
              </div>
            </div>
            <div className="d-flex flex-wrap gap-2">
              {/* Bạn có thể thêm export ở đây nếu muốn */}
            </div>
          </div>
        </div>

        {/* Bộ lọc */}
        <div className="card-body">
          <div className="row g-2 input-compact">
            <div className="col-12 col-md-4">
              <label className="form-label mb-1">
                Tìm nhanh theo kỳ (ví dụ: 2025-08)
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  className="form-control"
                  placeholder="2025-08 hoặc nhập chuỗi bất kỳ khớp ngày"
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
                {PAGE_SIZES.map((sz) => (
                  <option key={sz} value={sz}>
                    {sz} / trang
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="my-card card">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="fas fa-table me-2"></i>Danh sách
            <span className="badge badge-soft ms-2">{sorted.length}</span>
          </h5>
          <div className="small text-muted">
            Trang <strong>{currentPage}</strong>/
            <strong>{Math.max(1, Math.ceil(sorted.length / pageSize))}</strong>
          </div>
        </div>

        {sorted.length === 0 ? (
          <div className="empty-wrap">
            <i className="fas fa-inbox fa-3x mb-3"></i>
            <h5 className="mb-1">Chưa có bảng lương</h5>
            <div>
              Hãy kiểm tra lại bộ lọc hoặc đợi HR phát hành kỳ lương mới.
            </div>
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
                      className="text-center sortable"
                      onClick={() => toggleSort('period_start')}
                    >
                      <i className="fas fa-calendar-plus me-1"></i>Bắt đầu{' '}
                      {sortKey === 'period_start' &&
                        (sortDir === 'asc' ? '▲' : '▼')}
                    </th>
                    <th
                      className="text-center sortable"
                      onClick={() => toggleSort('period_end')}
                    >
                      <i className="fas fa-calendar-check me-1"></i>Kết thúc{' '}
                      {sortKey === 'period_end' &&
                        (sortDir === 'asc' ? '▲' : '▼')}
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
                  </tr>
                </thead>
                <tbody>
                  {pageSlice.map((p) => (
                    <tr
                      key={
                        p.id ??
                        `${p.period_start}-${p.period_end}-${Math.random()}`
                      }
                    >
                      <td className="text-center">
                        <span className="badge text-bg-secondary">
                          {p.id ?? '—'}
                        </span>
                      </td>
                      <td className="text-center">{p.period_start ?? '—'}</td>
                      <td className="text-center">{p.period_end ?? '—'}</td>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="card-footer bg-white d-flex flex-wrap justify-content-between align-items-center gap-2">
              <div className="text-muted small">
                Hiển thị{' '}
                <strong>
                  {(currentPage - 1) * pageSize + 1}-
                  {Math.min(currentPage * pageSize, sorted.length)}
                </strong>{' '}
                trong <strong>{sorted.length}</strong> mục
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

      {/* Stats */}
      {sorted.length > 0 && (
        <div className="row g-3 mt-3">
          <div className="col-12 col-md-3">
            <div className="stat-card p-3 h-100">
              <div className="text-muted small">Số kỳ lương hiển thị</div>
              <div className="fs-4 fw-bold text-primary">{sorted.length}</div>
            </div>
          </div>
          <div className="col-12 col-md-3">
            <div className="stat-card p-3 h-100">
              <div className="text-muted small">Tổng lương cơ bản</div>
              <div className="fs-5 fw-semibold text-success">
                {formatCurrency(sum((p) => p.base_salary))}
              </div>
            </div>
          </div>
          <div className="col-12 col-md-3">
            <div className="stat-card p-3 h-100">
              <div className="text-muted small">Tổng thưởng</div>
              <div className="fs-5 fw-semibold text-info">
                {formatCurrency(sum((p) => p.bonus))}
              </div>
            </div>
          </div>
          <div className="col-12 col-md-3">
            <div className="stat-card p-3 h-100">
              <div className="text-muted small">Tổng thực nhận</div>
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

export default MyPayrollList;
