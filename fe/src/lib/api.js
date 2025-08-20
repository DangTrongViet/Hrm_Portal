// src/lib/api.ts
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
async function handleResponse(res, path) {
    const data = await res.json().catch(() => ({}));
    if (!res.ok)
        throw new Error(data?.message || `${res.status} ${path} failed`);
    return data;
}
export async function apiGet(path) {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        credentials: 'include',
    });
    return handleResponse(res, path);
}
export async function apiPost(path, body) {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse(res, path);
}
export async function apiPatch(path, body) {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse(res, path);
}
// Thêm apiMe để front-end kiểm tra login qua cookie
export async function apiMe() {
    return apiGet('/auth/me');
}
