import {
  getJSON,
  postJSON,
  putJSON,
  delJSON,
  buildQuery,
} from '../../lib/http';
import type { Employee, PagedResp } from '../../types/api';

type ListParams = {
  q?: string;
  department?: string;
  status?: 'active' | 'inactive' | '';
  sort?: 'full_name' | 'department' | 'status' | 'createdAt' | 'updatedAt';
  dir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
};

type MaybeEnvelope<T> = T | { data: T };
const unwrap = <T>(x: MaybeEnvelope<T>) => (x as any)?.data ?? (x as T);

export async function listEmployees(
  p: ListParams
): Promise<PagedResp<Employee>> {
  const qs = buildQuery({
    q: p.q,
    department: p.department,
    status: p.status || undefined,
    sort: p.sort ?? 'full_name',
    dir: p.dir ?? 'asc',
    page: p.page ?? 1,
    pageSize: p.pageSize ?? 10,
  });

  const raw = await getJSON<MaybeEnvelope<PagedResp<Employee>>>(
    `/employees${qs}`
  );
  return unwrap(raw);
}

export async function createEmployee(e: Partial<Employee>): Promise<Employee> {
  const raw = await postJSON<MaybeEnvelope<Employee>>(`/employees`, e);
  return unwrap(raw);
}

export async function updateEmployee(
  id: number | string,
  e: Partial<Employee>
): Promise<Employee> {
  const raw = await putJSON<MaybeEnvelope<Employee>>(`/employees/${id}`, e);
  return unwrap(raw);
}

export async function deleteEmployee(id: number | string): Promise<void> {
  await delJSON(`/employees/${id}`);
}

export async function listEmployeesWithoutContract(): Promise<Employee[]> {
  const raw = await getJSON<MaybeEnvelope<Employee[]>>(
    `/employees/users-options`
  );
  return unwrap(raw);
}
