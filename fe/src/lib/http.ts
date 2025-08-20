export const BASE = import.meta.env.VITE_API_BASE_URL as string;

const url = (path: string) => `${BASE}${path}`;

async function parseResponse<T>(res: Response): Promise<T> {
  const ct = res.headers.get("content-type") || "";

  // Nếu response không ok → parse lỗi
  if (!res.ok) {
    if (ct.includes("application/json")) {
      const j = await res.json();
      throw new Error(j?.message || `HTTP ${res.status}`);
    } else {
      const text = await res.text();
      throw new Error(text || `HTTP ${res.status}`);
    }
  }

  // Nếu ok nhưng không phải JSON → throw
  if (!ct.includes("application/json")) {
    throw new Error("Server did not return JSON");
  }

  // Parse JSON an toàn
  return res.json();
}

export async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(url(path), {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  return parseResponse<T>(res);
}

export async function postJSON<T>(path: string, data: unknown): Promise<T> {
  const res = await fetch(url(path), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseResponse<T>(res);
}

export async function putJSON<T>(path: string, data: unknown): Promise<T> {
  const res = await fetch(url(path), {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseResponse<T>(res);
}

export async function patchJSON<T>(path: string, data: unknown): Promise<T> {
  const res = await fetch(url(path), {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseResponse<T>(res);
}

export async function delJSON(path: string): Promise<void> {
  const res = await fetch(url(path), {
    method: "DELETE",
    credentials: "include",
  });
  await parseResponse<void>(res);
}

export async function postNoBody(path: string): Promise<void> {
  const res = await fetch(url(path), {
    method: "POST",
    credentials: "include",
  });
  await parseResponse<void>(res);
}

export function buildQuery(params: Record<string, any>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}
