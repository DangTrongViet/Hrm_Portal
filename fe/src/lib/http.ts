// BASE có thể là: 
// - local:  http://localhost:3000/api
// - prod:   https://api-hrm-portal.onrender.com/api
export const BASE = (import.meta.env.VITE_API_BASE_URL as string || "").replace(/\/+$/, "");

// Ghép URL an toàn, KHÔNG để trùng /api
const url = (path: string) => {
  const p = String(path || "");
  if (/^https?:\/\//i.test(p)) return p;
  return `${BASE}/${p.replace(/^\/+/, "")}`;
};

async function parseResponse<T>(res: Response): Promise<T> {
  const ct = res.headers.get("content-type") || "";

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

  if (!ct.includes("application/json")) {
    const t = await res.text();
    try { return JSON.parse(t) as T; } 
    catch { throw new Error("Server did not return JSON"); }
  }
  return res.json();
}

const common: RequestInit = { credentials: "include" };

export async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(url(path), {
    ...common,
    method: "GET",
    headers: { Accept: "application/json" }, // KHÔNG set Content-Type cho GET
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
