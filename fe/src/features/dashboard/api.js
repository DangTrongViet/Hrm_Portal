import { getJSON } from '../../lib/http';
const DASHBOARD_BASE = '/dashboard';
// Employee
export const getTotalEmployees = async () => {
    const res = await getJSON(`${DASHBOARD_BASE}/total-employees`);
    return res.total;
};
export const getEmployeeSummary = async () => {
    const res = await getJSON(`${DASHBOARD_BASE}/employee-summary`);
    return res.data;
};
// Users
export const getTotalUsers = async () => {
    const res = await getJSON(`${DASHBOARD_BASE}/total-users`);
    return res.total;
};
export const getUsersSummary = async () => {
    const res = await getJSON(`${DASHBOARD_BASE}/user-summary`);
    return res.data;
};
// Contracts
export const getTotalContracts = async () => {
    const res = await getJSON(`${DASHBOARD_BASE}/total-contracts`);
    return res.total;
};
export const getContractSummary = async () => {
    const res = await getJSON(`${DASHBOARD_BASE}/contract-summary`);
    return res.data;
};
// Leaves
export const getTotalLeaves = async () => {
    const res = await getJSON(`${DASHBOARD_BASE}/total-leaves`);
    return res.total;
};
export const getLeaveSummary = async () => {
    const res = await getJSON(`${DASHBOARD_BASE}/leave-summary`);
    return res.data;
};
// Overtimes
export const getTotalOvertimes = async () => {
    const res = await getJSON(`${DASHBOARD_BASE}/total-overtimes`);
    return res.total;
};
export const getOvertimeSummary = async () => {
    const res = await getJSON(`${DASHBOARD_BASE}/overtime-summary`);
    return res.data;
};
// Payrolls
export const getTotalPayrolls = async () => {
    const res = await getJSON(`${DASHBOARD_BASE}/total-payrolls`);
    return res.total;
};
// Roles
export const getTotalRoles = async () => {
    const res = await getJSON(`${DASHBOARD_BASE}/total-roles`);
    return res.total;
};
// Permissions
export const getTotalPermissions = async () => {
    const res = await getJSON(`${DASHBOARD_BASE}/total-permissions`);
    return res.total;
};
