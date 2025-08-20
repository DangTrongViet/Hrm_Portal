import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiGet, apiPost } from '../../../lib/api';
import '../../../../public/css/users/UserDetailPage.css';

type Permission = string;
type Role = { id: number; name: string; department?: string | null };
type UserDetail = {
  id: number;
  name: string;
  email: string;
  birthDate?: string;
  status: 'active' | 'inactive';
  phoneNumber?: string | null;
  address?: string | null;
  isVerified: boolean;
  mustChangePassword: boolean;
  role?: Role | null;
  permissionNames: Permission[];
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();

  const [data, setData] = useState<UserDetail | null>(null);
  const [roleNames, setRoleNames] = useState<string[] | null>(null);
  const [newRoleName, setNewRoleName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [changing, setChanging] = useState(false);
  const [doing, setDoing] = useState(false); // trạng thái hành động nút

  const loadUser = async () => {
    setLoading(true);
    setErr('');
    try {
      const u = await apiGet<UserDetail>(`/users/${id}`);
      setData(u);
      setNewRoleName(u.role?.name ?? '');
    } catch (e: any) {
      setErr(e?.message || 'Không tải được chi tiết user');
    } finally {
      setLoading(false);
    }
  };

  const loadAllRoleNames = async () => {
    try {
      const res = await apiGet<any>(`/roles/rolesName?minimal=1`);
      const names: string[] = Array.isArray(res)
        ? typeof res[0] === 'string'
          ? (res as string[])
          : (res as Array<{ name: string }>).map((r) => r.name)
        : Array.isArray(res?.data)
          ? typeof res.data[0] === 'string'
            ? (res.data as string[])
            : res.data.map((r: any) => r.name)
          : [];
      setRoleNames(names);
    } catch (e: any) {
      alert(e?.message || 'Không tải được danh sách vai trò');
    }
  };

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const initials = useMemo(() => {
    const n = (data?.name || '').trim();
    if (!n) return 'U';
    const parts = n.split(/\s+/);
    const first = parts[0]?.[0] || '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }, [data?.name]);

  const onStartChangeRole = async () => {
    setChanging(true);
    if (!roleNames) await loadAllRoleNames();
  };

  const onCancelChangeRole = () => {
    setChanging(false);
    setRoleNames(null);
    setNewRoleName(data?.role?.name ?? '');
  };

  const onAssignRole = async () => {
    if (!newRoleName || !id) return;
    try {
      setDoing(true);
      await apiPost(`/users/${id}/role`, { roleName: newRoleName });
      await loadUser();
      setChanging(false);
      setRoleNames(null);
    } catch (e: any) {
      alert(e?.message || 'Gán role thất bại');
    } finally {
      setDoing(false);
    }
  };

  const onResetPassword = async () => {
    if (!id) return;
    if (!confirm('Gửi email đặt lại mật khẩu cho người dùng này?')) return;
    try {
      setDoing(true);
      await apiPost(`/users/${id}/reset-password`);
      alert('Đã gửi email reset (nếu cấu hình mailer)');
    } catch (e: any) {
      alert(e?.message || 'Không gửi được reset email');
    } finally {
      setDoing(false);
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
        <p className="mt-3">Đang tải chi tiết người dùng...</p>
      </div>
    );
  }

  if (err) {
    return (
      <div className="container py-5">
        <div
          className="alert alert-danger d-flex align-items-center gap-2"
          role="alert"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
          </svg>
          <span>{err}</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container py-5 text-center text-muted">
        <svg
          className="mb-2 text-muted"
          width="24"
          height="24"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z" />
          <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0z" />
        </svg>
        <p>Không tìm thấy người dùng</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="card user-card mb-4">
        <div className="card-body user-header p-4">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb breadcrumb-lite mb-3">
              <li className="breadcrumb-item">
                <Link className="text-white text-decoration-none" to="/users">
                  Người dùng
                </Link>
              </li>
              <li
                className="breadcrumb-item active text-white-50"
                aria-current="page"
              >
                Chi tiết
              </li>
            </ol>
          </nav>

          <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
            <div className="d-flex align-items-center gap-3">
              <div className="avatar-circle">{initials}</div>
              <div>
                <h1 className="h4 fw-bold mb-1 gradient-text">{data.name}</h1>
                <div className="small">
                  <span
                    className={`badge ${data.status === 'active' ? 'text-bg-success' : 'text-bg-warning'} bg-gradient me-2`}
                  >
                    {data.status === 'active'
                      ? 'Đang hoạt động'
                      : 'Ngưng hoạt động'}
                  </span>
                  {data.role?.name && (
                    <span className="badge text-bg-light text-dark">
                      {data.role.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button
                onClick={() => nav(-1)}
                className="btn btn-outline-light btn-sm hrm-btn"
              >
                Quay lại
              </button>
              <button
                onClick={onResetPassword}
                className="btn btn-warning bg-gradient btn-sm hrm-btn"
                disabled={doing}
              >
                {doing ? (
                  <span className="spinner-border spinner-border-sm me-2" />
                ) : (
                  <i className="bi bi-shield-lock me-2"></i>
                )}
                Gửi email reset
              </button>
            </div>
          </div>
        </div>

        <div className="card-body">
          {/* Info */}
          <div className="info-card p-4 mb-4">
            <h2 className="h6 fw-bold text-primary mb-3">
              Thông tin người dùng
            </h2>
            <div className="row g-4 info-grid">
              <Info label="Họ tên" value={data.name} />
              <Info
                label="Email"
                value={<span className="text-info-emphasis">{data.email}</span>}
              />
              <Info label="SĐT" value={data.phoneNumber || '—'} />
              <Info label="Địa chỉ" value={data.address || '—'} />
              <Info
                label="Ngày sinh"
                value={
                  data.birthDate
                    ? new Date(data.birthDate).toLocaleDateString('vi-VN')
                    : '—'
                }
              />
              <Info
                label="Xác minh"
                value={
                  data.isVerified ? (
                    <span className="text-success fw-semibold">
                      Đã xác minh
                    </span>
                  ) : (
                    <span className="text-danger fw-semibold">
                      Chưa xác minh
                    </span>
                  )
                }
              />
              <Info
                label="Phải đổi mật khẩu"
                value={
                  data.mustChangePassword ? (
                    <span className="text-warning fw-semibold">Có</span>
                  ) : (
                    'Không'
                  )
                }
              />
              <Info label="Vai trò hiện tại" value={data.role?.name || '—'} />

              <div className="col-12">
                <div className="label">Quyền hiện có</div>
                <div className="d-flex flex-wrap gap-2">
                  {data.permissionNames.length ? (
                    data.permissionNames.map((p) => (
                      <span key={p} className="badge-perm">
                        {p}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </div>
              </div>

              <div className="col-12 meta-block small text-muted">
                <span className="me-3">
                  Tạo lúc:{' '}
                  <strong className="text-dark">
                    {new Date(data.createdAt).toLocaleString('vi-VN')}
                  </strong>
                </span>
                <span className="me-3">
                  Cập nhật:{' '}
                  <strong className="text-dark">
                    {new Date(data.updatedAt).toLocaleString('vi-VN')}
                  </strong>
                </span>
                <span>
                  Đăng nhập gần nhất:{' '}
                  <strong className="text-dark">
                    {data.lastLoginAt
                      ? new Date(data.lastLoginAt).toLocaleString('vi-VN')
                      : '—'}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Role assign */}
          <div className="info-card p-4 mb-4 role-wrap">
            <h2 className="h6 fw-bold text-primary mb-3">Gán vai trò</h2>
            {!changing ? (
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div className="value">
                  Vai trò:{' '}
                  <span className="fw-semibold">{data.role?.name || '—'}</span>
                </div>
                <button
                  onClick={onStartChangeRole}
                  className="btn btn-outline-primary btn-sm hrm-btn"
                >
                  Đổi vai trò
                </button>
              </div>
            ) : (
              <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-3">
                <select
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="form-select shadow-sm"
                >
                  <option value="">-- Chọn vai trò --</option>
                  {(Array.isArray(roleNames) ? roleNames : []).map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <div className="d-flex gap-2">
                  <button
                    onClick={onAssignRole}
                    className="btn btn-success btn-sm hrm-btn"
                    disabled={doing || !newRoleName}
                  >
                    {doing ? (
                      <span className="spinner-border spinner-border-sm me-2" />
                    ) : (
                      <i className="bi bi-check2 me-2"></i>
                    )}
                    Cập nhật
                  </button>
                  <button
                    onClick={onCancelChangeRole}
                    className="btn btn-outline-danger btn-sm hrm-btn"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Danger zone */}
          <div className="info-card p-4">
            <h2 className="h6 fw-bold text-danger mb-3">Bảo mật</h2>
            <div className="d-flex flex-wrap gap-2">
              <button
                onClick={onResetPassword}
                className="btn btn-warning bg-gradient hrm-btn"
                disabled={doing}
              >
                {doing ? (
                  <span className="spinner-border spinner-border-sm me-2" />
                ) : (
                  <i className="bi bi-envelope-lock me-2"></i>
                )}
                Gửi email reset mật khẩu
              </button>
              <Link
                to={`/users/${data.id}/sessions`}
                className="btn btn-outline-secondary hrm-btn"
              >
                Phiên đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div className="col-sm-6 col-lg-4">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
    </div>
  );
}
