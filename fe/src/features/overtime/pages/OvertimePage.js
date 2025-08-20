import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { Button, Table, Popconfirm, message, Space, Tag, Input, DatePicker, Select, Typography, Tooltip, } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined, EditOutlined, DeleteOutlined, } from '@ant-design/icons';
import FormOvertime from '../components/OvertimeForm';
import { getJSON, delJSON } from '../../../lib/http';
import dayjs from 'dayjs';
import '../../../../public/css/overtime/OvertimePage.css';
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
export default function OvertimePage() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(null);
    const [open, setOpen] = useState(false);
    // UI filters
    const [q, setQ] = useState('');
    const [status, setStatus] = useState('');
    const [range, setRange] = useState(null);
    const BASE_PATH = '/overtimes/employees';
    async function loadData() {
        setLoading(true);
        try {
            const data = await getJSON(BASE_PATH);
            setRows(Array.isArray(data) ? data : []);
        }
        catch (err) {
            message.error(err?.message || 'Lấy dữ liệu thất bại');
        }
        finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        loadData();
    }, []);
    const handleDelete = async (id) => {
        if (!id)
            return;
        try {
            await delJSON(`${BASE_PATH}/${id}`);
            message.success('Xoá thành công');
            loadData();
        }
        catch (err) {
            message.error(err?.message || 'Xoá thất bại');
        }
    };
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
    // Chuẩn hoá rows cho an toàn kiểu dữ liệu
    const safeRows = useMemo(() => {
        return rows.map((r) => ({
            ...r,
            date: r?.date ?? null,
            hours: typeof r?.hours === 'number'
                ? r.hours
                : Number(r?.hours || 0),
            reason: r?.reason ?? '',
            status: (r?.status ?? 'pending'),
        }));
    }, [rows]);
    // Lọc client-side
    const filtered = useMemo(() => {
        const term = q.trim().toLowerCase();
        const [from, to] = range ?? [null, null];
        return safeRows.filter((r) => {
            const matchQ = !term ||
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
    const totalHours = useMemo(() => filtered.reduce((s, r) => s + (isFinite(r.hours) ? r.hours : 0), 0), [filtered]);
    const columns = [
        {
            title: 'Ngày',
            dataIndex: 'date',
            width: 150,
            sorter: (a, b) => dayjs(a.date || 0).valueOf() - dayjs(b.date || 0).valueOf(),
            render: (d) => (d ? dayjs(d).format('YYYY-MM-DD') : '—'),
        },
        {
            title: 'Số giờ',
            dataIndex: 'hours',
            align: 'right',
            width: 120,
            sorter: (a, b) => (a.hours ?? 0) - (b.hours ?? 0),
            render: (h) => (_jsx(Text, { strong: true, children: isFinite(h) ? Number(h).toFixed(2) : '0.00' })),
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
            width: 140,
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
            width: 220,
            render: (_, record) => {
                if (record.status !== 'pending') {
                    return _jsx(Text, { type: "secondary", children: "Kh\u00F4ng th\u1EC3 ch\u1EC9nh s\u1EEDa" });
                }
                return (_jsxs(Space, { children: [_jsx(Button, { size: "small", icon: _jsx(EditOutlined, {}), onClick: () => {
                                setEditing(record);
                                setOpen(true);
                            }, children: "S\u1EEDa" }), _jsx(Popconfirm, { title: "Xo\u00E1 t\u0103ng ca n\u00E0y?", onConfirm: () => handleDelete(record.id), children: _jsx(Button, { size: "small", danger: true, icon: _jsx(DeleteOutlined, {}), children: "Xo\u00E1" }) })] }));
            },
        },
    ];
    return (_jsxs("div", { className: "container-fluid py-4", children: [_jsxs("div", { className: "d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3", children: [_jsxs("div", { children: [_jsx(Title, { level: 3, style: { margin: 0 }, children: "T\u0103ng ca c\u1EE7a t\u00F4i" }), _jsxs(Text, { type: "secondary", children: ["T\u1ED5ng b\u1EA3n ghi: ", _jsx("b", { children: filtered.length })] })] }), _jsxs(Space, { wrap: true, children: [_jsx(Button, { icon: _jsx(ReloadOutlined, {}), onClick: loadData, children: "T\u1EA3i l\u1EA1i" }), _jsx(Button, { type: "primary", icon: _jsx(PlusOutlined, {}), onClick: () => {
                                    setEditing(null);
                                    setOpen(true);
                                }, children: "Th\u00EAm t\u0103ng ca" })] })] }), _jsxs("div", { className: "ot-toolbar", children: [_jsx(Input, { allowClear: true, style: { maxWidth: 360 }, prefix: _jsx(SearchOutlined, {}), placeholder: "T\u00ECm ng\u00E0y (YYYY-MM-DD) / l\u00FD do / ID", value: q, onChange: (e) => setQ(e.target.value) }), _jsx(Select, { allowClear: true, placeholder: "Tr\u1EA1ng th\u00E1i", style: { width: 160 }, value: status, onChange: (v) => setStatus(v ?? ''), options: [
                            { value: '', label: 'Tất cả' },
                            { value: 'pending', label: 'Chờ duyệt' },
                            { value: 'approved', label: 'Đã duyệt' },
                            { value: 'rejected', label: 'Từ chối' },
                        ] }), _jsx(RangePicker, { value: range ?? undefined, onChange: (val) => {
                            // val có thể là undefined | null | [Dayjs | null, Dayjs | null]
                            const next = Array.isArray(val)
                                ? [val[0] ?? null, val[1] ?? null]
                                : null;
                            setRange(next);
                        }, format: "YYYY-MM-DD", allowClear: true })] }), _jsx(Table, { className: "mt-2", rowKey: "id", dataSource: filtered, columns: columns, loading: loading, size: "middle", pagination: { pageSize: 20, showSizeChanger: true }, summary: (pageData) => {
                    const sum = pageData.reduce((acc, r) => acc + (isFinite(r.hours) ? r.hours : 0), 0);
                    return (_jsxs(Table.Summary.Row, { children: [_jsx(Table.Summary.Cell, { index: 0, colSpan: 1, children: _jsx(Text, { strong: true, children: "T\u1ED5ng tr\u00EAn trang" }) }), _jsx(Table.Summary.Cell, { index: 1, align: "right", children: _jsx(Text, { strong: true, children: sum.toFixed(2) }) }), _jsx(Table.Summary.Cell, { index: 2, colSpan: 3 })] }));
                }, scroll: { x: 900 } }), _jsx("div", { className: "mt-2", children: _jsxs(Text, { type: "secondary", children: ["T\u1ED5ng s\u1ED1 gi\u1EDD (sau khi l\u1ECDc): ", _jsx("b", { children: totalHours.toFixed(2) })] }) }), _jsx(FormOvertime, { open: open, initial: editing || undefined, onClose: () => setOpen(false), onSuccess: () => {
                    setOpen(false);
                    loadData();
                } })] }));
}
