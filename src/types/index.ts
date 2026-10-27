export type UserRole = 'employee' | 'manager';

export interface User {
  id: string;
  fullName: string;
  email: string;
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
