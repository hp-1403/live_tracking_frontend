const API_BASE_URL = '/api';

export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('token', token);
};

export const clearAuthToken = (): void => {
  localStorage.removeItem('token');
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  login: (credentials: { employeeId: string; name: string }) =>
    request<{ success: boolean; user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (payload: { fullName: string; role?: string; email?: string }) =>
    request<{
      success: boolean;
      employee?: { employeeId: string; name: string };
      user: any;
      token: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  logout: (payload?: { userId?: string; employeeId?: string }) =>
    request<{ success: boolean }>('/auth/logout', {
      method: 'POST',
      body: payload ? JSON.stringify(payload) : undefined,
    }).catch(() => ({ success: true })),

  getAuditLogs: () => request<{ logs: any[] }>('/auth/audit-logs'),

  getMe: () => request<{ user: any }>('/auth/me'),

  // Shifts
  startShift: () =>
    request<{ shift: any }>('/shifts/start', {
      method: 'POST',
    }),

  updateShiftStatus: (id: string, status: 'active' | 'paused' | 'completed', idleSecondsDelta = 0, reason?: string) =>
    request<{ shift: any }>(`/shifts/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, idleSecondsDelta, reason }),
    }),

  getMyActiveShift: () => request<{ shift: any | null }>('/shifts/my-active'),

  getAllActiveShifts: () => request<{ shifts: any[] }>('/shifts/active-all'),

  getShiftHistory: () => request<{ shifts: any[] }>('/shifts/history'),

  // Activity Logs
  logActivity: (payload: {
    shiftId: string;
    isIdle: boolean;
    idleDurationSeconds: number;
    tabActive: boolean;
    activeWindowTitle?: string;
  }) =>
    request<{ log: any }>('/activity/log', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getShiftActivityLogs: (shiftId: string) =>
    request<{ logs: any[] }>(`/activity/shift/${shiftId}`),
};
