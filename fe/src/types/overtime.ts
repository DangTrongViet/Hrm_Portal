export type Overtime = {
  id: number;
  employee_id: number;
  date: string; // ISO string yyyy-MM-dd
  hours: string; // backend trả ra là "2.00", nên để string
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  Employee?: {
    full_name: string;
  };
};

export type OvertimeEmployee = {
  id: number;
  employee_id: number;
  date: string;
  hours: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
};
