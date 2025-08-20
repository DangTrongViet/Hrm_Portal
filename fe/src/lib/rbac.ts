// Chuẩn hóa permissions từ currentUser (có thể là string[] hoặc object[])
export type UserLike = any;

export function getPerms(u: UserLike): string[] {
  const src = u?.permissions ?? u?.perms ?? [];
  const arr = Array.isArray(src) ? src : [];
  const perms = arr
    .map((p: any) => (typeof p === 'string' ? p : (p?.code ?? p?.name ?? '')))
    .filter(Boolean)
    .map((s: string) => s.toLowerCase());
  return [...new Set(perms)];
}

export function hasPerm(u: UserLike, needed: string | string[]) {
  const perms = getPerms(u);
  const need = (Array.isArray(needed) ? needed : [needed]).map((s) =>
    s.toLowerCase()
  );
  return need.some((p) => perms.includes(p));
}
