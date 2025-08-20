import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Table,
  Popconfirm,
  message,
  Space,
  Tag,
  Input,
  DatePicker,
  Select,
  Typography,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { OvertimeEmployee } from '../../../types/overtime';
import FormOvertime from '../components/OvertimeForm';
import { getJSON, delJSON } from '../../../lib/http';
import dayjs, { Dayjs } from 'dayjs';
import '../../../../public/css/overtime/OvertimePage.css';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

type Status = 'pending' | 'approved' | 'rejected';

// Kiểu dữ liệu sử dụng trong bảng (đã chuẩn hoá)
type LocalRow = OvertimeEmployee & {
  status: Status;
  hours: number;
  date: string | null;
};

export default function OvertimePage() {
  const [rows, setRows] = useState<OvertimeEmployee[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<OvertimeEmployee | null>(null);
  const [open, setOpen] = useState(false);

  // UI filters
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<Status | ''>('');
  const [range, setRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  const BASE_PATH = '/overtimes/employees';

  async function loadData() {
    setLoading(true);
    try {
      const data = await getJSON<OvertimeEmployee[]>(BASE_PATH);
      setRows(Array.isArray(data) ? data : []);
    } catch (err: any) {
      message.error(err?.message || 'Lấy dữ liệu thất bại');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id?: number) => {
    if (!id) return;
    try {
      await delJSON(`${BASE_PATH}/${id}`);
      message.success('Xoá thành công');
      loadData();
    } catch (err: any) {
      message.error(err?.message || 'Xoá thất bại');
    }
  };

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

  // Chuẩn hoá rows cho an toàn kiểu dữ liệu
  const safeRows: LocalRow[] = useMemo(() => {
    return rows.map((r) => ({
      ...(r as OvertimeEmployee),
      date: r?.date ?? null,
      hours:
        typeof (r as any)?.hours === 'number'
          ? (r as any).hours
          : Number((r as any)?.hours || 0),
      reason: r?.reason ?? '',
      status: ((r as any)?.status ?? 'pending') as Status,
    }));
  }, [rows]);

  // Lọc client-side
  const filtered: LocalRow[] = useMemo(() => {
    const term = q.trim().toLowerCase();
    const [from, to] = range ?? [null, null];

    return safeRows.filter((r) => {
      const matchQ =
        !term ||
        (r.reason?.toLowerCase?.() || '').includes(term) ||
        (r.date ? String(r.date).toLowerCase().includes(term) : false) ||
        String(r.id ?? '').includes(term);

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

  const totalHours = useMemo(
    () => filtered.reduce((s, r) => s + (isFinite(r.hours) ? r.hours : 0), 0),
    [filtered]
  );

  const columns: ColumnsType<LocalRow> = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      width: 150,
      sorter: (a, b) =>
        dayjs(a.date || 0).valueOf() - dayjs(b.date || 0).valueOf(),
      render: (d) => (d ? dayjs(d).format('YYYY-MM-DD') : '—'),
    },
    {
      title: 'Số giờ',
      dataIndex: 'hours',
      align: 'right',
      width: 120,
      sorter: (a, b) => (a.hours ?? 0) - (b.hours ?? 0),
      render: (h: any) => (
        <Text strong>{isFinite(h) ? Number(h).toFixed(2) : '0.00'}</Text>
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
      width: 140,
      filters: [
        { text: 'Chờ duyệt', value: 'pending' },
        { text: 'Đã duyệt', value: 'approved' },
        { text: 'Từ chối', value: 'rejected' },
      ],
      onFilter: (val, rec) => rec.status === val,
      render: (s: Status) => statusTag(s),
    },
    {
      title: 'Hành động',
      key: 'actions',
      fixed: 'right',
      width: 220,
      render: (_: any, record) => {
        if (record.status !== 'pending') {
          return <Text type="secondary">Không thể chỉnh sửa</Text>;
        }
        return (
          <Space>
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setEditing(record);
                setOpen(true);
              }}
            >
              Sửa
            </Button>
            <Popconfirm
              title="Xoá tăng ca này?"
              onConfirm={() => handleDelete(record.id)}
            >
              <Button size="small" danger icon={<DeleteOutlined />}>
                Xoá
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="container-fluid py-4">
      {/* Header + Actions */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Tăng ca của tôi
          </Title>
          <Text type="secondary">
            Tổng bản ghi: <b>{filtered.length}</b>
          </Text>
        </div>
        <Space wrap>
          <Button icon={<ReloadOutlined />} onClick={loadData}>
            Tải lại
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            Thêm tăng ca
          </Button>
        </Space>
      </div>

      {/* Toolbars */}
      <div className="ot-toolbar">
        <Input
          allowClear
          style={{ maxWidth: 360 }}
          prefix={<SearchOutlined />}
          placeholder="Tìm ngày (YYYY-MM-DD) / lý do / ID"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Select<Status | ''>
          allowClear
          placeholder="Trạng thái"
          style={{ width: 160 }}
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
          value={range ?? undefined}
          onChange={(val) => {
            // val có thể là undefined | null | [Dayjs | null, Dayjs | null]
            const next = Array.isArray(val)
              ? ([val[0] ?? null, val[1] ?? null] as [
                  Dayjs | null,
                  Dayjs | null,
                ])
              : null;
            setRange(next);
          }}
          format="YYYY-MM-DD"
          allowClear
        />
      </div>

      <Table<LocalRow>
        className="mt-2"
        rowKey="id"
        dataSource={filtered}
        columns={columns}
        loading={loading}
        size="middle"
        pagination={{ pageSize: 20, showSizeChanger: true }}
        summary={(pageData) => {
          const sum = pageData.reduce(
            (acc: number, r: LocalRow) =>
              acc + (isFinite(r.hours) ? r.hours : 0),
            0
          );
          return (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={1}>
                <Text strong>Tổng trên trang</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right">
                <Text strong>{sum.toFixed(2)}</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2} colSpan={3} />
            </Table.Summary.Row>
          );
        }}
        scroll={{ x: 900 }}
      />

      <div className="mt-2">
        <Text type="secondary">
          Tổng số giờ (sau khi lọc): <b>{totalHours.toFixed(2)}</b>
        </Text>
      </div>

      {/* Modal/Drawer */}
      <FormOvertime
        open={open}
        initial={editing || undefined}
        onClose={() => setOpen(false)}
        onSuccess={() => {
          setOpen(false);
          loadData();
        }}
      />
    </div>
  );
}
