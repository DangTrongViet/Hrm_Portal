import React, { useEffect, useMemo, useState } from 'react';
import { getJSON, postJSON, putJSON } from '../../../lib/http';
import type { Payroll, Employee } from '../../../types/payroll';
import '../../../../public/css/payroll/PayrollAdminform.css';

interface Props {
  payroll?: Payroll;
  onSuccess: () => void;
  onCancel: () => void;
}

/** Ép mọi giá trị tiền tệ về số an toàn */
const toNumber = (val: string | number | null | undefined): number => {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return Number.isFinite(val) ? val : 0;
  const n = Number(String(val).replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

const formatVND = (v: string | number | null | undefined) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    toNumber(v)
  );

const PayrollForm: React.FC<Props> = ({ payroll, onSuccess, onCancel }) => {
  const [form, setForm] = useState<Payroll>(payroll || {});
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingEmp, setLoadingEmp] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoadingEmp(true);
      try {
        const res = await getJSON<{
          items: Employee[];
          total: number;
          page: number;
          pageSize: number;
        }>('/employees');
        setEmployees(res?.items || []);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoadingEmp(false);
      }
    };
    fetchEmployees();
  }, []);

  // Tự tính net_salary khi các trường thay đổi
  const base = toNumber(form.base_salary);
  const bonus = toNumber(form.bonus);
  const deductions = toNumber(form.deductions);
  const net = useMemo(
    () => base + bonus - deductions,
    [base, bonus, deductions]
  );

  useEffect(() => {
    setForm((prev) => ({ ...prev, net_salary: net }));
  }, [net]);

  // Đảm bảo period_end >= period_start nếu có đủ đôi
  const minEnd = form.period_start || undefined;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumber =
    (name: 'base_salary' | 'bonus' | 'deductions') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      // Lưu dưới dạng string để input number kiểm soát, nhưng đã có toNumber ở trên
      setForm((prev) => ({ ...prev, [name]: value as unknown as string }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload: Payroll = {
        ...form,
        employee_id: form.employee_id ? Number(form.employee_id) : undefined,
        base_salary: base,
        bonus: bonus,
        deductions: deductions,
        net_salary: net,
      };

      if (payload.id) {
        await putJSON(`/payroll/admin/${payload.id}`, payload);
      } else {
        await postJSON('/payroll/admin', payload);
      }
      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Lỗi khi lưu bảng lương');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payroll-form-card card payroll-form">
      <div className="payroll-form-header card-header d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <i className="fas fa-file-invoice-dollar"></i>
          <h5 className="mb-0">
            {form.id ? 'Chỉnh sửa bảng lương' : 'Tạo bảng lương mới'}
          </h5>
        </div>
        {form.id && (
          <span className="badge bg-light text-dark">
            ID: <strong>{form.id}</strong>
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card-body">
          {error && (
            <div className="alert alert-danger">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          <div className="row g-3 input-compact">
            {/* Employee */}
            <div className="col-12 col-md-6">
              <label className="form-label">
                Nhân viên <span className="text-danger">*</span>
              </label>
              {loadingEmp ? (
                <div className="skeleton" />
              ) : (
                <select
                  name="employee_id"
                  className="form-select"
                  value={form.employee_id || ''}
                  onChange={handleChange}
                  required
                >
                  <option value="">— Chọn nhân viên —</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.full_name} (ID: {emp.id})
                    </option>
                  ))}
                </select>
              )}
              <div className="form-text small-hint">
                Dữ liệu từ endpoint <code>/employees</code>.
              </div>
            </div>

            {/* Period start */}
            <div className="col-6 col-md-3">
              <label className="form-label">Ngày bắt đầu</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-calendar-plus"></i>
                </span>
                <input
                  type="date"
                  name="period_start"
                  className="form-control"
                  value={form.period_start || ''}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Period end */}
            <div className="col-6 col-md-3">
              <label className="form-label">Ngày kết thúc</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-calendar-check"></i>
                </span>
                <input
                  type="date"
                  name="period_end"
                  className="form-control"
                  value={form.period_end || ''}
                  min={minEnd}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Base salary */}
            <div className="col-12 col-md-4">
              <label className="form-label">Lương cơ bản</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-sack-dollar"></i>
                </span>
                <input
                  type="number"
                  name="base_salary"
                  className="form-control"
                  value={form.base_salary ?? ''}
                  onChange={handleNumber('base_salary')}
                  min={0}
                  step="1000"
                  placeholder="0"
                />
              </div>
              <div className="form-text">
                <span className="preview-money base">
                  {formatVND(form.base_salary)}
                </span>
              </div>
            </div>

            {/* Bonus */}
            <div className="col-12 col-md-4">
              <label className="form-label">Thưởng</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-gift"></i>
                </span>
                <input
                  type="number"
                  name="bonus"
                  className="form-control"
                  value={form.bonus ?? ''}
                  onChange={handleNumber('bonus')}
                  min={0}
                  step="1000"
                  placeholder="0"
                />
              </div>
              <div className="form-text">
                <span className="preview-money bonus">
                  {formatVND(form.bonus)}
                </span>
              </div>
            </div>

            {/* Deductions */}
            <div className="col-12 col-md-4">
              <label className="form-label">Khoản trừ</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-minus-circle"></i>
                </span>
                <input
                  type="number"
                  name="deductions"
                  className="form-control"
                  value={form.deductions ?? ''}
                  onChange={handleNumber('deductions')}
                  min={0}
                  step="1000"
                  placeholder="0"
                />
              </div>
              <div className="form-text">
                <span className="preview-money deduct">
                  -{formatVND(form.deductions)}
                </span>
              </div>
            </div>

            {/* Net (read-only) */}
            <div className="col-12">
              <div className="p-3 bg-light rounded d-flex align-items-center flex-wrap gap-2">
                <div>
                  <span className="small text-muted">Tổng thực nhận</span>
                  <br />
                  <span className="h5 mb-0 preview-money net">
                    {formatVND(net)}
                  </span>
                </div>
                <span className="separator-dot" />
                <div className="small text-muted">
                  = Lương cơ bản + Thưởng − Khoản trừ
                </div>
                <input type="hidden" name="net_salary" value={net} readOnly />
              </div>
            </div>
          </div>
        </div>

        <div className="card-footer d-flex justify-content-between align-items-center gap-2 form-footer">
          <div className="small text-muted">
            <i className="fas fa-info-circle me-1"></i>
            Kiểm tra lại kỳ lương trước khi lưu.
          </div>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  />
                  Đang lưu...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2"></i>Lưu
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PayrollForm;
