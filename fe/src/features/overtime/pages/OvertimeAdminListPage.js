import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { getJSON, delJSON, putJSON } from '../../../lib/http';
import OvertimeForm from '../components/OvertimeAdminForm';
import { Button, Table, message, Popconfirm, Space, Tag, Input, DatePicker, Select, Drawer, Tooltip, Typography, } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined, CheckOutlined, CloseOutlined, EditOutlined, DeleteOutlined, } from '@ant-design/icons';
import dayjs from 'dayjs';
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
export default function OvertimeListPage() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(null);
    const [open, setOpen] = useState(false);
    // Add state for pagination
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0,
    });
    // local UI filters
    const [q, setQ] = useState('');
    const [status, setStatus] = useState('');
    const [range, setRange] = useState(null);
    async function load() {
        setLoading(true);
        try {
            const data = await getJSON('/overtimes/admin');
            const arrayData = Array.isArray(data) ? data : [];
            setRows(arrayData);
            setPagination((prev) => ({ ...prev, total: arrayData.length }));
        }
        catch (err) {
            message.error(err?.message || 'Không tải được danh sách OT');
        }
        finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        load();
    }, []);
    function openCreate() {
        setEditing({});
        setOpen(true);
    }
    function openEdit(r) {
        setEditing(r);
        setOpen(true);
    }
    async function handleDelete(id) {
        try {
            await delJSON(`/overtimes/admin/${id}`);
            message.success('Xóa thành công');
            load();
        }
        catch (err) {
            message.error(err?.message || 'Xóa thất bại');
        }
    }
    async function handleApprove(id) {
        try {
            await putJSON(`/overtimes/admin/${id}/approve`, {});
            message.success('Đã duyệt');
            load();
        }
        catch (err) {
            message.error(err?.message || 'Duyệt thất bại');
        }
    }
    async function handleReject(id) {
        try {
            await putJSON(`/overtimes/admin/${id}/reject`, {});
            message.success('Đã từ chối');
            load();
        }
        catch (err) {
            message.error(err?.message || 'Từ chối thất bại');
        }
    }
    // Chuẩn hóa hàng để an toàn null/undefined và name field
    const safeRows = useMemo(() => {
        return rows.map((r) => ({
            ...r,
            employee: r.employee ?? r.Employee ?? null,
            date: r?.date ?? null,
            hours: typeof r?.hours === 'number'
                ? r.hours
                : Number(r?.hours || 0),
            reason: r?.reason ?? '',
            status: (r?.status ?? 'pending'),
        }));
    }, [rows]);
    // Lọc client-side gọn nhẹ
    const filtered = useMemo(() => {
        const term = q.trim().toLowerCase();
        const [from, to] = range && Array.isArray(range) ? range : [null, null];
        return safeRows.filter((r) => {
            const name = r.employee?.full_name?.toLowerCase?.() || '';
            const reason = r.reason?.toLowerCase?.() || '';
            const matchQ = !term ||
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
    const statusTag = (s) => {
        switch (s) {
            case 'approved':
                return _jsx(Tag, { color: "green", children: "\u0110\u00E3 duy\u1EC7t" });
            case 'rejected':
                return _jsx(Tag, { color: "red", children: "T\u1EEB ch\u1ED1i" });
            default:
                return _jsx(Tag, { color: "orange", children: "Ch\u1EDD duy\u1EC7t" });
        }
    };
    // Handle pagination change
    const handleTableChange = (newPagination) => {
        setPagination({
            ...pagination,
            current: newPagination.current,
            pageSize: newPagination.pageSize,
        });
    };
    return (_jsxs("div", { className: "container-fluid py-4", children: [_jsxs("div", { className: "d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4", children: [_jsxs("div", { children: [_jsx(Title, { level: 3, style: { margin: 0, color: '#1E1E1E' }, children: "Danh s\u00E1ch Overtime" }), _jsxs(Text, { type: "secondary", children: ["T\u1ED5ng b\u1EA3n ghi: ", _jsx("b", { children: filtered.length })] })] }), _jsxs(Space, { wrap: true, children: [_jsx(Button, { icon: _jsx(ReloadOutlined, {}), onClick: load, style: { borderRadius: 8 }, children: "T\u1EA3i l\u1EA1i" }), _jsx(Button, { type: "primary", icon: _jsx(PlusOutlined, {}), onClick: openCreate, style: { borderRadius: 8, background: '#1890ff' }, children: "Th\u00EAm Overtime" })] })] }), _jsxs("div", { className: "d-flex flex-wrap gap-2 mb-4", children: [_jsx(Input, { allowClear: true, style: { maxWidth: 320, borderRadius: 8 }, prefix: _jsx(SearchOutlined, {}), placeholder: "T\u00ECm t\u00EAn nh\u00E2n vi\u00EAn / l\u00FD do / ID NV", value: q, onChange: (e) => setQ(e.target.value) }), _jsx(Select, { allowClear: true, placeholder: "Tr\u1EA1ng th\u00E1i", style: { width: 160, borderRadius: 8 }, value: status, onChange: (v) => setStatus(v ?? ''), options: [
                            { value: '', label: 'Tất cả' },
                            { value: 'pending', label: 'Chờ duyệt' },
                            { value: 'approved', label: 'Đã duyệt' },
                            { value: 'rejected', label: 'Từ chối' },
                        ] }), _jsx(RangePicker, { value: range, onChange: (val) => setRange(val), format: "YYYY-MM-DD", allowClear: true, style: { borderRadius: 8 } })] }), _jsx(Table, { className: "mt-2", rowKey: "id", dataSource: filtered, loading: loading, size: "middle", pagination: {
                    ...pagination,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50', '100'],
                }, onChange: handleTableChange, columns: [
                    {
                        title: 'ID',
                        dataIndex: 'id',
                        width: 80,
                        sorter: (a, b) => (a.id ?? 0) - (b.id ?? 0),
                    },
                    {
                        title: 'Nhân viên',
                        dataIndex: 'employee',
                        render: (emp, r) => (_jsxs("div", { children: [_jsx("div", { style: { fontWeight: 600, color: '#1E1E1E' }, children: emp?.full_name || '—' }), _jsxs(Text, { type: "secondary", style: { fontSize: 12 }, children: ["ID NV: ", r.employee_id ?? '—'] })] })),
                    },
                    {
                        title: 'Ngày',
                        dataIndex: 'date',
                        width: 150,
                        sorter: (a, b) => dayjs(a.date || 0).valueOf() - dayjs(b.date || 0).valueOf(),
                        render: (d) => d ? dayjs(d).format('YYYY-MM-DD') : '—',
                    },
                    {
                        title: 'Số giờ',
                        dataIndex: 'hours',
                        align: 'right',
                        width: 120,
                        sorter: (a, b) => (a.hours ?? 0) - (b.hours ?? 0),
                        render: (h) => (_jsx(Text, { strong: true, children: isFinite(h) ? h.toFixed(2) : '0.00' })),
                    },
                    {
                        title: 'Lý do',
                        dataIndex: 'reason',
                        ellipsis: true,
                        render: (reason) => reason ? (_jsx(Tooltip, { title: reason, children: _jsx("span", { children: reason }) })) : ('—'),
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
                        onFilter: (val, rec) => rec.status === val,
                        render: (s) => statusTag(s),
                    },
                    {
                        title: 'Hành động',
                        key: 'actions',
                        fixed: 'right',
                        width: 260,
                        render: (_, r) => (_jsxs(Space, { children: [_jsx(Button, { size: "small", icon: _jsx(EditOutlined, {}), onClick: () => openEdit(r), style: { borderRadius: 6 }, children: "S\u1EEDa" }), _jsx(Popconfirm, { title: "X\u00F3a overtime n\u00E0y?", onConfirm: () => handleDelete(r.id), children: _jsx(Button, { size: "small", icon: _jsx(DeleteOutlined, {}), danger: true, style: { borderRadius: 6 }, children: "X\u00F3a" }) }), r.status === 'pending' && (_jsxs(_Fragment, { children: [_jsx(Button, { size: "small", icon: _jsx(CheckOutlined, {}), type: "primary", onClick: () => handleApprove(r.id), style: { borderRadius: 6 }, children: "Duy\u1EC7t" }), _jsx(Button, { size: "small", icon: _jsx(CloseOutlined, {}), danger: true, onClick: () => handleReject(r.id), style: { borderRadius: 6 }, children: "T\u1EEB ch\u1ED1i" })] }))] })),
                    },
                ], summary: (pageData) => {
                    const sum = pageData.reduce((acc, r) => acc + (isFinite(r.hours) ? r.hours : 0), 0);
                    return (_jsxs(Table.Summary.Row, { children: [_jsx(Table.Summary.Cell, { index: 0, colSpan: 3, children: _jsx(Text, { strong: true, children: "T\u1ED5ng" }) }), _jsx(Table.Summary.Cell, { index: 1, align: "right", children: _jsx(Text, { strong: true, children: sum.toFixed(2) }) }), _jsx(Table.Summary.Cell, { index: 2, colSpan: 3 })] }));
                }, scroll: { x: 980 } }), _jsx(Drawer, { title: editing?.id ? 'Chỉnh sửa Overtime' : 'Thêm Overtime', open: open, onClose: () => {
                    setOpen(false);
                    setEditing(null);
                }, width: 520, destroyOnHidden: true, styles: {
                    header: { background: '#f5f5f5', borderRadius: '8px 8px 0 0' },
                    body: { padding: '24px', background: '#fff' },
                }, children: editing && (_jsx(OvertimeForm, { initial: editing, onSuccess: () => {
                        setOpen(false);
                        setEditing(null);
                        load();
                    }, onCancel: () => {
                        setOpen(false);
                        setEditing(null);
                    } })) })] }));
}
