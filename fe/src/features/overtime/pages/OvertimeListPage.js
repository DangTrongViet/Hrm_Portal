import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { useEffect, useState } from 'react';
import { getJSON, delJSON, postNoBody } from '../../../lib/http';
import OvertimeForm from '../components/OvertimeForm';
import { Button, Table, message, Popconfirm } from 'antd';
export default function OvertimeListPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  async function load() {
    setLoading(true);
    try {
      const data = await getJSON('/overtimes/admin');
      setRows(data);
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function handleDelete(id) {
    try {
      await delJSON(`/overtimes/admin/${id}`);
      message.success('Xóa thành công');
      load();
    } catch (err) {
      message.error(err.message);
    }
  }
  async function handleApprove(id) {
    try {
      await postNoBody(`/overtimes/admin/${id}/approve`);
      message.success('Đã duyệt');
      load();
    } catch (err) {
      message.error(err.message);
    }
  }
  return _jsxs('div', {
    children: [
      _jsx('h2', { className: 'mb-3', children: 'Danh s\u00E1ch Overtime' }),
      _jsx(Button, {
        type: 'primary',
        onClick: () => setEditing({}),
        children: 'Th\u00EAm Overtime',
      }),
      _jsx(Table, {
        className: 'mt-3',
        rowKey: 'id',
        dataSource: rows,
        loading: loading,
        columns: [
          { title: 'Nhân viên', dataIndex: 'employeeName' },
          { title: 'Ngày', dataIndex: 'date' },
          { title: 'Số giờ', dataIndex: 'hours' },
          { title: 'Lý do', dataIndex: 'reason' },
          { title: 'Trạng thái', dataIndex: 'status' },
          {
            title: 'Hành động',
            render: (_, r) =>
              _jsxs('div', {
                className: 'flex gap-2',
                children: [
                  _jsx(Button, {
                    size: 'small',
                    onClick: () => setEditing(r),
                    children: 'S\u1EEDa',
                  }),
                  _jsx(Popconfirm, {
                    title: 'X\u00F3a overtime n\u00E0y?',
                    onConfirm: () => handleDelete(r.id),
                    children: _jsx(Button, {
                      size: 'small',
                      danger: true,
                      children: 'X\u00F3a',
                    }),
                  }),
                  r.status === 'pending' &&
                    _jsx(Button, {
                      size: 'small',
                      onClick: () => handleApprove(r.id),
                      children: 'Duy\u1EC7t',
                    }),
                ],
              }),
          },
        ],
      }),
      editing &&
        _jsx(OvertimeForm, {
          initial: editing,
          onSuccess: () => {
            setEditing(null);
            load();
          },
          onCancel: () => setEditing(null),
        }),
    ],
  });
}
