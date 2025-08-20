import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getJSON, postJSON, putJSON } from '../../../lib/http';
import type { Permission } from '../../../types/rbac';
import '../../../../public/css/roles/RoleCreatePage.css';

export default function RoleCreatePage() {
  const nav = useNavigate();

  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [description, setDescription] = useState('');
  const [allPerms, setAllPerms] = useState<Permission[]>([]);
  const [sel, setSel] = useState<number[]>([]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [q, setQ] = useState('');

  const can = useMemo(
    () => name.trim().length >= 2 && !loading,
    [name, loading]
  );

  useEffect(() => {
    (async () => {
      try {
        const res = await getJSON<{ data: Permission[] }>(
          `/permissions?pageSize=1000`
        );
        setAllPerms(Array.isArray(res?.data) ? res.data : []);
      } catch (e: any) {
        setErr(e?.message || 'Không tải được danh sách quyền');
      }
    })();
  }, []);

  const toggle = (pid: number, checked: boolean) => {
    setSel((s) =>
      checked ? Array.from(new Set([...s, pid])) : s.filter((x) => x !== pid)
    );
  };

  const filteredPerms = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return allPerms;
    return allPerms.filter((p) => {
      const n = (p.name ?? '').toLowerCase();
      const d = (p.description ?? '').toLowerCase();
      // Nếu Permission có code ở backend, bạn có thể thêm:
      // const c = (p as any).code?.toLowerCase?.() ?? "";
      return n.includes(term) || d.includes(term);
    });
  }, [q, allPerms]);

  const selectAllFiltered = () => {
    const ids = filteredPerms.map((p) => p.id);
    setSel((s) => Array.from(new Set([...s, ...ids])));
  };

  const unselectAllFiltered = () => {
    const ids = new Set(filteredPerms.map((p) => p.id));
    setSel((s) => s.filter((id) => !ids.has(id)));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!can) return;
    setLoading(true);
    setErr('');

    try {
      const role = await postJSON<{ id: number }>(`/roles`, {
        name: name.trim(),
        department: department.trim() || null,
        description: description.trim() || null,
      });

      if (sel.length) {
        await putJSON(`/roles/${role.id}/permissions`, { permissionIds: sel });
      }

      alert('✅ Đã tạo vai trò');
      nav(`/roles/${role.id}`, { replace: true });
    } catch (e: any) {
      setErr(e?.message || '❌ Tạo vai trò thất bại');
    } finally {
      setLoading(false);
    }
  };

  const totalCount = allPerms.length;
  const selectedCount = sel.length;

  return (
    <div className="rolecreate container py-5">
      <div className="rc-card mb-4">
        <div className="rc-header p-4 d-flex justify-content-between align-items-center">
          <h1 className="h5 fw-bold mb-0 gradient-text">➕ Tạo vai trò mới</h1>
          <button
            onClick={() => nav(-1)}
            className="btn btn-outline-light btn-sm rc-btn"
          >
            ↩ Quay lại
          </button>
        </div>

        <div className="card-body p-4 rc-form">
          <form onSubmit={onSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label fw-semibold">Tên vai trò *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-control"
                  placeholder="VD: HR Manager"
                  required
                />
                {name.length > 0 && name.trim().length < 2 && (
                  <div className="form-text text-danger">
                    Tên tối thiểu 2 ký tự
                  </div>
                )}
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">Phòng ban</label>
                <input
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="form-control"
                  placeholder="VD: HR"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">Mô tả</label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-control"
                  placeholder="Mô tả ngắn"
                />
              </div>
            </div>

            <div className="rc-perm-card p-3">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                <div className="d-flex align-items-center gap-2">
                  <h2 className="h6 rc-section-title mb-0">📋 Chọn quyền</h2>
                  <span className="rc-chip" title="Đã chọn / Tổng số quyền">
                    {selectedCount}/{totalCount} đã chọn
                  </span>
                </div>
                <div className="d-flex gap-2 flex-wrap align-items-center">
                  <div className="position-relative rc-search">
                    <i className="bi bi-search"></i>
                    <input
                      className="form-control"
                      placeholder="Tìm theo tên / mô tả"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      aria-label="Tìm quyền"
                      style={{ width: 260 }}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm rc-btn"
                    onClick={selectAllFiltered}
                    disabled={!filteredPerms.length}
                  >
                    Chọn tất cả (đang lọc)
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm rc-btn"
                    onClick={unselectAllFiltered}
                    disabled={!filteredPerms.length}
                  >
                    Bỏ chọn (đang lọc)
                  </button>
                </div>
              </div>

              <div className="row row-cols-1 row-cols-md-2 g-3 rc-perm-list">
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
                        <div className="fw-semibold">{p.name}</div>
                        <div className="text-muted small">
                          {p.description ?? '—'}
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
                {!filteredPerms.length && (
                  <div className="col">
                    <div className="text-muted small p-3">
                      Không có quyền phù hợp bộ lọc.
                    </div>
                  </div>
                )}
              </div>

              <div className="rc-sticky-footer d-flex justify-content-between align-items-center mt-3">
                <div className="text-muted small">
                  Đang hiển thị <strong>{filteredPerms.length}</strong> /{' '}
                  <strong>{totalCount}</strong> quyền.
                </div>
                <div className="d-flex gap-2">
                  {err && (
                    <div className="alert alert-danger py-1 px-2 mb-0 bg-danger-subtle border-danger-subtle">
                      {err}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={!can}
                    className="btn btn-success rc-btn"
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        />
                        Đang tạo...
                      </>
                    ) : (
                      <>💾 Tạo vai trò</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
