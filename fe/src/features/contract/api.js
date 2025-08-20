import { getJSON, postJSON, patchJSON, delJSON } from '../../lib/http';
export const ContractApi = {
    async list(params = { page: 1, pageSize: 20 }) {
        const body = await getJSON(`/contracts${params ? '?' + new URLSearchParams(params) : ''}`);
        return {
            data: Array.isArray(body?.data) ? body.data : [],
            total: Number(body?.total ?? 0),
        };
    },
    async get(id) {
        return getJSON(`/contracts/${id}`);
    },
    async create(payload) {
        return postJSON(`/contracts`, payload);
    },
    async update(id, payload) {
        return patchJSON(`/contracts/${id}`, payload);
    },
    async remove(id) {
        return delJSON(`/contracts/${id}`);
    },
    async exportWord(id) {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/contracts/${id}/export`, {
            method: 'GET',
            credentials: 'include',
        });
        if (!res.ok)
            throw new Error(`Export failed: ${res.status}`);
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
export async function getEligibleEmployees() {
    try {
        const res = await getJSON(`/employees/users-options`);
        const arr = Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res)
                ? res
                : [];
        return arr.filter(Boolean).map((e) => ({
            id: Number(e.id),
            full_name: String(e.full_name ?? e.name ?? ''),
            email: e.email ?? null,
        }));
    }
    catch (err) {
        console.error('getEligibleEmployees error', err);
        return [];
    }
}
