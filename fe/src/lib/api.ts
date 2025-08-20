// src/lib/api.ts
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

async function handleResponse<T>(res: Response, path: string): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `${res.status} ${path} failed`);
  return data;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
  });
  return handleResponse<T>(res, path);
}

export async function apiPost<T>(path: string, body?: any): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(res, path);
}

export async function apiPatch<T>(path: string, body?: any): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(res, path);
}

// Thêm apiMe để front-end kiểm tra login qua cookie
export async function apiMe<T>(): Promise<T> {
  return apiGet<T>('/auth/me');
}
