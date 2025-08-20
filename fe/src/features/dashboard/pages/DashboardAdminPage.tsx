import React, { useEffect, useState } from 'react';
import * as dashboardAdmin from '../api';

const DashboardAdmin: React.FC = () => {
  const [loading, setLoading] = useState(true);

  const [employeeSummary, setEmployeeSummary] =
    useState<dashboardAdmin.Summary | null>(null);
  const [userSummary, setUserSummary] = useState<dashboardAdmin.Summary | null>(
    null
  );
  const [contractSummary, setContractSummary] =
    useState<dashboardAdmin.Summary | null>(null);
  const [leaveSummary, setLeaveSummary] =
    useState<dashboardAdmin.Summary | null>(null);
  const [overtimeSummary, setOvertimeSummary] =
    useState<dashboardAdmin.Summary | null>(null);

  const [totalPayrolls, setTotalPayrolls] = useState<number | null>(null);
  const [totalRoles, setTotalRoles] = useState<number | null>(null);
  const [totalPermissions, setTotalPermissions] = useState<number | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [
          emp,
          user,
          contract,
          leave,
          overtime,
          payrolls,
          roles,
          permissions,
        ] = await Promise.all([
          dashboardAdmin.getEmployeeSummary(),
          dashboardAdmin.getUsersSummary(),
          dashboardAdmin.getContractSummary(),
          dashboardAdmin.getLeaveSummary(),
          dashboardAdmin.getOvertimeSummary(),
          dashboardAdmin.getTotalPayrolls(),
          dashboardAdmin.getTotalRoles(),
          dashboardAdmin.getTotalPermissions(),
        ]);

        setEmployeeSummary(emp);
        setUserSummary(user);
        setContractSummary(contract);
        setLeaveSummary(leave);
        setOvertimeSummary(overtime);
        setTotalPayrolls(payrolls);
        setTotalRoles(roles);
        setTotalPermissions(permissions);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  if (loading)
    return <div className="text-center my-5">Đang tải dashboard...</div>;

  return (
    <div className="container-fluid py-4">
      <h1 className="display-4 text-center mb-4 text-primary">
        Dashboard Quản Trị
      </h1>

      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {/* Nhân viên */}
        <div className="col">
          <div className="card h-100 shadow-sm border-primary">
            <div className="card-body">
              <h3 className="card-title text-primary">Nhân Viên</h3>
              <p className="card-text">
                Tổng số: <strong>{employeeSummary?.total ?? '-'}</strong>
              </p>
              <p className="card-text">
                Đang hoạt động:{' '}
                <strong>{employeeSummary?.active ?? '-'}</strong>
              </p>
              <p className="card-text">
                Ngừng hoạt động:{' '}
                <strong>{employeeSummary?.inactive ?? '-'}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Người dùng */}
        <div className="col">
          <div className="card h-100 shadow-sm border-success">
            <div className="card-body">
              <h3 className="card-title text-success">Người Dùng</h3>
              <p className="card-text">
                Tổng số: <strong>{userSummary?.total ?? '-'}</strong>
              </p>
              <p className="card-text">
                Đang hoạt động: <strong>{userSummary?.active ?? '-'}</strong>
              </p>
              <p className="card-text">
                Ngừng hoạt động: <strong>{userSummary?.inactive ?? '-'}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Hợp đồng */}
        <div className="col">
          <div className="card h-100 shadow-sm border-warning">
            <div className="card-body">
              <h3 className="card-title text-warning">Hợp Đồng</h3>
              <p className="card-text">
                Tổng số: <strong>{contractSummary?.total ?? '-'}</strong>
              </p>
              <p className="card-text">
                Hợp lệ: <strong>{contractSummary?.valid ?? '-'}</strong>
              </p>
              <p className="card-text">
                Hết hạn: <strong>{contractSummary?.expire ?? '-'}</strong>
              </p>
              <p className="card-text">
                Chấm dứt: <strong>{contractSummary?.terminate ?? '-'}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Đơn nghỉ phép */}
        <div className="col">
          <div className="card h-100 shadow-sm border-info">
            <div className="card-body">
              <h3 className="card-title text-info">Đơn Nghỉ Phép</h3>
              <p className="card-text">
                Tổng số: <strong>{leaveSummary?.total ?? '-'}</strong>
              </p>
              <p className="card-text">
                Được duyệt: <strong>{leaveSummary?.approve ?? '-'}</strong>
              </p>
              <p className="card-text">
                Bị từ chối: <strong>{leaveSummary?.reject ?? '-'}</strong>
              </p>
              <p className="card-text">
                Đang chờ: <strong>{leaveSummary?.pending ?? '-'}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Tăng ca */}
        <div className="col">
          <div className="card h-100 shadow-sm border-danger">
            <div className="card-body">
              <h3 className="card-title text-danger">Tăng Ca</h3>
              <p className="card-text">
                Tổng số: <strong>{overtimeSummary?.total ?? '-'}</strong>
              </p>
              <p className="card-text">
                Được duyệt: <strong>{overtimeSummary?.approve ?? '-'}</strong>
              </p>
              <p className="card-text">
                Bị từ chối: <strong>{overtimeSummary?.reject ?? '-'}</strong>
              </p>
              <p className="card-text">
                Đang chờ: <strong>{overtimeSummary?.pending ?? '-'}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Bảng lương */}
        <div className="col">
          <div className="card h-100 shadow-sm border-secondary">
            <div className="card-body">
              <h3 className="card-title text-secondary">Bảng Lương</h3>
              <p className="card-text">
                Tổng số: <strong>{totalPayrolls ?? '-'}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Vai trò */}
        <div className="col">
          <div className="card h-100 shadow-sm border-dark">
            <div className="card-body">
              <h3 className="card-title text-dark">Vai Trò</h3>
              <p className="card-text">
                Tổng số: <strong>{totalRoles ?? '-'}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Quyền */}
        <div className="col">
          <div className="card h-100 shadow-sm border-primary">
            <div className="card-body">
              <h3 className="card-title text-primary">Quyền</h3>
              <p className="card-text">
                Tổng số: <strong>{totalPermissions ?? '-'}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
