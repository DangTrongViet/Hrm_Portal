import React from 'react';

interface Leave {
  id: number;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface Props {
  leaves: Leave[];
  onEdit: (leave: Leave) => void;
  onDelete: (id: number) => void;
}

const LeaveList: React.FC<Props> = ({ leaves, onEdit, onDelete }) => {
  return (
    <div className="leave-list-container">
      <h2 className="text-2xl font-semibold mb-4">Danh sách đơn nghỉ</h2>
      <table className="min-w-full table-auto border-collapse border w-full">
        <thead className="table-header">
          <tr>
            <th className="px-4 py-2 text-left">ID</th>
            <th className="px-4 py-2 text-left">Từ ngày</th>
            <th className="px-4 py-2 text-left">Đến ngày</th>
            <th className="px-4 py-2 text-left">Lý do</th>
            <th className="px-4 py-2 text-left">Trạng thái</th>
            <th className="px-4 py-2 text-left">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {leaves.map((leave) => (
            <tr key={leave.id} className="table-row">
              <td className="table-cell">{leave.id}</td>
              <td className="table-cell">{leave.start_date}</td>
              <td className="table-cell">{leave.end_date}</td>
              <td className="table-cell">{leave.reason}</td>
              <td className="table-cell">
                <span
                  className={`${
                    leave.status === 'pending'
                      ? 'status-pending'
                      : leave.status === 'approved'
                        ? 'status-approved'
                        : 'status-rejected'
                  }`}
                >
                  {leave.status === 'pending'
                    ? 'Chờ duyệt'
                    : leave.status === 'approved'
                      ? 'Đã duyệt'
                      : 'Từ chối'}
                </span>
              </td>
              <td className="table-cell space-x-2">
                {leave.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => onEdit(leave)}
                      className="button button-edit"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => onDelete(leave.id)}
                      className="button button-delete"
                    >
                      Xóa
                    </button>
                  </>
                ) : (
                  <span className="text-sm text-gray-500">
                    Không thể chỉnh sửa
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaveList;
