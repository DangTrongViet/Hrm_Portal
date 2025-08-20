import { useEffect, useMemo, useState } from 'react';
import { getJSON, delJSON, putJSON } from '../../../lib/http';
import type { Overtime } from '../../../types/overtime';
import OvertimeForm from '../components/OvertimeAdminForm';
import {
  Button,
  Table,
  message,
  Popconfirm,
  Space,
  Tag,
  Input,
  DatePicker,
  Select,
  Drawer,
  Tooltip,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

type Status = 'pending' | 'approved' | 'rejected';

export default function OvertimeListPage() {
  const [rows, setRows] = useState<Overtime[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Overtime | null>(null);
  const [open, setOpen] = useState(false);
  // Add state for pagination
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // local UI filters
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<Status | ''>('');
  const [range, setRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await getJSON<Overtime[]>('/overtimes/admin');
      const arrayData = Array.isArray(data) ? data : [];
      setRows(arrayData);
      setPagination((prev) => ({ ...prev, total: arrayData.length }));
    } catch (err: any) {
      message.error(err?.message || 'Không tải được danh sách OT');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing({} as Overtime);
    setOpen(true);
  }

  function openEdit(r: Overtime) {
    setEditing(r);
    setOpen(true);
  }

  async function handleDelete(id: number) {
    try {
      await delJSON(`/overtimes/admin/${id}`);
      message.success('Xóa thành công');
      load();
    } catch (err: any) {
      message.error(err?.message || 'Xóa thất bại');
    }
  }

  async function handleApprove(id: number) {
    try {
      await putJSON(`/overtimes/admin/${id}/approve`, {});
      message.success('Đã duyệt');
      load();
    } catch (err: any) {
      message.error(err?.message || 'Duyệt thất bại');
    }
  }

  async function handleReject(id: number) {
    try {
      await putJSON(`/overtimes/admin/${id}/reject`, {});
      message.success('Đã từ chối');
      load();
    } catch (err: any) {
      message.error(err?.message || 'Từ chối thất bại');
    }
  }

  // Chuẩn hóa hàng để an toàn null/undefined và name field
  const safeRows = useMemo(() => {
    return rows.map((r) => ({
      ...r,
      employee: (r as any).employee ?? (r as any).Employee ?? null,
      date: r?.date ?? null,
      hours:
        typeof (r as any)?.hours === 'number'
          ? (r as any).hours
          : Number((r as any)?.hours || 0),
      reason: r?.reason ?? '',
      status: (r?.status ?? 'pending') as Status,
    }));
  }, [rows]);

  // Lọc client-side gọn nhẹ
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const [from, to] = range && Array.isArray(range) ? range : [null, null];

    return safeRows.filter((r) => {
      const name = r.employee?.full_name?.toLowerCase?.() || '';
      const reason = r.reason?.toLowerCase?.() || '';
      const matchQ =
        !term ||
        name.includes(term) ||
        reason.includes(term) ||
        String(r.employee_id ?? '').includes(term);
      const matchStatus = !status || r.status === status;
      const d = r.date ? dayjs(r.date) : null;
      const inFrom = from
        ? d
          ? d.isSame(from, 'day') || d.isAfter(from, 'day')
          : false
        : true;
      const inTo = to
        ? d
          ? d.isSame(to, 'day') || d.isBefore(to, 'day')
          : false
        : true;

      return matchQ && matchStatus && inFrom && inTo;
    });
  }, [safeRows, q, status, range]);

  const statusTag = (s: Status) => {
    switch (s) {
      case 'approved':
        return <Tag color="green">Đã duyệt</Tag>;
      case 'rejected':
        return <Tag color="red">Từ chối</Tag>;
      default:
        return <Tag color="orange">Chờ duyệt</Tag>;
    }
  };

  // Handle pagination change
  const handleTableChange = (newPagination: any) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <Title level={3} style={{ margin: 0, color: '#1E1E1E' }}>
            Danh sách Overtime
          </Title>
          <Text type="secondary">
            Tổng bản ghi: <b>{filtered.length}</b>
          </Text>
        </div>
        <Space wrap>
          <Button
            icon={<ReloadOutlined />}
            onClick={load}
            style={{ borderRadius: 8 }}
          >
            Tải lại
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreate}
            style={{ borderRadius: 8, background: '#1890ff' }}
          >
            Thêm Overtime
          </Button>
        </Space>
      </div>

      {/* Toolbars */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        <Input
          allowClear
          style={{ maxWidth: 320, borderRadius: 8 }}
          prefix={<SearchOutlined />}
          placeholder="Tìm tên nhân viên / lý do / ID NV"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Select<Status | ''>
          allowClear
          placeholder="Trạng thái"
          style={{ width: 160, borderRadius: 8 }}
          value={status}
          onChange={(v) => setStatus(v ?? '')}
          options={[
            { value: '', label: 'Tất cả' },
            { value: 'pending', label: 'Chờ duyệt' },
            { value: 'approved', label: 'Đã duyệt' },
            { value: 'rejected', label: 'Từ chối' },
          ]}
        />
        <RangePicker
          value={range as any}
          onChange={(val) => setRange(val as any)}
          format="YYYY-MM-DD"
          allowClear
          style={{ borderRadius: 8 }}
        />
      </div>

      <Table
        className="mt-2"
        rowKey="id"
        dataSource={filtered}
        loading={loading}
        size="middle"
        pagination={{
          ...pagination,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        onChange={handleTableChange}
        columns={[
          {
            title: 'ID',
            dataIndex: 'id',
            width: 80,
            sorter: (a: any, b: any) => (a.id ?? 0) - (b.id ?? 0),
          },
          {
            title: 'Nhân viên',
            dataIndex: 'employee',
            render: (emp: any, r: any) => (
              <div>
                <div style={{ fontWeight: 600, color: '#1E1E1E' }}>
                  {emp?.full_name || '—'}
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  ID NV: {r.employee_id ?? '—'}
                </Text>
              </div>
            ),
          },
          {
            title: 'Ngày',
            dataIndex: 'date',
            width: 150,
            sorter: (a: any, b: any) =>
              dayjs(a.date || 0).valueOf() - dayjs(b.date || 0).valueOf(),
            render: (d: string | null) =>
              d ? dayjs(d).format('YYYY-MM-DD') : '—',
          },
          {
            title: 'Số giờ',
            dataIndex: 'hours',
            align: 'right' as const,
            width: 120,
            sorter: (a: any, b: any) => (a.hours ?? 0) - (b.hours ?? 0),
            render: (h: number) => (
              <Text strong>{isFinite(h) ? h.toFixed(2) : '0.00'}</Text>
            ),
          },
          {
            title: 'Lý do',
            dataIndex: 'reason',
            ellipsis: true,
            render: (reason: string) =>
              reason ? (
                <Tooltip title={reason}>
                  <span>{reason}</span>
                </Tooltip>
              ) : (
                '—'
              ),
          },
          {
            title: 'Trạng thái',
            dataIndex: 'status',
            width: 130,
            filters: [
              { text: 'Chờ duyệt', value: 'pending' },
              { text: 'Đã duyệt', value: 'approved' },
              { text: 'Từ chối', value: 'rejected' },
            ],
            onFilter: (val, rec: any) => rec.status === val,
            render: (s: Status) => statusTag(s),
          },
          {
            title: 'Hành động',
            key: 'actions',
            fixed: 'right' as const,
            width: 260,
            render: (_: any, r: any) => (
              <Space>
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => openEdit(r)}
                  style={{ borderRadius: 6 }}
                >
                  Sửa
                </Button>
                <Popconfirm
                  title="Xóa overtime này?"
                  onConfirm={() => handleDelete(r.id)}
                >
                  <Button
                    size="small"
                    icon={<DeleteOutlined />}
                    danger
                    style={{ borderRadius: 6 }}
                  >
                    Xóa
                  </Button>
                </Popconfirm>
                {r.status === 'pending' && (
                  <>
                    <Button
                      size="small"
                      icon={<CheckOutlined />}
                      type="primary"
                      onClick={() => handleApprove(r.id)}
                      style={{ borderRadius: 6 }}
                    >
                      Duyệt
                    </Button>
                    <Button
                      size="small"
                      icon={<CloseOutlined />}
                      danger
                      onClick={() => handleReject(r.id)}
                      style={{ borderRadius: 6 }}
                    >
                      Từ chối
                    </Button>
                  </>
                )}
              </Space>
            ),
          },
        ]}
        summary={(pageData) => {
          const sum = pageData.reduce(
            (acc, r: any) => acc + (isFinite(r.hours) ? r.hours : 0),
            0
          );
          return (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={3}>
                <Text strong>Tổng</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right">
                <Text strong>{sum.toFixed(2)}</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2} colSpan={3} />
            </Table.Summary.Row>
          );
        }}
        scroll={{ x: 980 }}
      />

      <Drawer
        title={editing?.id ? 'Chỉnh sửa Overtime' : 'Thêm Overtime'}
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        width={520}
        destroyOnHidden
        styles={{
          header: { background: '#f5f5f5', borderRadius: '8px 8px 0 0' },
          body: { padding: '24px', background: '#fff' },
        }}
      >
        {editing && (
          <OvertimeForm
            initial={editing}
            onSuccess={() => {
              setOpen(false);
              setEditing(null);
              load();
            }}
            onCancel={() => {
              setOpen(false);
              setEditing(null);
            }}
          />
        )}
      </Drawer>
    </div>
  );
}
