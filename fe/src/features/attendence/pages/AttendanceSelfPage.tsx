import { useEffect, useMemo, useState } from 'react';
import { getJSON, postJSON, buildQuery } from '../../../lib/http';
import type {
  TodaySelf,
  AttendanceRow,
  Paged,
} from '../../../types/attendance';
import { useNavigate } from 'react-router-dom';
import '../../../../public/css/attendance/AttendanceSelfPage.css';

function fmtDate(d?: string | null) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleString('vi-VN', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return d;
  }
}

function ym(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function AttendanceSelfPage() {
  const nav = useNavigate();

  // today
  const [today, setToday] = useState<TodaySelf | null>(null);
  const [loadingToday, setLoadingToday] = useState(true);
  const [errToday, setErrToday] = useState('');

  // list
  const [list, setList] = useState<AttendanceRow[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [errList, setErrList] = useState('');

  // filter
  const [month, setMonth] = useState<string>(ym());
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const canCheckIn = useMemo(() => today && !today.checkedIn, [today]);
  const canCheckOut = useMemo(
    () => today && today.checkedIn && !today.checkedOut,
    [today]
  );

  async function loadToday() {
    setLoadingToday(true);
    setErrToday('');
    try {
      const res = await getJSON<TodaySelf>('/attendance/today');
      setToday(res);
    } catch (e: any) {
      setErrToday(e?.message || 'Không lấy được trạng thái hôm nay');
      setToday(null);
    } finally {
      setLoadingToday(false);
    }
  }

  async function loadList(p = page) {
    setErrList('');
    try {
      const params = buildQuery({
        page: p,
        pageSize,
        month: month || undefined,
        from: from || undefined,
        to: to || undefined,
        _t: Date.now(),
      });
      const res = await getJSON<Paged<AttendanceRow>>(
        `/attendance/me${params}`
      );
      setList(res.data);
      setTotalPages(res.pagination.totalPages);
      setPage(res.pagination.page);
    } catch (e: any) {
      setErrList(e?.message || 'Không tải lịch sử chấm công');
      setList([]);
    }
  }

  useEffect(() => {
    loadToday();
    // eslint-disable-next-line
  }, []);
  useEffect(() => {
    loadList(1);
    // eslint-disable-next-line
  }, [month]);

  const doCheckIn = async () => {
    try {
      await postJSON('/attendance/check-in', {});
      await Promise.all([loadToday(), loadList(page)]);
      alert('Đã check-in!');
    } catch (e: any) {
      alert(e?.message || 'Check-in thất bại');
    }
  };

  const doCheckOut = async () => {
    try {
      await postJSON('/attendance/check-out', {});
      await Promise.all([loadToday(), loadList(page)]);
      alert('Đã check-out!');
    } catch (e: any) {
      alert(e?.message || 'Check-out thất bại');
    }
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadList(1);
  };

  return (
    <div className="attendanceSelf container py-5">
      <div className="card shadow-lg border-0 hrm-card bg-primary-subtle">
        <div className="card-body p-5">
          <div className="d-flex align-items-center justify-content-between mb-5 header-section">
            <h1 className="h3 fw-bold mb-0 gradient-text">
              📌 Chấm công của tôi
            </h1>
            <button
              onClick={() => nav(-1)}
              className="btn btn-outline-warning btn-sm d-flex align-items-center gap-2 hrm-btn bg-warning-subtle back-btn"
            >
              <svg
                className="bi"
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
          </div>

          {/* Hôm nay */}
          <div className="card shadow-sm border-0 hrm-card bg-light mb-5 today-section">
            <div className="card-body">
              <h2 className="h5 fw-semibold mb-3 text-primary-emphasis">
                📅 Hôm nay
              </h2>
              {loadingToday ? (
                <div className="text-center">
                  <div
                    className="spinner-border text-primary"
                    style={{ width: '2rem', height: '2rem' }}
                    role="status"
                  >
                    <span className="visually-hidden">Đang tải…</span>
                  </div>
                  <p className="text-sm text-muted mt-2">
                    Đang tải trạng thái chấm công...
                  </p>
                </div>
              ) : errToday ? (
                <div
                  className="alert alert-danger d-flex align-items-center gap-2 bg-danger-subtle border-danger-subtle"
                  role="alert"
                >
                  <svg
                    className="bi flex-shrink-0"
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
                  <span>{errToday}</span>
                </div>
              ) : today ? (
                <div className="d-flex flex-column gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm">
                    <div>
                      Check-in:{' '}
                      <span className="font-medium text-dark">
                        {fmtDate(today.check_in ?? null)}
                      </span>
                    </div>
                    <div>
                      Check-out:{' '}
                      <span className="font-medium text-dark">
                        {fmtDate(today.check_out ?? null)}
                      </span>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      onClick={doCheckIn}
                      disabled={!canCheckIn}
                      className="btn btn-primary bg-gradient d-flex align-items-center gap-2 hrm-btn"
                    >
                      <svg
                        className="bi"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                      </svg>
                      Check-in
                    </button>
                    <button
                      onClick={doCheckOut}
                      disabled={!canCheckOut}
                      className="btn btn-outline-primary d-flex align-items-center gap-2 hrm-btn bg-primary-subtle"
                    >
                      <svg
                        className="bi"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2Zm13 1v12H1V2h14Z" />
                        <path d="M5 10.5a.5.5 0 0 1 .5-.5h2V9h-2a.5.5 0 0 1-.5-.5V7a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v1.5a.5.5 0 0 1-.5.5h-2v1h2a.5.5 0 0 1 .5.5V11a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5v-1.5Z" />
                      </svg>
                      Check-out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted">
                  Không có dữ liệu hôm nay.
                </div>
              )}
            </div>
          </div>

          {/* Bộ lọc lịch sử */}
          <div className="card shadow-sm border-0 hrm-card bg-light mb-5 filter-section">
            <div className="card-body">
              <h2 className="h5 fw-semibold mb-3 text-primary-emphasis">
                🔍 Lọc lịch sử chấm công
              </h2>
              <form onSubmit={onSearch} className="row g-4">
                <div className="col-sm-4">
                  <div className="text-sm text-dark mb-1 fw-semibold">
                    Tháng
                  </div>
                  <input
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="form-control shadow-sm"
                  />
                </div>
                <div className="col-sm-4">
                  <div className="text-sm text-dark mb-1 fw-semibold">
                    Từ ngày
                  </div>
                  <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="form-control shadow-sm"
                  />
                </div>
                <div className="col-sm-4">
                  <div className="text-sm text-dark mb-1 fw-semibold">
                    Đến ngày
                  </div>
                  <input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="form-control shadow-sm"
                  />
                </div>
                <div className="col-sm-12 d-flex align-items-end">
                  <button
                    type="submit"
                    className="btn btn-primary bg-gradient w-100 hrm-btn"
                  >
                    <svg
                      className="bi me-2"
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                    </svg>
                    Lọc
                  </button>
                </div>
              </form>
            </div>
          </div>

          {errList && (
            <div
              className="alert alert-danger d-flex align-items-center gap-2 mb-5 bg-danger-subtle border-danger-subtle"
              role="alert"
            >
              <svg
                className="bi flex-shrink-0"
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
              <span>{errList}</span>
            </div>
          )}

          <div className="card shadow-sm border-0 hrm-card bg-light history-section">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover hrm-table">
                  <thead className="table-orange">
                    <tr>
                      <th className="p-3 text-left text-dark">Ngày</th>
                      <th className="p-3 text-left text-dark">Check-in</th>
                      <th className="p-3 text-left text-dark">Check-out</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((r) => (
                      <tr key={r.id} className="hrm-table-row">
                        <td className="p-3">{r.work_date}</td>
                        <td className="p-3">{fmtDate(r.check_in)}</td>
                        <td className="p-3">{fmtDate(r.check_out)}</td>
                      </tr>
                    ))}
                    {!list.length && (
                      <tr>
                        <td colSpan={3} className="p-3 text-center text-muted">
                          Không có dữ liệu chấm công
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="d-flex align-items-center justify-content-center gap-3 mt-4 pagination-section">
              <button
                onClick={() => {
                  if (page > 1) {
                    setPage(page - 1);
                    loadList(page - 1);
                  }
                }}
                className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2 hrm-btn bg-primary-subtle"
                disabled={page <= 1}
              >
                <svg
                  className="bi"
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
              <span className="text-sm text-dark">
                Trang {page}/{totalPages}
              </span>
              <button
                onClick={() => {
                  if (page < totalPages) {
                    setPage(page + 1);
                    loadList(page + 1);
                  }
                }}
                className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2 hrm-btn bg-primary-subtle"
                disabled={page >= totalPages}
              >
                Sau
                <svg
                  className="bi"
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
