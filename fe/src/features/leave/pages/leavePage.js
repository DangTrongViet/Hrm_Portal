import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { getJSON, postJSON, putJSON, delJSON } from '../../../lib/http';
import LeaveForm from '../components/LeaveForm';
import LeaveList from '../components/LeaveList';
import '../../../../public/css/leave/leavePage.css';
const LeavesPage = () => {
    const [leaves, setLeaves] = useState([]);
    const [editingLeave, setEditingLeave] = useState(null);
    const fetchLeaves = async () => {
        try {
            const res = await getJSON('/leaves/employees');
            setLeaves(res.data.rows);
        }
        catch (err) {
            console.error(err);
        }
    };
    const handleCreate = async (data) => {
        try {
            if (editingLeave) {
                // update leave
                await putJSON(`/leaves/employees/${editingLeave.id}`, data);
                setEditingLeave(null);
            }
            else {
                // create leave
                await postJSON('/leaves/employees', data);
            }
            fetchLeaves();
        }
        catch (err) {
            console.error(err);
        }
    };
    const handleEdit = (leave) => {
        setEditingLeave(leave);
    };
    const handleDelete = async (id) => {
        try {
            await delJSON(`/leaves/employees/${id}`);
            fetchLeaves();
        }
        catch (err) {
            console.error(err);
        }
    };
    useEffect(() => {
        fetchLeaves();
    }, []);
    return (_jsxs("div", { className: "max-w-4xl mx-auto p-6", children: [_jsx("h1", { className: "text-2xl font-bold mb-4", children: "Qu\u1EA3n l\u00FD ngh\u1EC9 ph\u00E9p" }), _jsx(LeaveForm, { onSubmit: handleCreate, initialData: editingLeave || undefined }), _jsx(LeaveList, { leaves: leaves, onEdit: handleEdit, onDelete: handleDelete })] }));
};
export default LeavesPage;
