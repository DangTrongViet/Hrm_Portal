export function getPerms(u) {
    const src = u?.permissions ?? u?.perms ?? [];
    const arr = Array.isArray(src) ? src : [];
    const perms = arr
        .map((p) => (typeof p === 'string' ? p : (p?.code ?? p?.name ?? '')))
        .filter(Boolean)
        .map((s) => s.toLowerCase());
    return [...new Set(perms)];
}
export function hasPerm(u, needed) {
    const perms = getPerms(u);
    const need = (Array.isArray(needed) ? needed : [needed]).map((s) => s.toLowerCase());
    return need.some((p) => perms.includes(p));
}
