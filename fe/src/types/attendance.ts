export type AttendanceRow = {
  id: number;
  employee_id?: number;
  work_date: string; // "YYYY-MM-DD"
  check_in: string | null; // ISO or null
  check_out: string | null; // ISO or null
  createdAt: string;
  updatedAt: string;
};

export type Paged<T> = {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type TodaySelf = {
  id?: number;
  work_date?: string;
  check_in?: string | null;
  check_out?: string | null;
  createdAt?: string;
  updatedAt?: string;
  checkedIn: boolean;
  checkedOut: boolean;
};
