import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getJSON,
  postJSON,
  patchJSON,
  delJSON,
  buildQuery,
} from '../../../lib/http';
import '../../../../public/css/attendance/AttendanceAdminPage.css';

type EmpLite = { id: number; full_name: string; email: string | null };
type Row = {
  id: number;
  employee_id: number;
  work_date: string; // YYYY-MM-DD
  check_in?: string | null;
  check_out?: string | null;
  employee?: EmpLite | null;
};
type Paged<T> = {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};
type Summary = {
  daysPresent: number;
  daysCompleted: number;
  totalHours: number;
};

const fmtDT = (s?: string | null) =>
  s
    ? new Date(s).toLocaleString('vi-VN', {
        dateStyle: 'short',
        timeStyle: 'short',
      })
    : '—';
const fmtDate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
const toDateInputValue = (d: Date) => fmtDate(d);
const toMonth = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const toInputDateTimeLocal = (iso?: string | null) => {
  if (!iso) return '';
  const dt = new Date(iso);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  const hh = String(dt.getHours()).padStart(2, '0');
  const mm = String(dt.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d}T${hh}:${mm}`;
};

export default function AttendanceAdminPage() {
  // filters
  const [employeeId, setEmployeeId] = useState<number | ''>('');
  const [month, setMonth] = useState<string>(toMonth());
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');

  // data
  const [rows, setRows] = useState<Row[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [sum, setSum] = useState<Summary | null>(null);
  const [err, setErr] = useState('');

  // employees for select
  const [emps, setEmps] = useState<EmpLite[]>([]);
  const [loading, setLoading] = useState(false);

  // form state
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [editEmp, setEditEmp] = useState<number | ''>('');
  const [editDate, setEditDate] = useState<string>(
    toDateInputValue(new Date())
  );
  const [editIn, setEditIn] = useState<string>('');
  const [editOut, setEditOut] = useState<string>('');

  const canSave = useMemo(() => !!editEmp && !!editDate, [editEmp, editDate]);

  async function loadEmployees() {
    try {
      const res = await getJSON<{
        items: EmpLite[];
        total: number;
        page: number;
        pageSize: number;
      }>(
        `/employees${buildQuery({
          page: 1,
          pageSize: 500,
          status: 'active',
        })}`
      );
      setEmps(res.items || []);
    } catch (e: any) {
      console.error(e);
    }
  }

  async function loadList(p = page) {
    setLoading(true);
    setErr('');
    try {
      const params = buildQuery({
        page: p,
        pageSize,
        month: month || undefined,
        from: from || undefined,
        to: to || undefined,
        employeeId: employeeId || undefined,
        _t: Date.now(),
      });
      const res = await getJSON<Paged<Row>>(`/attendance/admin${params}`);
      setRows(res.data);
      setTotalPages(res.pagination.totalPages);
      setPage(res.pagination.page);
    } catch (e: any) {
      setErr(e?.message || 'Không tải được danh sách chấm công');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadSummary() {
    try {
      const params = buildQuery({
        month: month || undefined,
        from: from || undefined,
        to: to || undefined,
        employeeId: employeeId || undefined,
        _t: Date.now(),
      });
      const res = await getJSON<Summary>(`/attendance/admin/summary${params}`);
      setSum(res);
    } catch {
      setSum(null);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);
  useEffect(() => {
    loadList(1);
    loadSummary();
  }, [month]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadList(1);
    loadSummary();
  };

  const openCreate = () => {
    setFormOpen(true);
    setEditing(null);
    setEditEmp(employeeId || '');
    setEditDate(toDateInputValue(new Date()));
    setEditIn('');
    setEditOut('');
  };

  const openEdit = (r: Row) => {
    setFormOpen(true);
    setEditing(r);
    setEditEmp(r.employee_id);
    setEditDate(r.work_date);
    setEditIn(toInputDateTimeLocal(r.check_in ?? null));
    setEditOut(toInputDateTimeLocal(r.check_out ?? null));
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    setEditEmp('');
    setEditDate(toDateInputValue(new Date()));
    setEditIn('');
    setEditOut('');
  };

  const clearIn = () => setEditIn('');
  const clearOut = () => setEditOut('');

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    try {
      const payload = {
        employee_id: Number(editEmp),
        work_date: editDate,
        check_in: editIn ? new Date(editIn).toISOString() : null,
        check_out: editOut ? new Date(editOut).toISOString() : null,
      };
      if (editing) {
        await patchJSON(`/attendance/admin/${editing.id}`, payload);
      } else {
        await postJSON(`/attendance/admin`, payload);
      }
      closeForm();
      await Promise.all([loadList(page), loadSummary()]);
      alert('Đã lưu bản ghi chấm công');
    } catch (e: any) {
      alert(e?.message || 'Lưu thất bại');
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm('Xoá bản ghi chấm công này?')) return;
    try {
      await delJSON(`/attendance/admin/${id}`);
      const nextPage = rows.length === 1 && page > 1 ? page - 1 : page;
      await Promise.all([loadList(nextPage), loadSummary()]);
    } catch (e: any) {
      alert(e?.message || 'Xoá thất bại');
    }
  };

  return (
    <div className="attendance container py-5">
      <div className="attendance card shadow-lg border-0">
        <div className="attendance card-header">
          <div className="attendance d-flex align-items-center justify-content-between flex-wrap">
            <h1 className="attendance h3 fw-bold mb-0">Quản lý chấm công</h1>
            <div className="attendance d-flex gap-2">
              <Link
                to="/"
                className="attendance btn btn-outline-warning btn-sm d-flex align-items-center gap-2"
              >
                <svg
                  className="attendance bi"
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
                Quay về
              </Link>
              <button
                onClick={openCreate}
                className="attendance btn btn-success d-flex align-items-center gap-2"
              >
                <svg
                  className="attendance bi"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                </svg>
                Thêm bản ghi
              </button>
            </div>
          </div>
        </div>

        <div className="attendance card-body">
          {/* Error */}
          {err && (
            <div
              className="attendance alert alert-danger d-flex align-items-center gap-2 mb-4"
              role="alert"
            >
              <svg
                className="attendance bi flex-shrink-0"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
              </svg>
              <span>{err}</span>
            </div>
          )}

          {/* Bộ lọc */}
          <div className="attendance card border-0 mb-4">
            <div className="attendance card-body">
              <h2 className="attendance h5 fw-semibold mb-3">Bộ lọc</h2>
              <form onSubmit={onSearch} className="attendance row g-3">
                <div className="attendance col-sm-5">
                  <label className="attendance form-label text-dark fw-semibold">
                    Nhân viên
                  </label>
                  <select
                    className="attendance form-select"
                    value={employeeId}
                    onChange={(e) =>
                      setEmployeeId(
                        e.target.value ? Number(e.target.value) : ''
                      )
                    }
                  >
                    <option value="">— Tất cả —</option>
                    {emps.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.full_name} {emp.email ? `(${emp.email})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="attendance col-sm-3">
                  <label className="attendance form-label text-dark fw-semibold">
                    Tháng
                  </label>
                  <input
                    type="month"
                    className="attendance form-control"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                  />
                </div>
                <div className="attendance col-sm-2">
                  <label className="attendance form-label text-dark fw-semibold">
                    Từ ngày
                  </label>
                  <input
                    type="date"
                    className="attendance form-control"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                  />
                </div>
                <div className="attendance col-sm-2">
                  <label className="attendance form-label text-dark fw-semibold">
                    Đến ngày
                  </label>
                  <input
                    type="date"
                    className="attendance form-control"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                  />
                </div>
                <div className="attendance col-sm-12 d-flex gap-2">
                  <button
                    type="submit"
                    className="attendance btn btn-primary d-flex align-items-center gap-2 flex-grow-1"
                  >
                    <svg
                      className="attendance bi"
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                    </svg>
                    Lọc
                  </button>
                  <button
                    type="button"
                    className="attendance btn btn-outline-secondary d-flex align-items-center gap-2 flex-grow-1"
                    onClick={() => {
                      setEmployeeId('');
                      setFrom('');
                      setTo('');
                      setMonth(toMonth());
                      setPage(1);
                      loadList(1);
                      loadSummary();
                    }}
                  >
                    <svg
                      className="attendance bi"
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.354 6.354a.5.5 0 0 0-.708-.708L8 7.293 6.354 5.646a.5.5 0 0 0-.708.708L7.293 8l-1.647 1.646a.5.5 0 0 0 .708.708L8 8.707l1.646 1.647a.5.5 0 0 0 .708-.708L8.707 8l1.647-1.646z"
                      />
                    </svg>
                    Đặt lại
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Summary */}
          <div className="attendance card border-0 mb-4">
            <div className="attendance card-body">
              <h2 className="attendance h5 fw-semibold mb-3">Tổng hợp</h2>
              {sum ? (
                <div className="attendance row g-3">
                  <div className="attendance col-sm-4">
                    <div className="attendance card border-0 hrm-badge-0 text-white">
                      <div className="attendance card-body">
                        <div className="attendance text-sm">Số ngày có mặt</div>
                        <div className="attendance h4 fw-bold mb-0">
                          {sum.daysPresent}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="attendance col-sm-4">
                    <div className="attendance card border-0 hrm-badge-1 text-white">
                      <div className="attendance card-body">
                        <div className="attendance text-sm">
                          Ngày đủ công (in/out)
                        </div>
                        <div className="attendance h4 fw-bold mb-0">
                          {sum.daysCompleted}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="attendance col-sm-4">
                    <div className="attendance card border-0 hrm-badge-2 text-white">
                      <div className="attendance card-body">
                        <div className="attendance text-sm">
                          Tổng giờ (ước tính)
                        </div>
                        <div className="attendance h4 fw-bold mb-0">
                          {sum.totalHours}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="attendance text-sm text-muted">
                  Không có dữ liệu tổng hợp.
                </div>
              )}
            </div>
          </div>

          {/* Form tạo/sửa */}
          {formOpen && (
            <div className="attendance card border-0 mb-4">
              <div className="attendance card-body">
                <h2 className="attendance h5 fw-semibold mb-3">
                  {editing ? 'Sửa bản ghi' : 'Thêm bản ghi'}
                </h2>
                <form onSubmit={onSave} className="attendance row g-3">
                  <div className="attendance col-sm-6">
                    <label className="attendance form-label text-dark fw-semibold">
                      Nhân viên
                    </label>
                    <select
                      className="attendance form-select"
                      value={editEmp}
                      onChange={(e) =>
                        setEditEmp(e.target.value ? Number(e.target.value) : '')
                      }
                      required
                    >
                      <option value="">— Chọn nhân viên —</option>
                      {emps.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.full_name} {emp.email ? `(${emp.email})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="attendance col-sm-6">
                    <label className="attendance form-label text-dark fw-semibold">
                      Ngày làm việc
                    </label>
                    <input
                      type="date"
                      className="attendance form-control"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="attendance col-sm-6">
                    <label className="attendance form-label text-dark fw-semibold">
                      Check-in
                    </label>
                    <div className="attendance input-group">
                      <input
                        type="datetime-local"
                        className="attendance form-control"
                        value={editIn}
                        onChange={(e) => setEditIn(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={clearIn}
                        className="attendance btn btn-outline-danger btn-sm"
                      >
                        <svg
                          className="attendance bi"
                          width="16"
                          height="16"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                        >
                          <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" />
                        </svg>
                        Xoá
                      </button>
                    </div>
                  </div>
                  <div className="attendance col-sm-6">
                    <label className="attendance form-label text-dark fw-semibold">
                      Check-out
                    </label>
                    <div className="attendance input-group">
                      <input
                        type="datetime-local"
                        className="attendance form-control"
                        value={editOut}
                        onChange={(e) => setEditOut(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={clearOut}
                        className="attendance btn btn-outline-danger btn-sm"
                      >
                        <svg
                          className="attendance bi"
                          width="16"
                          height="16"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                        >
                          <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" />
                        </svg>
                        Xoá
                      </button>
                    </div>
                  </div>
                  <div className="attendance col-sm-12 d-flex gap-2">
                    <button
                      disabled={!canSave}
                      className="attendance btn btn-success d-flex align-items-center gap-2 flex-grow-1"
                    >
                      <svg
                        className="attendance bi"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2Zm13 1v12H1V2h14Z" />
                        <path d="M5 10.5a.5.5 0 0 1 .5-.5h2V9h-2a.5.5 0 0 1-.5-.5V7a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v1.5a.5.5 0 0 1-.5.5h-2v1h2a.5.5 0 0 1 .5.5V11a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5v-1.5Z" />
                      </svg>
                      Lưu
                    </button>
                    <button
                      type="button"
                      onClick={closeForm}
                      className="attendance btn btn-outline-danger d-flex align-items-center gap-2 flex-grow-1"
                    >
                      <svg
                        className="attendance bi"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" />
                      </svg>
                      Hủy
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="attendance card border-0">
            <div className="attendance card-body p-0">
              {loading ? (
                <div className="attendance text-center p-4">
                  <div
                    className="attendance spinner-border text-primary"
                    role="status"
                  >
                    <span className="visually-hidden">Đang tải…</span>
                  </div>
                  <p className="attendance text-sm text-muted mt-2">
                    Đang tải danh sách chấm công...
                  </p>
                </div>
              ) : (
                <div className="attendance table-responsive">
                  <table className="attendance table table-hover hrm-table">
                    <thead>
                      <tr>
                        <th className="attendance p-3 text-left text-dark">
                          Nhân viên
                        </th>
                        <th className="attendance p-3 text-left text-dark">
                          Email
                        </th>
                        <th className="attendance p-3 text-left text-dark">
                          Ngày
                        </th>
                        <th className="attendance p-3 text-left text-dark">
                          Check-in
                        </th>
                        <th className="attendance p-3 text-left text-dark">
                          Check-out
                        </th>
                        <th className="attendance p-3 text-right text-dark">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.id} className="attendance hrm-table-row">
                          <td className="attendance p-3">
                            {r.employee?.full_name || r.employee_id}
                          </td>
                          <td className="attendance p-3">
                            {r.employee?.email || '—'}
                          </td>
                          <td className="attendance p-3">{r.work_date}</td>
                          <td className="attendance p-3">
                            {fmtDT(r.check_in)}
                          </td>
                          <td className="attendance p-3">
                            {fmtDT(r.check_out)}
                          </td>
                          <td className="attendance p-3 text-right">
                            <button
                              onClick={() => openEdit(r)}
                              className="attendance btn btn-outline-primary btn-sm me-2"
                            >
                              <svg
                                className="attendance bi"
                                width="16"
                                height="16"
                                fill="currentColor"
                                viewBox="0 0 16 16"
                              >
                                <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" />
                              </svg>
                              Sửa
                            </button>
                            <button
                              onClick={() => onDelete(r.id)}
                              className="attendance btn btn-outline-danger btn-sm"
                            >
                              <svg
                                className="attendance bi"
                                width="16"
                                height="16"
                                fill="currentColor"
                                viewBox="0 0 16 16"
                              >
                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                                <path
                                  fillRule="evenodd"
                                  d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                                />
                              </svg>
                              Xoá
                            </button>
                          </td>
                        </tr>
                      ))}
                      {!rows.length && (
                        <tr>
                          <td
                            colSpan={6}
                            className="attendance p-3 text-center text-muted"
                          >
                            Không có dữ liệu
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="attendance d-flex align-items-center justify-content-center gap-3 mt-4">
              <button
                onClick={() => {
                  if (page > 1) {
                    setPage(page - 1);
                    loadList(page - 1);
                  }
                }}
                className="attendance btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
                disabled={page <= 1}
              >
                <svg
                  className="attendance bi"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
                  />
                </svg>
                Trước
              </button>
              <span className="attendance text-sm text-dark">
                Trang {page}/{totalPages}
              </span>
              <button
                onClick={() => {
                  if (page < totalPages) {
                    setPage(page + 1);
                    loadList(page + 1);
                  }
                }}
                className="attendance btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
                disabled={page >= totalPages}
              >
                Sau
                <svg
                  className="attendance bi"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
