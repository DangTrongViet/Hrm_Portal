// src/lib/http.ts
// ✅ BASE có thể là http://localhost:3000/api hoặc https://api-hrm-portal.onrender.com/api
//   → FE KHÔNG thêm /api trong path (chỉ dùng "/me", "/auth/login", ...)
export const BASE = (import.meta.env.VITE_API_BASE_URL as string || "").replace(/\/+$/, "");

// Ghép URL an toàn, không bị // hoặc /api/api
const url = (path: string) => {
  const p = String(path || "");
  if (/^https?:\/\//i.test(p)) return p;                       // cho phép pass full URL khi cần
  return `${BASE}/${p.replace(/^\/+/, "")}`;
};

async function parseResponse<T>(res: Response): Promise<T> {
  const ct = res.headers.get("content-type") || "";

  // ❗ Nếu response lỗi → cố gắng parse JSON trước, fallback text
  if (!res.ok) {
    try {
      if (ct.includes("application/json")) {
        const j = await res.json();
        throw new Error(j?.message || `HTTP ${res.status}`);
      }
      const t = await res.text();
      throw new Error(t || `HTTP ${res.status}`);
    } catch (e: any) {
      throw new Error(e?.message || `HTTP ${res.status}`);
    }
  }

  // ✅ Một số BE set sai content-type → thử parse text->JSON
  if (!ct.includes("application/json")) {
    const t = await res.text();
    try {
      return JSON.parse(t) as T;
    } catch {
      throw new Error("Server did not return JSON");
    }
  }

  return res.json();
}

// Mặc định luôn gửi cookie (httpOnly) theo CORS
const common: RequestInit = { credentials: "include" };

export async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(url(path), {
    ...common,
    method: "GET",
    // ❗ KHÔNG set Content-Type cho GET, chỉ Accept
    headers: { Accept: "application/json" },
  });
  return parseResponse<T>(res);
}

export async function postJSON<T>(path: string, data: unknown): Promise<T> {
  const res = await fetch(url(path), {
    ...common,
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(data),
  });
  return parseResponse<T>(res);
}

export async function putJSON<T>(path: string, data: unknown): Promise<T> {
  const res = await fetch(url(path), {
    ...common,
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(data),
  });
  return parseResponse<T>(res);
}

export async function patchJSON<T>(path: string, data: unknown): Promise<T> {
  const res = await fetch(url(path), {
    ...common,
    method: "PATCH",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(data),
  });
  return parseResponse<T>(res);
}

export async function delJSON(path: string): Promise<void> {
  const res = await fetch(url(path), {
    ...common,
    method: "DELETE",
    headers: { Accept: "application/json" },
  });
  await parseResponse<void>(res);
}

export async function postNoBody(path: string): Promise<void> {
  const res = await fetch(url(path), {
    ...common,
    method: "POST",
    headers: { Accept: "application/json" },
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
