// Auth
export type User = {
  id: number | string;
  full_name: string;
  email?: string | null;
  status: 'active' | 'inactive';
  roleId: number | string;
  permissions: string[];
};

// LoginResp dùng User mới
export type LoginResp = {
  tokenUser: string;
  user: User;
};

export type ApiMessage = {
  message: string;
};

export type ResetPasswordResp = ApiMessage;

// Employees: match BE fields
export type Employee = {
  id: number | string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  department?: string | null;
  position?: string | null;
  status: 'active' | 'inactive';
};

// Phân trang chung
export type PagedResp<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type Role = {
  id: number | string;
  name: string;
  description?: string | null;
};
