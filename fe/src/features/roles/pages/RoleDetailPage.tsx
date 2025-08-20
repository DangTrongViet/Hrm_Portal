import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJSON, patchJSON, putJSON } from '../../../lib/http';
import type { Role, Permission } from '../../../types/rbac';
import '../../../../public/css/roles/RoleDetailPage.css';

type RDetail = Role & { permissions: Permission[] };
type PagedPerm = { data: Permission[] };

export default function RoleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();

  const [role, setRole] = useState<RDetail | null>(null);
  const [allPerms, setAllPerms] = useState<Permission[]>([]);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [dept, setDept] = useState('');
  const [sel, setSel] = useState<number[]>([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // UI helpers
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingPerms, setSavingPerms] = useState(false);
  const [q, setQ] = useState('');

  const canSave = useMemo(() => name.trim().length > 0, [name]);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const r = await getJSON<RDetail>(`/roles/${id}`);
      setRole(r);
      setName(r.name);
      setDesc(r.description ?? '');
      setDept(r.department ?? '');
      setSel((r.permissions ?? []).map((p) => p.id));

      const perms = await getJSON<PagedPerm>(`/permissions?pageSize=1000`);
      setAllPerms(perms.data || []);
    } catch (e: any) {
      setErr(e?.message || 'Không tải được vai trò');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [id]);

  const toggle = (pid: number, checked: boolean) => {
    setSel((s) =>
      checked ? Array.from(new Set([...s, pid])) : s.filter((x) => x !== pid)
    );
  };

  const filteredPerms = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return allPerms;
    return allPerms.filter((p) => {
      const name = (p.name ?? '').toLowerCase();
      const code = (p.code ?? '').toLowerCase();
      const desc = (p.description ?? '').toLowerCase();
      return name.includes(term) || code.includes(term) || desc.includes(term);
    });
  }, [q, allPerms]);

  const selectedCount = sel.length;
  const totalCount = allPerms.length;

  const selectAllFiltered = () => {
    const ids = filteredPerms.map((p) => p.id);
    setSel((s) => Array.from(new Set([...s, ...ids])));
  };

  const unselectAllFiltered = () => {
    const setFiltered = new Set(filteredPerms.map((p) => p.id));
    setSel((s) => s.filter((id) => !setFiltered.has(id)));
  };

  const onSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave || !id) return;
    setSavingInfo(true);
    try {
      await patchJSON(`/roles/${id}`, {
        name: name.trim(),
        description: desc.trim() || null,
        department: dept.trim() || null,
      });
      await load();
      alert('✅ Đã lưu thông tin');
    } catch (e: any) {
      alert(e?.message || '❌ Lưu thất bại');
    } finally {
      setSavingInfo(false);
    }
  };

  const onSavePermissions = async () => {
    if (!id) return;
    setSavingPerms(true);
    try {
      await putJSON(`/roles/${id}/permissions`, { permissionIds: sel });
      await load();
      alert('✅ Đã cập nhật quyền');
    } catch (e: any) {
      alert(e?.message || '❌ Cập nhật quyền thất bại');
    } finally {
      setSavingPerms(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center text-muted">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-3">Đang tải thông tin vai trò...</p>
      </div>
    );
  }

  if (err) {
    return (
      <div className="container py-5">
        <div
          className="alert alert-danger bg-danger-subtle border-danger-subtle mx-auto w-75"
          role="alert"
        >
          {err}
        </div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="container py-5">
        <div
          className="alert alert-warning text-center mx-auto w-75"
          role="alert"
        >
          Không tìm thấy vai trò
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="rp-card mb-4">
        <div className="rp-header p-4 d-flex align-items-center justify-content-between">
          <h1 className="h5 fw-bold mb-0 gradient-text">
            🔐 Vai trò: {role.name}
          </h1>
          <button
            onClick={() => nav(-1)}
            className="btn btn-outline-light btn-sm rp-btn"
          >
            ↩ Quay lại
          </button>
        </div>

        <div className="card-body p-4 rp-form">
          {/* Info section */}
          <form onSubmit={onSaveInfo} className="mb-4">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label fw-semibold">Tên</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-control"
                  placeholder="Tên vai trò"
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Phòng ban</label>
                <input
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                  className="form-control"
                  placeholder="VD: Kinh doanh / Kỹ thuật"
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Mô tả</label>
                <input
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="form-control"
                  placeholder="Mô tả ngắn"
                />
              </div>
            </div>
            <div className="mt-3 d-flex align-items-center gap-2">
              <button
                disabled={!canSave || savingInfo}
                className="btn btn-primary rp-btn"
              >
                {savingInfo ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    />
                    Đang lưu...
                  </>
                ) : (
                  <>💾 Lưu thông tin</>
                )}
              </button>
              <span
                className="rp-chip"
                title="Tổng quyền hiện có trong vai trò"
              >
                {role.permissions?.length ?? 0} quyền đã gán
              </span>
            </div>
          </form>

          {/* Permissions section */}
          <div className="rp-perm-card bg-light-subtle p-3">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
              <div className="d-flex align-items-center gap-2">
                <h2 className="h6 rp-section-title mb-0">📋 Danh sách quyền</h2>
                <span className="rp-chip" title="Đã chọn / Tổng số quyền">
                  {selectedCount}/{totalCount} đã chọn
                </span>
              </div>
              <div className="d-flex flex-wrap align-items-center gap-2">
                <div className="position-relative rp-search">
                  <i className="bi bi-search"></i>
                  <input
                    className="form-control"
                    placeholder="Tìm theo tên / mã / mô tả"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    aria-label="Tìm quyền"
                    style={{ width: 260 }}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm rp-btn"
                  onClick={selectAllFiltered}
                  disabled={!filteredPerms.length}
                >
                  Chọn tất cả (đang lọc)
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm rp-btn"
                  onClick={unselectAllFiltered}
                  disabled={!filteredPerms.length}
                >
                  Bỏ chọn (đang lọc)
                </button>
              </div>
            </div>

            <div className="row row-cols-1 row-cols-md-2 g-3 rp-perm-list">
              {filteredPerms.map((p) => (
                <div key={p.id} className="col">
                  <label className="form-check d-flex align-items-start gap-3 p-3 bg-white border rounded shadow-sm">
                    <input
                      type="checkbox"
                      className="form-check-input mt-1"
                      checked={sel.includes(p.id)}
                      onChange={(e) => toggle(p.id, e.target.checked)}
                    />
                    <div>
                      <div className="fw-semibold">
                        {p.name}{' '}
                        {p.code ? (
                          <span className="rp-chip ms-1">{p.code}</span>
                        ) : null}
                      </div>
                      <div className="rp-muted small">
                        {p.description ?? '—'}
                      </div>
                    </div>
                  </label>
                </div>
              ))}
              {!filteredPerms.length && (
                <div className="col">
                  <div className="rp-muted small p-3">
                    Không có quyền phù hợp bộ lọc.
                  </div>
                </div>
              )}
            </div>

            {/* sticky footer actions */}
            <div className="rp-sticky-footer d-flex justify-content-between align-items-center mt-3">
              <div className="rp-muted small">
                Đang hiển thị <strong>{filteredPerms.length}</strong> /{' '}
                <strong>{totalCount}</strong> quyền.
              </div>
              <button
                onClick={onSavePermissions}
                className="btn btn-success rp-btn"
                disabled={savingPerms}
              >
                {savingPerms ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    />
                    Đang lưu quyền...
                  </>
                ) : (
                  <>💾 Lưu quyền</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
