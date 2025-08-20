// src/features/payroll/types.ts
export interface Employee {
  id: number;
  full_name: string;
}
export interface Payroll {
  id?: number;
  employee_id?: number;
  period_start?: string | null;
  period_end?: string | null;
  base_salary?: string | number | null;
  bonus?: string | number | null;
  deductions?: string | number | null;
  net_salary?: string | number | null;
  employee?: {
    id: number;
    full_name: string;
  };
}
