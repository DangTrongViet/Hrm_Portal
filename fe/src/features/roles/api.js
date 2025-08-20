import { getJSON, buildQuery } from '../../lib/http';
export async function listRoles(params = {}) {
    const qs = buildQuery({
        department: params.department,
        q: params.q,
        limit: params.limit ?? 20,
    });
    return getJSON(`/roles${qs}`);
}
