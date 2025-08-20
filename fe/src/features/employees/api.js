import { getJSON, postJSON, putJSON, delJSON, buildQuery, } from '../../lib/http';
const unwrap = (x) => x?.data ?? x;
export async function listEmployees(p) {
    const qs = buildQuery({
        q: p.q,
        department: p.department,
        status: p.status || undefined,
        sort: p.sort ?? 'full_name',
        dir: p.dir ?? 'asc',
        page: p.page ?? 1,
        pageSize: p.pageSize ?? 10,
    });
    const raw = await getJSON(`/employees${qs}`);
    return unwrap(raw);
}
export async function createEmployee(e) {
    const raw = await postJSON(`/employees`, e);
    return unwrap(raw);
}
export async function updateEmployee(id, e) {
    const raw = await putJSON(`/employees/${id}`, e);
    return unwrap(raw);
}
export async function deleteEmployee(id) {
    await delJSON(`/employees/${id}`);
}
export async function listEmployeesWithoutContract() {
    const raw = await getJSON(`/employees/users-options`);
    return unwrap(raw);
}
