import { getJSON } from '../../lib/http';

export interface Summary {
  total: number;
  active?: number;
  inactive?: number;
  expire?: string;
  terminate?: string;
  approve?: string;
  reject?: string;
  valid?: string;
  pending?: string;
}

const DASHBOARD_BASE = '/dashboard';

// Employee
export const getTotalEmployees = async (): Promise<number> => {
  const res = await getJSON<{ success: boolean; total: number }>(
    `${DASHBOARD_BASE}/total-employees`
  );
  return res.total;
};
export const getEmployeeSummary = async (): Promise<Summary> => {
  const res = await getJSON<{ success: boolean; data: Summary }>(
    `${DASHBOARD_BASE}/employee-summary`
  );
  return res.data;
};

// Users
export const getTotalUsers = async (): Promise<number> => {
  const res = await getJSON<{ success: boolean; total: number }>(
    `${DASHBOARD_BASE}/total-users`
  );
  return res.total;
};
export const getUsersSummary = async (): Promise<Summary> => {
  const res = await getJSON<{ success: boolean; data: Summary }>(
    `${DASHBOARD_BASE}/user-summary`
  );
  return res.data;
};

// Contracts
export const getTotalContracts = async (): Promise<number> => {
  const res = await getJSON<{ success: boolean; total: number }>(
    `${DASHBOARD_BASE}/total-contracts`
  );
  return res.total;
};
export const getContractSummary = async (): Promise<Summary> => {
  const res = await getJSON<{ success: boolean; data: Summary }>(
    `${DASHBOARD_BASE}/contract-summary`
  );
  return res.data;
};

// Leaves
export const getTotalLeaves = async (): Promise<number> => {
  const res = await getJSON<{ success: boolean; total: number }>(
    `${DASHBOARD_BASE}/total-leaves`
  );
  return res.total;
};
export const getLeaveSummary = async (): Promise<Summary> => {
  const res = await getJSON<{ success: boolean; data: Summary }>(
    `${DASHBOARD_BASE}/leave-summary`
  );
  return res.data;
};

// Overtimes
export const getTotalOvertimes = async (): Promise<number> => {
  const res = await getJSON<{ success: boolean; total: number }>(
    `${DASHBOARD_BASE}/total-overtimes`
  );
  return res.total;
};
export const getOvertimeSummary = async (): Promise<Summary> => {
  const res = await getJSON<{ success: boolean; data: Summary }>(
    `${DASHBOARD_BASE}/overtime-summary`
  );
  return res.data;
};

// Payrolls
export const getTotalPayrolls = async (): Promise<number> => {
  const res = await getJSON<{ success: boolean; total: number }>(
    `${DASHBOARD_BASE}/total-payrolls`
  );
  return res.total;
};

// Roles
export const getTotalRoles = async (): Promise<number> => {
  const res = await getJSON<{ success: boolean; total: number }>(
    `${DASHBOARD_BASE}/total-roles`
  );
  return res.total;
};

// Permissions
export const getTotalPermissions = async (): Promise<number> => {
  const res = await getJSON<{ success: boolean; total: number }>(
    `${DASHBOARD_BASE}/total-permissions`
  );
  return res.total;
};
