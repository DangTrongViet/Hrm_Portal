import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postJSON } from '../../../lib/http';
import '../../../../public/css/permissions/PermissionCreatePage.css';

export default function PermissionCreatePage() {
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const nameRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const nameValid = name.trim().length > 0;
  const can = nameValid && !loading;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!can) return;
    setLoading(true);
    setErr('');

    try {
      await postJSON(`/permissions`, {
        name: name.trim(),
        description: desc.trim() || null,
      });
      // Có thể thay alert bằng toast nếu bạn có lib toast
      alert('✅ Đã tạo permission');
      nav('/permissions', { replace: true });
    } catch (e: any) {
      setErr(e?.message || '❌ Tạo permission thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="pcp-header card shadow-sm border-0 mb-4">
        <div className="card-body p-4 d-flex align-items-center justify-content-between">
          <div>
            <h1 className="h4 mb-1 text-white">➕ Tạo Permission</h1>
            <div className="text-white-50 small">
              Điền thông tin và bấm <strong>Tạo permission</strong>.
            </div>
          </div>
          <button
            onClick={() => nav(-1)}
            className="btn btn-outline-light btn-sm rounded-pill px-3"
          >
            ↩ Quay lại
          </button>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={onSubmit} noValidate>
        <div className="card shadow-sm border-0 pcp-card">
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Tên *</label>
                <input
                  ref={nameRef}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`form-control ${!nameValid && name ? 'is-invalid' : ''}`}
                  placeholder="VD: user.read"
                  required
                />
                {!nameValid && name.length > 0 && (
                  <div className="invalid-feedback">
                    Tên quyền không được để trống.
                  </div>
                )}
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Mô tả</label>
                <input
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="form-control"
                  placeholder="Mô tả ngắn cho quyền"
                />
              </div>
            </div>

            {err && (
              <div className="alert alert-danger bg-danger-subtle border-danger-subtle mt-3 mb-0">
                {err}
              </div>
            )}
          </div>

          <div className="card-footer bg-white d-flex justify-content-end">
            <button
              type="submit"
              disabled={!can}
              className="btn btn-success rounded-pill px-4 pcp-btn"
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
                'Tạo permission'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
