export type EmployeeLite = {
  id: number;
  full_name: string;
  email?: string | null;
};

export type Contract = {
  id: number;
  employee_id: number;
  contract_type?: string | null;
  start_date?: string | null; // YYYY-MM-DD
  end_date?: string | null; // YYYY-MM-DD
  salary?: number | null;
  status: 'valid' | 'expired' | 'terminated';
  createdAt?: string;
  updatedAt?: string;
  employee?: EmployeeLite | null; // BE include alias: employee
};

export type Paged<T> = {
  data: T[];
  total: number;
};
