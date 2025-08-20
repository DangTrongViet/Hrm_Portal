import { getJSON, buildQuery } from '../../lib/http';
import type { Role } from '../../types/api';

export async function listRoles(
  params: { department?: string; q?: string; limit?: number } = {}
): Promise<Role[]> {
  const qs = buildQuery({
    department: params.department,
    q: params.q,
    limit: params.limit ?? 20,
  });
  return getJSON<Role[]>(`/roles${qs}`);
}
