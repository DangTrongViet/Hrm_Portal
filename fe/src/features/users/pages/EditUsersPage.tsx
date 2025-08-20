// src/pages/users/EditUserPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiGet, apiPatch } from '../../../lib/api';

type RoleLite = { id: number; name: string; department?: string | null };

export default function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();

  const [form, setForm] = useState<any>(null);
  const [roles, setRoles] = useState<RoleLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string>('');
  const [toast, setToast] = useState<{ type: 'success' | 'danger'; msg: string } | null>(null);

  // ===== Helpers =====
  const setField = (name: string, value: any) => setForm((f: any) => ({ ...f, [name]: value }));

  const emailValid = useMemo(
    () => typeof form?.email === 'string' && /^\S+@\S+\.\S+$/.test(form.email.trim()),
    [form?.email]
  );
  const nameValid = useMemo(
    () => typeof form?.name === 'string' && form.name.trim().length >= 2,
    [form?.name]
  );

  // ===== Load user & roles =====
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const [user, rlist] = await Promise.allSettled([
          apiGet(`/users/${id}`),                    // BE: GET /admin/users/:id
          apiGet(`/roles?active=1`).catch(() => [])  // nếu chưa có route roles thì ignore
        ]);
        if (!alive) return;

        if (user.status === 'fulfilled') {
          setForm(user.value);
        } else {
          throw new Error((user as any).reason?.message || 'Không tải được user');
        }

        if (rlist.status === 'fulfilled' && Array.isArray(rlist.value?.data)) {
          setRoles(rlist.value.data as RoleLite[]);
        } else {
          // fallback: nếu không có API roles, vẫn render current role
          setRoles((prev) =>
            prev.length ? prev : (user as any).value?.role ? [(user as any).value.role] : []
          );
        }
      } catch (e: any) {
        setErr(e?.message || 'Có lỗi khi tải dữ liệu');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  // ===== Submit =====
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameValid) return setToast({ type: 'danger', msg: 'Tên tối thiểu 2 ký tự' });
    if (!emailValid) return setToast({ type: 'danger', msg: 'Email không hợp lệ' });

    try {
      setSaving(true);
      await apiPatch(`/users/${id}`, {
        name: form.name?.trim(),
        email: form.email?.trim().toLowerCase(),
        phoneNumber: form.phoneNumber || null,
        address: form.address || null,
        status: form.status,
        role_id: form.role?.id ?? form.role_id ?? undefined,
        isVerified: !!form.isVerified,
        birthDate: form.birthDate || null
      }); // BE: PATCH /admin/users/:id
      setToast({ type: 'success', msg: 'Cập nhật thành công' });
      setTimeout(() => nav('/users'), 600);
    } catch (e: any) {
      setToast({ type: 'danger', msg: e?.message || 'Cập nhật thất bại' });
    } finally {
      setSaving(false);
    }
  };

  // ===== UI =====
  if (loading) {
    return (
      <div className="container py-5">
        <div className="card p-5 shadow-sm">
          <div className="placeholder-glow">
            <span className="placeholder col-8 mb-3"></span>
            <span className="placeholder col-6 mb-3"></span>
            <span className="placeholder col-10 mb-3"></span>
            <span className="placeholder col-4 mb-3"></span>
          </div>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" className="me-2">
            <path d="M12 9v4" /><path d="M12 17h.01" /><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
          </svg>
          {err || 'Không tìm thấy dữ liệu'}
        </div>
        <Link to="/users" className="btn btn-outline-primary">Quay lại danh sách</Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Breadcrumb + actions */}
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item"><Link to="/users">Người dùng</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Sửa #{form.id}</li>
          </ol>
        </nav>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => nav(-1)}>Quay lại</button>
          <Link to={`/users/${form.id}`} className="btn btn-outline-primary btn-sm">Xem chi tiết</Link>
        </div>
      </div>

      {/* Header card */}
      <div className="card shadow-sm mb-4">
        <div className="card-body d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <h2 className="h5 mb-1">{form.name}</h2>
            <div className="text-muted small">{form.email}</div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className={`badge ${form.status === 'active' ? 'text-bg-success' : 'text-bg-warning'}`}>
              {form.status === 'active' ? 'Đang hoạt động' : 'Ngưng hoạt động'}
            </span>
            <span className={`badge ${form.isVerified ? 'text-bg-primary' : 'text-bg-secondary'}`}>
              {form.isVerified ? 'Đã xác minh' : 'Chưa xác minh'}
            </span>
          </div>
        </div>
      </div>

      {/* Form card */}
      <form onSubmit={onSubmit} className="card shadow-sm">
        <div className="card-header bg-white">
          <h3 className="h6 mb-0">Thông tin tài khoản</h3>
        </div>
        <div className="card-body">
          <div className="row g-4">
            {/* Left column */}
            <div className="col-12 col-lg-6">
              <div className="mb-3">
                <label className="form-label">Tên<span className="text-danger">*</span></label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-person"></i>
                  </span>
                  <input
                    className={`form-control ${!nameValid ? 'is-invalid' : ''}`}
                    value={form.name || ''}
                    onChange={(e) => setField('name', e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn A"
                  />
                  {!nameValid && <div className="invalid-feedback">Tên tối thiểu 2 ký tự</div>}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Email<span className="text-danger">*</span></label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    className={`form-control ${!emailValid ? 'is-invalid' : ''}`}
                    value={form.email || ''}
                    onChange={(e) => setField('email', e.target.value)}
                    placeholder="name@example.com"
                  />
                  {!emailValid && <div className="invalid-feedback">Email không hợp lệ</div>}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Số điện thoại</label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-telephone"></i>
                  </span>
                  <input
                    className="form-control"
                    value={form.phoneNumber || ''}
                    onChange={(e) => setField('phoneNumber', e.target.value)}
                    placeholder="09xx..."
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Địa chỉ</label>
                <input
                  className="form-control"
                  value={form.address || ''}
                  onChange={(e) => setField('address', e.target.value)}
                  placeholder="Số nhà, đường, quận/huyện..."
                />
              </div>
            </div>

            {/* Right column */}
            <div className="col-12 col-lg-6">
              <div className="mb-3">
                <label className="form-label">Trạng thái</label>
                <select
                  className="form-select"
                  value={form.status || 'active'}
                  onChange={(e) => setField('status', e.target.value)}
                >
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Ngưng hoạt động</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Vai trò</label>
                <select
                  className="form-select"
                  value={form.role?.id ?? ''}
                  onChange={(e) =>
                    setForm((f: any) => ({ ...f, role: { ...(f.role || {}), id: Number(e.target.value) } }))
                  }
                >
                  <option value="">— Chọn vai trò —</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}{r.department ? ` • ${r.department}` : ''}
                    </option>
                  ))}
                </select>
                <div className="form-text">BE nhận `role_id` — mình sẽ map từ chọn này khi submit.</div>
              </div>

              <div className="mb-3">
                <label className="form-label d-block">Xác minh tài khoản</label>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="verifiedSwitch"
                    checked={!!form.isVerified}
                    onChange={(e) => setField('isVerified', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="verifiedSwitch">
                    {form.isVerified ? 'Đã xác minh (OTP/Invite sẽ được dọn khi lưu)' : 'Chưa xác minh'}
                  </label>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Ngày sinh</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.birthDate ? new Date(form.birthDate).toISOString().substring(0,10) : ''}
                  onChange={(e) => setField('birthDate', e.target.value || null)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card-footer bg-white d-flex justify-content-between align-items-center">
          <small className="text-muted">
            Tạo: {new Date(form.createdAt || form.created_at || Date.now()).toLocaleString()}
          </small>
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-outline-secondary" onClick={() => nav('/users')}>Huỷ</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Đang lưu…' : 'Lưu thay đổi'}
            </button>
          </div>
        </div>
      </form>

      {/* Toast */}
      {toast && (
        <div
          className={`toast align-items-center text-bg-${toast.type} border-0 show position-fixed`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          style={{ right: 16, bottom: 16, zIndex: 1080, minWidth: 280 }}
        >
          <div className="d-flex">
            <div className="toast-body">{toast.msg}</div>
            <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setToast(null)} />
          </div>
        </div>
      )}
    </div>
  );
}
