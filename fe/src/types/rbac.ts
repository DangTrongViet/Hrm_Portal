export type Permission = {
  id: number;
  name: string;
  description: string | null; // 👈 cho phép null (khớp DB/BE)
  code?: string; // 👈 thêm dòng này
};

export type Role = {
  id: number;
  name: string;
  description: string | null;
  department: string | null;
  permissions?: Permission[]; // khi GET /roles/:id
};
