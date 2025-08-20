import React, { useState, useEffect } from 'react';
import '../../../../public/css/leave/LeaveForm.css';
interface LeaveFormProps {
  onSubmit: (data: any) => void;
  initialData?: {
    id: number;
    start_date: string;
    end_date: string;
    reason: string;
    status: string;
  };
}

const LeaveForm: React.FC<LeaveFormProps> = ({ onSubmit, initialData }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // Nếu có initialData (khi edit) thì prefill form
  useEffect(() => {
    if (initialData) {
      setStartDate(initialData.start_date);
      setEndDate(initialData.end_date);
      setReason(initialData.reason);
    } else {
      setStartDate('');
      setEndDate('');
      setReason('');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      start_date: startDate,
      end_date: endDate,
      reason,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="leave-form-container">
      <div className="form-group">
        <label className="form-label">Từ ngày</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="form-input"
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label">Đến ngày</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="form-input"
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label">Lý do</label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="form-input"
          required
        />
      </div>
      <button type="submit" className="submit-button">
        {initialData ? 'Cập nhật' : 'Tạo mới'}
      </button>
    </form>
  );
};

export default LeaveForm;
