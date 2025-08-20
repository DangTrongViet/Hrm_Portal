import React from 'react';
import '../../../../public/css/leave/AdminLeaveList.css';
interface Leave {
  id: number;
  employee_id: number;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  employee?: {
    id: number;
    full_name: string;
  };
}

interface Props {
  leaves: Leave[];
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onDelete: (id: number) => void;
}

const AdminLeaveList: React.FC<Props> = ({
  leaves,
  onApprove,
  onReject,
  onDelete,
}) => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">
        Danh sách đơn nghỉ (Admin)
      </h2>
      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden border-collapse">
        <thead className="bg-gray-200 text-sm">
          <tr>
            <th className="px-4 py-2 text-left">ID</th>
            <th className="px-4 py-2 text-left">Nhân viên</th>
            <th className="px-4 py-2 text-left">Từ ngày</th>
            <th className="px-4 py-2 text-left">Đến ngày</th>
            <th className="px-4 py-2 text-left">Lý do</th>
            <th className="px-4 py-2 text-left">Trạng thái</th>
            <th className="px-4 py-2 text-left">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {leaves.map((leave) => (
            <tr key={leave.id} className="border-t hover:bg-gray-100">
              <td className="px-4 py-2">{leave.id}</td>
              <td className="px-4 py-2">{leave.employee?.full_name}</td>
              <td className="px-4 py-2">{leave.start_date}</td>
              <td className="px-4 py-2">{leave.end_date}</td>
              <td className="px-4 py-2">{leave.reason}</td>
              <td className="px-4 py-2">
                <span
                  className={`px-2 py-1 rounded-full text-sm ${
                    leave.status === 'pending'
                      ? 'bg-yellow-400 text-black'
                      : leave.status === 'approved'
                        ? 'bg-green-400 text-white'
                        : 'bg-red-400 text-white'
                  }`}
                >
                  {leave.status}
                </span>
              </td>
              <td className="px-4 py-2 space-x-2">
                {leave.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => onApprove(leave.id)}
                      className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition duration-200"
                    >
                      Duyệt
                    </button>
                    <button
                      onClick={() => onReject(leave.id)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 transition duration-200"
                    >
                      Từ chối
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onDelete(leave.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition duration-200"
                  >
                    Xóa
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminLeaveList;
