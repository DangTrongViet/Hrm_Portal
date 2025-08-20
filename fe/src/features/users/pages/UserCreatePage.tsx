import { useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost } from '../../../lib/api';
import { useNavigate } from 'react-router-dom';
import '../../../../public/css/users/UserCreatePage.css';

type RoleLite = { id: number; name: string };
type CreateResp = {
  id: number;
  email: string;
  sent?: boolean;
  tempPassword?: string;
};

export default function UserCreatePage() {
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [birthDate, setBirthDate] = useState<string>('');
  const [sendInvite, setSendInvite] = useState(true);

  const [roles, setRoles] = useState<RoleLite[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const [created, setCreated] = useState<CreateResp | null>(null);
  const [showTempPwd, setShowTempPwd] = useState(false);

  // field errors (realtime)
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      try {
        const fromRolesName = await apiGet<any>(
          `/roles/rolesName?minimal=1&_=${Date.now()}`
        );
        let list: RoleLite[] = Array.isArray(fromRolesName)
          ? typeof fromRolesName[0] === 'object' &&
            fromRolesName[0] &&
            'id' in fromRolesName[0] &&
            'name' in fromRolesName[0]
            ? (fromRolesName as RoleLite[])
            : []
          : Array.isArray(fromRolesName?.data) &&
              typeof fromRolesName.data[0] === 'object' &&
              'id' in fromRolesName.data[0]
            ? (fromRolesName.data as RoleLite[])
            : [];

        if (!list.length) {
          const fromRoles = await apiGet<any>(
            `/roles?minimal=1&_=${Date.now()}`
          );
          list = Array.isArray(fromRoles)
            ? typeof fromRoles[0] === 'object' && 'id' in fromRoles[0]
              ? (fromRoles as RoleLite[])
              : []
            : Array.isArray(fromRoles?.data) &&
                typeof fromRoles.data[0] === 'object' &&
                'id' in fromRoles.data[0]
              ? (fromRoles.data as RoleLite[])
              : [];
        }

        if (!list.length) {
          setErr(
            'API roles cần trả về dạng [{ id, name }]. Kiểm tra /roles/rolesName?minimal=1 hoặc /roles?minimal=1'
          );
        }
        setRoles(list);
      } catch (e: any) {
        setErr(e?.message || 'Không tải được vai trò');
      }
    })();
  }, []);

  const emailValid = /\S+@\S+\.\S+/.test(email);
  const roleValid = !!roleId;
  const nameValid = name.trim().length >= 2;

  const canSubmit = useMemo(() => {
    return nameValid && emailValid && roleValid && !loading;
  }, [nameValid, emailValid, roleValid, loading]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, role: true });

    if (!canSubmit) return;

    setLoading(true);
    setErr('');

    try {
      const role_id = roleId ? Number(roleId) : undefined;
      const payload = {
        name: name.trim(),
        email: email.trim(),
        role_id,
        sendInvite,
        phoneNumber: phoneNumber.trim() || undefined,
        birthDate: birthDate ? new Date(birthDate).toISOString() : undefined,
      };

      const res = await apiPost<CreateResp>('/users', payload);
      setCreated(res);
      if (res?.tempPassword) {
        setShowTempPwd(true);
      } else {
        alert(`Đã gửi email mời tới ${res?.email || email}`);
        // reset form
        setName('');
        setEmail('');
        setRoleId('');
        setPhoneNumber('');
        setBirthDate('');
        setSendInvite(true);
        setTouched({});
      }
    } catch (e: any) {
      setErr(e?.message || 'Tạo tài khoản thất bại');
    } finally {
      setLoading(false);
    }
  };

  const copyTempPassword = async () => {
    if (!created?.tempPassword) return;
    try {
      await navigator.clipboard.writeText(created.tempPassword);
      alert('Đã copy mật khẩu tạm');
    } catch {
      // ignore
    }
  };

  const invalidName = touched.name && !nameValid;
  const invalidEmail = touched.email && !emailValid;
  const invalidRole = touched.role && !roleValid;

  return (
    <div className="container py-5">
      <div className="card uc-card bg-primary-subtle mb-4">
        <div className="card-body uc-header p-4 d-flex align-items-center justify-content-between">
          <h1 className="h4 fw-bold mb-0 gradient-text">
            Tạo tài khoản nhân viên
          </h1>
          <button
            onClick={() => nav(-1)}
            className="btn btn-outline-light btn-sm d-flex align-items-center gap-2 hrm-btn"
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path
                fillRule="evenodd"
                d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"
              />
            </svg>
            Trở lại
          </button>
        </div>

        <div className="card-body p-4">
          {err && (
            <div
              className="alert alert-danger d-flex align-items-center gap-2 mb-4 bg-danger-subtle border-danger-subtle"
              role="alert"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
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

          <form onSubmit={onSubmit} className="uc-form" noValidate>
            {/* Name */}
            <div className="mb-3">
              <label className="field-label">Họ tên</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                className={`form-control shadow-sm ${invalidName ? 'is-invalid' : ''}`}
                placeholder="Nhập họ tên"
                required
              />
              {invalidName && (
                <div className="invalid-feedback">
                  Họ tên tối thiểu 2 ký tự.
                </div>
              )}
            </div>

            {/* Email */}
            <div className="mb-3">
              <label className="field-label">Email công ty</label>
              <div
                className={`input-group shadow-sm ${invalidEmail ? 'is-invalid' : ''}`}
              >
                <span className="input-group-text bg-info-subtle border-end-0 text-info-emphasis">
                  <svg
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
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  className={`form-control border-start-0 ${invalidEmail ? 'is-invalid' : ''}`}
                  type="email"
                  placeholder="Nhập email công ty"
                  required
                />
              </div>
              {!emailValid && touched.email && (
                <div className="text-danger small mt-1">Email chưa hợp lệ.</div>
              )}
              <div className="uc-tip mt-1">
                Email sẽ dùng để gửi lời mời kích hoạt tài khoản.
              </div>
            </div>

            {/* Role */}
            <div className="mb-3">
              <label className="field-label">Vai trò</label>
              <select
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, role: true }))}
                className={`form-select shadow-sm ${invalidRole ? 'is-invalid' : ''}`}
                required
                disabled={!roles.length}
              >
                <option value="">
                  {roles.length
                    ? '-- Chọn vai trò --'
                    : 'Đang tải danh sách vai trò...'}
                </option>
                {roles.map((r) => (
                  <option key={r.id} value={String(r.id)}>
                    {r.name}
                  </option>
                ))}
              </select>
              {invalidRole && (
                <div className="invalid-feedback">Vui lòng chọn vai trò.</div>
              )}
              {!roles.length && (
                <div className="uc-tip mt-1">
                  Không tải được vai trò hoặc API chưa trả đúng dạng{' '}
                  <code>[&#123; id, name &#125;]</code>.
                </div>
              )}
            </div>

            {/* Phone + BirthDate */}
            <div className="row g-3">
              <div className="col-sm-6">
                <label className="field-label">Số điện thoại</label>
                <div className="input-group shadow-sm">
                  <span className="input-group-text bg-info-subtle border-end-0 text-info-emphasis">
                    <svg
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328z" />
                    </svg>
                  </span>
                  <input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="form-control border-start-0"
                    inputMode="tel"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
              </div>
              <div className="col-sm-6">
                <label className="field-label">Ngày sinh</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="form-control shadow-sm"
                />
              </div>
            </div>

            {/* Invite */}
            <div className="form-check mt-3">
              <input
                id="sendInvite"
                type="checkbox"
                checked={sendInvite}
                onChange={(e) => setSendInvite(e.target.checked)}
                className="form-check-input"
              />
              <label htmlFor="sendInvite" className="form-check-label">
                Gửi email mời kích hoạt{' '}
                <span className="uc-muted">(khuyến nghị)</span>
              </label>
            </div>

            {/* Global error (if any) */}
            {err && (
              <div
                className="alert alert-danger d-flex align-items-center gap-2 mt-3"
                role="alert"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
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

            {/* Actions */}
            <div className="d-flex gap-2 mt-3">
              <button
                type="submit"
                disabled={!canSubmit}
                className="btn btn-success bg-gradient d-flex align-items-center gap-2 hrm-btn"
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                    />
                    <span>Đang tạo...</span>
                  </>
                ) : (
                  <>
                    <svg
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                    </svg>
                    Tạo tài khoản
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => nav(-1)}
                className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2 hrm-btn"
              >
                <svg
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

      {/* Temp password modal */}
      {showTempPwd && created?.tempPassword && (
        <div
          className="modal show d-block uc-modal"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
          tabIndex={-1}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg bg-light">
              <div className="modal-body p-4">
                <h2 className="h5 fw-semibold text-primary mb-2">
                  Mật khẩu tạm (chỉ hiển thị 1 lần)
                </h2>
                <p className="uc-muted mb-3">
                  Hãy sao chép và gửi an toàn. Hệ thống sẽ yêu cầu đổi mật khẩu
                  khi đăng nhập.
                </p>
                <div className="input-group mb-3">
                  <input
                    type="text"
                    value={created.tempPassword}
                    className="form-control font-mono"
                    readOnly
                  />
                  <button
                    onClick={copyTempPassword}
                    className="btn btn-outline-primary hrm-btn"
                    type="button"
                  >
                    Copy
                  </button>
                </div>
                <div className="d-flex justify-content-end">
                  <button
                    onClick={() => {
                      setShowTempPwd(false);
                      setCreated(null);
                    }}
                    className="btn btn-success bg-gradient hrm-btn"
                  >
                    Đã lưu
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
