import { useEffect, useState } from 'react';
import { getJSON, patchJSON } from '../../../lib/http';
import { useNavigate } from 'react-router-dom';
import '../../../../public/css/account/ProfilePage.css';
type Role = { id: number; name: string; department?: string | null };
type MeResp = {
  id: number;
  name: string;
  email: string;
  birthDate?: string | null;
  status: 'active' | 'inactive';
  phoneNumber?: string | null;
  address?: string | null;
  isVerified: boolean;
  role?: Role | null;
  permissionNames: string[];
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function ProfilePage() {
  const nav = useNavigate();
  const [me, setMe] = useState<MeResp | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // edit mode
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birth, setBirth] = useState('');
  const [address, setAdress] = useState('');

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const data = await getJSON<MeResp>('/me');
      setMe(data);
      // fill form
      setName(data.name || '');
      setEmail(data.email || '');
      setAdress(data.address || '');
      setPhone(data.phoneNumber || '');
      setBirth(data.birthDate ? data.birthDate.slice(0, 10) : ''); // yyyy-mm-dd
    } catch (e: any) {
      setErr(e?.message || 'Không tải được thông tin cá nhân');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        phoneNumber: phone.trim() || null,
        birthDate: birth ? new Date(birth).toISOString() : null,
        address: address.trim(),
      };
      const updated = await patchJSON<MeResp>('/me', payload);
      setMe(updated);
      setEditing(false);
      alert('Đã cập nhật thông tin');
    } catch (e: any) {
      alert(e?.message || 'Cập nhật thất bại');
    }
  };

  if (loading)
    return (
      <div className="text-center text-secondary-emphasis py-4">Đang tải…</div>
    );
  if (err) return <div className="hrm-error p-4">{err}</div>;
  if (!me)
    return (
      <div className="text-center text-secondary-emphasis py-4">
        Không có dữ liệu
      </div>
    );

  return (
    <div className="hrm-container">
      <div className="container">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h1 className="gradient-text hrm-title">Thông tin cá nhân</h1>
          <div className="hrm-action-group">
            <button
              onClick={() => nav(-1)}
              className="btn hrm-btn hrm-button-secondary rounded-pill px-4"
            >
              Trở lại
            </button>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="btn hrm-btn hrm-button-primary rounded-pill px-4"
              >
                Chỉnh sửa
              </button>
            ) : (
              <button
                onClick={() => {
                  setEditing(false);
                  load();
                }}
                className="btn hrm-btn hrm-button-secondary rounded-pill px-4"
              >
                Huỷ
              </button>
            )}
          </div>
        </div>

        {!editing ? (
          <div className="hrm-card bg-light p-4">
            <div className="row g-3">
              <Info label="Họ tên" value={me.name} />
              <Info label="Email" value={me.email} />
              <Info label="SĐT" value={me.phoneNumber || '—'} />
              <Info
                label="Ngày sinh"
                value={
                  me.birthDate
                    ? new Date(me.birthDate).toLocaleDateString()
                    : '—'
                }
              />
              <Info label="Trạng thái" value={me.status} />
              <Info
                label="Xác minh"
                value={me.isVerified ? 'Đã xác minh' : 'Chưa'}
              />
              <Info
                label="Đăng nhập gần nhất"
                value={
                  me.lastLoginAt
                    ? new Date(me.lastLoginAt).toLocaleString()
                    : '—'
                }
              />
              <Info label="Vai trò" value={me.role?.name || '—'} />
              <Info label="Phòng ban" value={me.role?.department || '—'} />
              <div className="col-12">
                <div className="hrm-info-label mb-1">Quyền</div>
                <div className="d-flex flex-wrap gap-2">
                  {me.permissionNames.length ? (
                    me.permissionNames.map((p) => (
                      <span
                        key={p}
                        className="hrm-badge hrm-badge-permission px-2 py-1 rounded-pill text-xs"
                      >
                        {p}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-secondary-emphasis">—</span>
                  )}
                </div>
              </div>
              <div className="col-12">
                <div className="hrm-info-label mb-1">Địa chỉ</div>
                <div className="hrm-info-value">{me.address || '—'}</div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={onSave} className="hrm-form hrm-card bg-light">
            <div className="row g-3">
              <Field label="Họ tên">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-control hrm-form-input"
                  required
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control hrm-form-input"
                  required
                />
              </Field>
              <Field label="Số điện thoại">
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-control hrm-form-input"
                  inputMode="tel"
                />
              </Field>
              <Field label="Địa chỉ">
                <input
                  type="address"
                  value={address}
                  onChange={(e) => setAdress(e.target.value)}
                  className="form-control hrm-form-input"
                />
              </Field>
              <Field label="Ngày sinh">
                <input
                  type="date"
                  value={birth}
                  onChange={(e) => setBirth(e.target.value)}
                  className="form-control hrm-form-input"
                />
              </Field>
            </div>
            <div className="hrm-action-group mt-3">
              <button className="btn hrm-btn hrm-button-primary rounded-pill">
                Lưu
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  load();
                }}
                className="btn hrm-btn hrm-button-secondary rounded-pill"
              >
                Huỷ
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div className="col-sm-6">
      <div className="hrm-info-label">{label}</div>
      <div className="hrm-info-value">{value}</div>
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
    <div className="col-sm-6">
      <div className="hrm-form-label mb-1">{label}</div>
      {children}
    </div>
  );
}
