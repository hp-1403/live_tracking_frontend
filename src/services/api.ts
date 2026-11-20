import toast from 'react-hot-toast';

const API_BASE_URL = '/api';

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  const path = window.location.pathname;
  if (path.startsWith('/manager') || path.startsWith('/register')) {
    return (
      sessionStorage.getItem('token_manager') ||
      sessionStorage.getItem('token') ||
      localStorage.getItem('token_manager') ||
      null
    );
  }
  if (path.startsWith('/employee')) {
    return (
      sessionStorage.getItem('token_employee') ||
      sessionStorage.getItem('token') ||
      localStorage.getItem('token_employee') ||
      null
    );
  }
  // For any other path (e.g. /login), strictly isolate to this tab's sessionStorage
  return sessionStorage.getItem('token') || null;
};

export const setAuthToken = (token: string, role?: string): void => {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('token', token);
  if (role === 'manager') {
    sessionStorage.setItem('token_manager', token);
    localStorage.setItem('token_manager', token);
  } else if (role === 'employee') {
    sessionStorage.setItem('token_employee', token);
    localStorage.setItem('token_employee', token);
  }
};

export const clearAuthToken = (role?: string): void => {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  if (role === 'manager') {
    sessionStorage.removeItem('token_manager');
    sessionStorage.removeItem('user_manager');
    localStorage.removeItem('token_manager');
    localStorage.removeItem('user_manager');
  } else if (role === 'employee') {
    sessionStorage.removeItem('token_employee');
    sessionStorage.removeItem('user_employee');
    localStorage.removeItem('token_employee');
    localStorage.removeItem('user_employee');
  } else {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export interface RequestOptions extends RequestInit {
  silent?: boolean;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (networkError: any) {
    const errorMsg =
      networkError?.message === 'Failed to fetch'
        ? 'Cannot connect to server. Please check your network or server status.'
        : networkError?.message || 'Network error occurred.';
    
    if (!options.silent) {
      toast.error(errorMsg, { id: errorMsg });
    }
    throw new Error(errorMsg);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg =
      data.message ||
      data.error ||
      (Array.isArray(data.errors) ? data.errors.map((e: any) => e.message || e).join(', ') : null) ||
      `Request failed with status ${response.status}`;

    // Automatically trigger error hot toast for any failed API across the whole project
    if (!options.silent) {
      toast.error(errorMsg, { id: errorMsg });
    }

    const err = new Error(errorMsg);
    (err as any).data = data;
    (err as any).status = response.status;
    throw err;
  }

  // Automatically trigger success hot toast when the API responds with a success message
  if (!options.silent && data && typeof data === 'object' && (data as any).message) {
    const msg = (data as any).message;
    toast.success(msg, { id: msg });
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

  getUsers: () =>
    request<{
      success: boolean;
      users: Array<{
        id: string;
        employeeId: string;
        fullName: string;
        email?: string;
        role: string;
        avatarUrl?: string;
        createdAt?: string;
      }>;
      nextEmployeeId: string;
    }>('/auth/users'),

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
