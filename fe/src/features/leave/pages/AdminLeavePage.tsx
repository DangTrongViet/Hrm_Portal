import React, { useEffect, useState } from 'react';
import { getJSON, putJSON, delJSON } from '../../../lib/http';
import '../../../../public/css/leave/AdminLeavePage.css';

interface Leave {
  id: number;
  employee_id: number;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

const AdminLeavePage: React.FC = () => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaves = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getJSON<{ data: { rows: Leave[] } }>('/leaves/admin');
      setLeaves(Array.isArray(res.data.rows) ? res.data.rows : []);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải danh sách đơn nghỉ');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await putJSON(`/leaves/admin/${id}/approve`, {});
      setLeaves((prev) =>
        prev.map((leave) =>
          leave.id === id ? { ...leave, status: 'approved' } : leave
        )
      );
    } catch (err: any) {
      setError(err?.message || 'Phê duyệt thất bại');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await putJSON(`/leaves/admin/${id}/reject`, {});
      setLeaves((prev) =>
        prev.map((leave) =>
          leave.id === id ? { ...leave, status: 'rejected' } : leave
        )
      );
    } catch (err: any) {
      setError(err?.message || 'Từ chối thất bại');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa đơn nghỉ này?')) return;
    try {
      await delJSON(`/leaves/admin/${id}`);
      setLeaves((prev) => prev.filter((leave) => leave.id !== id));
    } catch (err: any) {
      setError(err?.message || 'Xóa thất bại');
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  return (
    <div className="leaveAdmin container max-w-6xl mx-auto p-6">
      <h1 className="page-title">
        <i className="fas fa-money-check-alt"></i>
        Quản lý đơn nghỉ
      </h1>

      {loading && (
        <div className="loading-box">
          <div className="spinner"></div>
          <p>Đang tải danh sách đơn nghỉ...</p>
        </div>
      )}

      {error && (
        <div className="error-box">
          <i className="fas fa-exclamation-triangle"></i> {error}
        </div>
      )}

      {!loading && !error && (
        <div className="table-wrapper">
          <table className="leave-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nhân viên</th>
                <th>Từ ngày</th>
                <th>Đến ngày</th>
                <th>Lý do</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave, index) => (
                <tr key={leave.id}>
                  <td>{index + 1}</td>
                  <td>{leave.employee_id}</td>
                  <td>{leave.start_date}</td>
                  <td>{leave.end_date}</td>
                  <td>{leave.reason}</td>
                  <td>
                    {leave.status === 'pending' && (
                      <span className="status pending">Chờ duyệt</span>
                    )}
                    {leave.status === 'approved' && (
                      <span className="status approved">Đã duyệt</span>
                    )}
                    {leave.status === 'rejected' && (
                      <span className="status rejected">Từ chối</span>
                    )}
                  </td>
                  <td className="actions">
                    {leave.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(leave.id)}
                          className="btn approve"
                        >
                          ✅ Duyệt
                        </button>
                        <button
                          onClick={() => handleReject(leave.id)}
                          className="btn reject"
                        >
                          ❌ Từ chối
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(leave.id)}
                      className="btn delete"
                    >
                      🗑 Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {leaves.length === 0 && (
            <p className="empty">Chưa có đơn nghỉ nào.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminLeavePage;
