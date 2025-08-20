// src/lib/api.ts
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export async function apiGet(path) {
    const res = await fetch(`${API_BASE_URL}${path}`, { credentials: 'include' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok)
        throw new Error(data?.message || `GET ${path} failed`);
    return data;
}
export async function apiPost(path, body) {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok)
        throw new Error(data?.message || `POST ${path} failed`);
    return data;
}
export async function apiPatch(path, body) {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
    });
    // nếu API trả 204 No Content, .json() sẽ lỗi → fallback {}
    const data = await res.json().catch(() => ({}));
    if (!res.ok)
        throw new Error(data?.message || `PATCH ${path} failed`);
    return data;
}
