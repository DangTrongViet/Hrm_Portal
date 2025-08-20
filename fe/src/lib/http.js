export const BASE = import.meta.env.VITE_API_BASE_URL;
async function parseError(res) {
    let msg = `HTTP ${res.status}`;
    try {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
            const j = await res.json();
            msg = j?.message || msg;
        }
        else {
            msg = await res.text();
        }
    }
    catch { }
    throw new Error(msg);
}
const url = (path) => `${BASE}${path}`;
export async function getJSON(path) {
    const res = await fetch(url(path), { credentials: 'include' });
    console.log(url(path));
    if (!res.ok)
        await parseError(res);
    return res.json();
}
export async function postJSON(path, data) {
    const res = await fetch(url(path), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
    });
    if (!res.ok)
        await parseError(res);
    return res.json();
}
export async function putJSON(path, data) {
    const res = await fetch(url(path), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
    });
    if (!res.ok)
        await parseError(res);
    return res.json();
}
export async function patchJSON(path, data) {
    const res = await fetch(url(path), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
    });
    if (!res.ok)
        await parseError(res);
    return res.json();
}
export async function delJSON(path) {
    const res = await fetch(url(path), {
        method: 'DELETE',
        credentials: 'include',
    });
    if (!res.ok)
        await parseError(res);
}
export async function postNoBody(path) {
    const res = await fetch(url(path), {
        method: 'POST',
        credentials: 'include',
    });
    if (!res.ok)
        await parseError(res);
}
export function buildQuery(params) {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v === undefined || v === null || v === '')
            return;
        q.set(k, String(v));
    });
    const s = q.toString();
    return s ? `?${s}` : '';
}
