import React, { useEffect, useState } from 'react';
import { getJSON, postJSON, putJSON, delJSON } from '../../../lib/http';
import LeaveForm from '../components/LeaveForm';
import LeaveList from '../components/LeaveList';
import '../../../../public/css/leave/leavePage.css';

export interface Leave {
  id: number;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

const LeavesPage: React.FC = () => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [editingLeave, setEditingLeave] = useState<Leave | null>(null);

  const fetchLeaves = async () => {
    try {
      const res = await getJSON<{ data: { rows: Leave[] } }>(
        '/leaves/employees'
      );
      setLeaves(res.data.rows);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (data: any) => {
    try {
      if (editingLeave) {
        // update leave
        await putJSON(`/leaves/employees/${editingLeave.id}`, data);
        setEditingLeave(null);
      } else {
        // create leave
        await postJSON('/leaves/employees', data);
      }
      fetchLeaves();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (leave: Leave) => {
    setEditingLeave(leave);
  };

  const handleDelete = async (id: number) => {
    try {
      await delJSON(`/leaves/employees/${id}`);
      fetchLeaves();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Quản lý nghỉ phép</h1>

      <LeaveForm
        onSubmit={handleCreate}
        initialData={editingLeave || undefined}
      />

      <LeaveList leaves={leaves} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
};

export default LeavesPage;
