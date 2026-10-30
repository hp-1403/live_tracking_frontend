export type UserRole = 'employee' | 'manager';

export interface User {
  id: string;
  employeeId?: string;
  fullName: string;
  email?: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt?: string;
}

export type ShiftStatus = 'active' | 'paused' | 'completed';

export interface Shift {
  id: string;
  employeeId: string;
  startedAt: string;
  endedAt?: string | null;
  status: ShiftStatus;
  totalDurationSeconds?: number;
  idleDurationSeconds?: number;
  livekitRoomName?: string;
  employeeName?: string;
  employeeEmail?: string;
  avatarUrl?: string;
}

export interface ActivityLog {
  id: string;
  shiftId: string;
  employeeId: string;
  recordedAt: string;
  isIdle: boolean;
  idleDurationSeconds: number;
  tabActive: boolean;
  activeWindowTitle?: string;
}

export interface LiveEmployeeData {
  employeeId: string;
  employeeName: string;
  socketId: string;
  status: 'active' | 'idle' | 'on_break';
  hasWebcam: boolean;
  hasScreen: boolean;
  lastPing: string;
  shiftId?: string;
  avatarUrl?: string;
}

export interface AuthAuditLog {
  id: string;
  userId?: string;
  employeeId: string;
  employeeName: string;
  action: 'LOGIN' | 'LOGOUT' | 'SHIFT_STARTED' | 'SHIFT_PAUSED' | 'SHIFT_RESUMED' | 'SHIFT_COMPLETED' | 'AUTO_PAUSED_INACTIVITY';
  details?: string;
  ipAddress?: string;
  createdAt: string;
}
