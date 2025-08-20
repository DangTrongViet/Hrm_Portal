import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getJSON, postJSON } from '../../../lib/http';
import '../../../../public/css/employees/EmployeeCreatePage.css';

type UserOption = { id: number; name: string; email: string };
type CreatePayload = {
  full_name: string;
  email?: string | null;
  phone?: string | null;
  department?: string | null;
  position?: string | null;
  status?: 'active' | 'inactive';
  user_id?: number | null;
};

export default function EmployeeCreatePage() {
  const nav = useNavigate();

  // form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  // user link
  const [userId, setUserId] = useState<number | ''>('');
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  // load available users for linking
  useEffect(() => {
    (async () => {
      try {
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
        console.error(e);
      }
    })();
  }, []);

  // auto-fill fields when user is selected
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

  // sync user data when options are loaded
  useEffect(() => {
    if (userId === '') return;
    const u = userOptions.find((x) => x.id === Number(userId));
    if (u) {
      setEmail(u.email || '');
      setFullName(u.name || '');
    }
  }, [userId, userOptions]);

  const canSubmit = useMemo(() => {
    return fullName.trim().length >= 2 && !loading;
  }, [fullName, loading]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setErr('');
    try {
      const payload: CreatePayload = {
        full_name: fullName.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        department: department.trim() || null,
        position: position.trim() || null,
        status,
        user_id: userId === '' ? null : Number(userId),
      };
      await postJSON(`/employees`, payload);
      alert('Tạo nhân viên thành công');
      nav('/employees');
    } catch (e: any) {
      setErr(e?.message || 'Tạo nhân viên thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="card shadow-lg border-0 hrm-card bg-primary-subtle">
        <div className="card-body p-5">
          <div className="d-flex align-items-center justify-content-between mb-5">
            <h1 className="h3 fw-bold mb-0 gradient-text">Tạo nhân viên mới</h1>
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

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Liên kết User */}
            <div>
              <div className="text-sm text-dark mb-1 fw-semibold">
                Liên kết User (tuỳ chọn)
              </div>
              <select
                className="form-select shadow-sm hrm-select bg-secondary-subtle"
                value={userId}
                onChange={onChangeUser}
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

            {/* Form Fields */}
            <div className="row g-4">
              <div className="col-sm-6">
                <Field label="Họ & Tên *">
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="form-control shadow-sm"
                    placeholder="Nguyễn Văn A"
                  />
                  {fullName.trim().length < 2 && fullName.length > 0 && (
                    <p className="text-xs text-danger mt-1">
                      Họ & Tên tối thiểu 2 ký tự
                    </p>
                  )}
                </Field>
              </div>

              <div className="col-sm-6">
                <Field label="Email">
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-control shadow-sm"
                    type="email"
                    placeholder="email@company.com"
                  />
                </Field>
              </div>

              <div className="col-sm-6">
                <Field label="Số điện thoại">
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="form-control shadow-sm"
                    inputMode="tel"
                    placeholder="0123456789"
                  />
                </Field>
              </div>

              <div className="col-sm-6">
                <Field label="Phòng ban">
                  <input
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="form-control shadow-sm"
                    placeholder="Nhập phòng ban"
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
                    className="form-select shadow-sm"
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
                disabled={!canSubmit}
                className="btn btn-success bg-gradient d-flex align-items-center gap-2 hrm-btn"
              >
                {loading ? 'Đang tạo...' : 'Tạo nhân viên'}
              </button>
              <Link
                to="/employees"
                className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2 hrm-btn bg-danger-subtle"
              >
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
