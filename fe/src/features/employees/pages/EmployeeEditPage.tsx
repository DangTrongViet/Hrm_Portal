import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getJSON, patchJSON } from '../../../lib/http';

type UserOption = { id: number; name: string; email: string };
type Employee = {
  id: number;
  full_name: string;
  email: string | null;
  phone: string | null;
  department: string | null;
  position: string | null;
  status: 'active' | 'inactive';
  user_id?: number | null;
};

export default function EmployeeEditPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();

  // form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  // liên kết user
  const [userId, setUserId] = useState<number | ''>('');

  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // load dữ liệu
  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr('');
      try {
        // chi tiết employee
        const emp = await getJSON<Employee>(`/employees/${id}`);
        setFullName(emp.full_name || '');
        setEmail(emp.email || '');
        setPhone(emp.phone || '');
        setDepartment(emp.department || '');
        setPosition(emp.position || '');
        setStatus(emp.status || 'active');
        setUserId(emp.user_id ?? '');

        // options user
        const res = await getJSON<any>(
          `/employees/users-options?_=${Date.now()}`
        );
        const items: UserOption[] = Array.isArray(res?.items)
          ? res.items
          : Array.isArray(res)
            ? res
            : [];
        setUserOptions(items);
      } catch (e: any) {
        setErr(e?.message || 'Không tải được dữ liệu');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // khi chọn user → auto-fill cả Email và Họ & Tên
  const onChangeUser = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) {
      setUserId('');
      return;
    }
    const uid = Number(val);
    setUserId(uid);
    const u = userOptions.find((x) => x.id === uid);
    if (u) {
      setEmail(u.email || '');
      setFullName(u.name || '');
    }
  };

  // nếu options về trễ → vẫn đồng bộ với userId đã chọn
  useEffect(() => {
    if (userId === '') return;
    const u = userOptions.find((x) => x.id === Number(userId));
    if (u) {
      setEmail(u.email || '');
      setFullName(u.name || '');
    }
  }, [userId, userOptions]);

  const canSave = useMemo(
    () => fullName.trim().length >= 2 && !loading,
    [fullName, loading]
  );

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    setErr('');
    try {
      await patchJSON(`/employees/${id}`, {
        full_name: fullName.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        department: department.trim() || null,
        position: position.trim() || null,
        status,
        user_id: userId === '' ? null : Number(userId),
      });
      alert('Cập nhật thành công');
      nav('/employees');
    } catch (e: any) {
      setErr(e?.message || 'Cập nhật thất bại');
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center text-muted">
        <div
          className="spinner-border text-primary"
          style={{ width: '3rem', height: '3rem' }}
          role="status"
        >
          <span className="visually-hidden">Đang tải…</span>
        </div>
        <p className="mt-3">Đang tải chi tiết nhân viên...</p>
      </div>
    );
  }

  if (err) {
    return (
      <div className="container py-5">
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
          <span>{err}</span>
        </div>
        <button
          onClick={() => nav(-1)}
          className="btn btn-outline-warning btn-sm d-flex align-items-center gap-2 hrm-btn bg-warning-subtle"
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
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="card shadow-lg border-0 hrm-card bg-primary-subtle">
        <div className="card-body p-5">
          <div className="d-flex align-items-center justify-content-between mb-5">
            <h1 className="h3 fw-bold mb-0 gradient-text">
              Chỉnh sửa nhân viên
            </h1>
            <button
              onClick={() => nav(-1)}
              className="btn btn-outline-warning btn-sm d-flex align-items-center gap-2 hrm-btn bg-warning-subtle"
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
              Quay lại
            </button>
          </div>

          {err && (
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
              <span>{err}</span>
            </div>
          )}

          <form onSubmit={onSave} className="space-y-4">
            {/* Liên kết User */}
            <div>
              <div className="text-sm text-dark mb-1 fw-semibold">
                Liên kết User (tuỳ chọn)
              </div>
              <select
                className="form-select shadow-sm hrm-select bg-secondary-subtle"
                value={userId}
                onChange={onChangeUser}
                style={{ transition: 'all 0.3s ease' }}
              >
                <option value="">-- Không liên kết --</option>
                {userOptions.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.email}
                  </option>
                ))}
              </select>
              <div className="text-xs text-muted mt-1">
                Khi chọn user, Email và Họ & Tên sẽ tự điền theo user đó (vẫn có
                thể chỉnh tay).
              </div>
            </div>

            <div className="row g-4">
              <div className="col-sm-6">
                <Field label="Họ & Tên *">
                  <div className="input-group shadow-sm">
                    <span className="input-group-text bg-info-subtle border-end-0 text-info-emphasis">
                      <svg
                        className="bi"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z" />
                      </svg>
                    </span>
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="form-control border-start-0"
                      placeholder="Nguyễn Văn A"
                      style={{ transition: 'all 0.3s ease' }}
                    />
                  </div>
                  {fullName.trim().length >= 2 && fullName.length > 0 && (
                    <p className="text-xs text-danger mt-1">
                      Họ & Tên tối thiểu 2 ký tự
                    </p>
                  )}
                </Field>
              </div>
              <div className="col-sm-6">
                <Field label="Email">
                  <div className="input-group shadow-sm">
                    <span className="input-group-text bg-info-subtle border-end-0 text-info-emphasis">
                      <svg
                        className="bi"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.033V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z" />
                      </svg>
                    </span>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-control border-start-0"
                      type="email"
                      placeholder="email@example.com"
                      style={{ transition: 'all 0.3s ease' }}
                    />
                  </div>
                </Field>
              </div>
              <div className="col-sm-6">
                <Field label="Số điện thoại">
                  <div className="input-group shadow-sm">
                    <span className="input-group-text bg-info-subtle border-end-0 text-info-emphasis">
                      <svg
                        className="bi"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z" />
                      </svg>
                    </span>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="form-control border-start-0"
                      inputMode="tel"
                      placeholder="0123456789"
                      style={{ transition: 'all 0.3s ease' }}
                    />
                  </div>
                </Field>
              </div>
              <div className="col-sm-6">
                <Field label="Phòng ban">
                  <input
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="form-control shadow-sm"
                    placeholder="Nhập phòng ban"
                    style={{ transition: 'all 0.3s ease' }}
                  />
                </Field>
              </div>
              <div className="col-sm-6">
                <Field label="Chức vụ">
                  <input
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="form-control shadow-sm"
                    placeholder="Nhập chức vụ"
                    style={{ transition: 'all 0.3s ease' }}
                  />
                </Field>
              </div>
              <div className="col-sm-6">
                <Field label="Trạng thái">
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as 'active' | 'inactive')
                    }
                    className="form-select shadow-sm hrm-select bg-secondary-subtle"
                    style={{ transition: 'all 0.3s ease' }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </Field>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button
                type="submit"
                disabled={!canSave}
                className="btn btn-success bg-gradient d-flex align-items-center gap-2 hrm-btn"
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
                Lưu
              </button>
              <Link
                to="/employees"
                className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2 hrm-btn bg-danger-subtle"
              >
                <svg
                  className="bi"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" />
                </svg>
                Hủy
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-sm text-dark mb-1 fw-semibold">{label}</div>
      {children}
    </div>
  );
}
