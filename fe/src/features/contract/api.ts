import { getJSON, postJSON, patchJSON, delJSON } from '../../lib/http';
import type { Contract, Paged, EmployeeLite } from './type';

type ListParams = { page?: number; pageSize?: number };

export const ContractApi = {
  async list(
    params: ListParams = { page: 1, pageSize: 20 }
  ): Promise<Paged<Contract>> {
    const body = await getJSON<Paged<Contract>>(
      `/contracts${params ? '?' + new URLSearchParams(params as any) : ''}`
    );
    return {
      data: Array.isArray(body?.data) ? body.data : [],
      total: Number(body?.total ?? 0),
    };
  },

  async get(id: number): Promise<Contract> {
    return getJSON<Contract>(`/contracts/${id}`);
  },

  async create(payload: Partial<Contract>): Promise<Contract> {
    return postJSON<Contract>(`/contracts`, payload);
  },

  async update(id: number, payload: Partial<Contract>): Promise<Contract> {
    return patchJSON<Contract>(`/contracts/${id}`, payload);
  },

  async remove(id: number): Promise<void> {
    return delJSON(`/contracts/${id}`);
  },

  async exportWord(id: number): Promise<void> {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/contracts/${id}/export`,
      {
        method: 'GET',
        credentials: 'include',
      }
    );
    if (!res.ok) throw new Error(`Export failed: ${res.status}`);

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contract_${id}.docx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
};

/** Nhân viên đủ điều kiện (chưa có hợp đồng) */
export async function getEligibleEmployees(): Promise<EmployeeLite[]> {
  try {
    const res = await getJSON<EmployeeLite[] | { data: EmployeeLite[] }>(
      `/employees/users-options`
    );
    const arr = Array.isArray((res as any)?.data)
      ? (res as any).data
      : Array.isArray(res)
        ? (res as any)
        : [];
    return arr.filter(Boolean).map((e: any) => ({
      id: Number(e.id),
      full_name: String(e.full_name ?? e.name ?? ''),
      email: e.email ?? null,
    }));
  } catch (err) {
    console.error('getEligibleEmployees error', err);
    return [];
  }
}
