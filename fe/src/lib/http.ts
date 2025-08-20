// BASE có thể là: http://localhost:3000/api hoặc https://api-hrm-portal.onrender.com/api
export const BASE =
  ((import.meta.env.VITE_API_BASE_URL as string) || "").replace(/\/+$/, "");

/** Ghép URL an toàn, hỗ trợ cả URL tuyệt đối; KHÔNG bị lặp /api */
const url = (path: string) => {
  const p = String(path || "");
  if (/^https?:\/\//i.test(p)) return p;                // absolute URL
  if (!BASE) return `/${p.replace(/^\/+/, "")}`;        // no BASE -> relative
  return `${BASE}/${p.replace(/^\/+/, "")}`;            // normal join
};

async function parseResponse<T>(res: Response): Promise<T> {
  const ct = res.headers.get("content-type") || "";
  const isJSON = ct.includes("application/json") || ct.includes("+json");

  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;

  const readText = async () => {
    try { return await res.text(); } catch { return ""; }
  };

  if (!res.ok) {
    if (isJSON) {
      try {
        const j = await res.json();
        throw new Error(j?.message || `HTTP ${res.status}`);
      } catch {
        const t = await readText();
        throw new Error(t || `HTTP ${res.status}`);
      }
    } else {
      const t = await readText();
      try {
        const j = t ? JSON.parse(t) : null;
        throw new Error(j?.message || `HTTP ${res.status}`);
      } catch {
        throw new Error(t || `HTTP ${res.status}`);
      }
    }
  }

  if (isJSON) return res.json();

  const t = await readText();
  if (!t) return undefined as unknown as T;
  try { return JSON.parse(t) as T; } catch { throw new Error("Server did not return JSON"); }
}

const common: RequestInit = { credentials: "include" }; // gửi cookie httpOnly mọi request

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
