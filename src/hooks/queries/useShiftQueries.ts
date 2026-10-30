import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Shift } from '../../types';

export const shiftQueryKeys = {
  all: ['shifts'] as const,
  myActive: () => [...shiftQueryKeys.all, 'my-active'] as const,
  activeAll: () => [...shiftQueryKeys.all, 'active-all'] as const,
  history: () => [...shiftQueryKeys.all, 'history'] as const,
};

/**
 * Normalizes any incoming shift object, ensuring proper field mapping and valid dates.
 */
export const normalizeShift = (raw: any): Shift | null => {
  if (!raw) return null;
  return {
    ...raw,
    id: raw.id,
    employeeId: raw.employeeId || raw.employee_id,
    startedAt: raw.startedAt || raw.started_at || new Date().toISOString(),
    endedAt: raw.endedAt || raw.ended_at || null,
    status: raw.status,
    totalDurationSeconds:
      raw.totalDurationSeconds !== undefined
        ? Number(raw.totalDurationSeconds)
        : raw.total_duration_seconds !== undefined
        ? Number(raw.total_duration_seconds)
        : 0,
    idleDurationSeconds:
      raw.idleDurationSeconds !== undefined
        ? Number(raw.idleDurationSeconds)
        : raw.idle_duration_seconds !== undefined
        ? Number(raw.idle_duration_seconds)
        : 0,
    livekitRoomName: raw.livekitRoomName || raw.livekit_room_name,
    employeeName:
      raw.employeeName || raw.employee_name || raw.fullName || raw.full_name || 'Employee',
    employeeEmail: raw.employeeEmail || raw.employee_email || raw.email,
  };
};

// 1. Get current employee's active shift
export const useMyActiveShiftQuery = (enabled = true) => {
  return useQuery({
    queryKey: shiftQueryKeys.myActive(),
    queryFn: async () => {
      const res = await api.getMyActiveShift();
      return normalizeShift(res.shift);
    },
    enabled,
    refetchInterval: 1000 * 30, // Background sync every 30s
  });
};

// 2. Start Shift Mutation
export const useStartShiftMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await api.startShift();
      return normalizeShift(res.shift) as Shift;
    },
    onSuccess: (newShift) => {
      queryClient.setQueryData(shiftQueryKeys.myActive(), newShift);
      queryClient.invalidateQueries({ queryKey: shiftQueryKeys.activeAll() });
      queryClient.invalidateQueries({ queryKey: shiftQueryKeys.history() });
    },
  });
};

// 3. Update Shift Status Mutation (Pause / Resume / Complete)
export const useUpdateShiftStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      shiftId,
      status,
      idleSecondsDelta = 0,
      reason,
    }: {
      shiftId: string;
      status: 'active' | 'paused' | 'completed';
      idleSecondsDelta?: number;
      reason?: string;
    }) => {
      const res = await api.updateShiftStatus(shiftId, status, idleSecondsDelta, reason);
      return normalizeShift(res.shift) as Shift;
    },
    onSuccess: (updatedShift) => {
      if (updatedShift.status === 'completed') {
        queryClient.setQueryData(shiftQueryKeys.myActive(), null);
      } else {
        queryClient.setQueryData(shiftQueryKeys.myActive(), updatedShift);
      }
      queryClient.invalidateQueries({ queryKey: shiftQueryKeys.activeAll() });
      queryClient.invalidateQueries({ queryKey: shiftQueryKeys.history() });
    },
  });
};

// 4. Get all active shifts (for Manager)
export const useAllActiveShiftsQuery = (enabled = true) => {
  return useQuery({
    queryKey: shiftQueryKeys.activeAll(),
    queryFn: async () => {
      const res = await api.getAllActiveShifts();
      return (res.shifts || []).map(normalizeShift).filter(Boolean) as Shift[];
    },
    enabled,
    refetchInterval: 1000 * 15, // Polling fallback alongside WebSockets
  });
};

// 5. Get Shift History
export const useShiftHistoryQuery = (enabled = true) => {
  return useQuery({
    queryKey: shiftQueryKeys.history(),
    queryFn: async () => {
      const res = await api.getShiftHistory();
      return (res.shifts || []).map(normalizeShift).filter(Boolean) as Shift[];
    },
    enabled,
  });
};
