import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { ActivityLog } from '../../types';

export const activityQueryKeys = {
  all: ['activity'] as const,
  shift: (shiftId: string) => [...activityQueryKeys.all, 'shift', shiftId] as const,
};

// 1. Log Activity Mutation (Heartbeats)
export const useLogActivityMutation = () => {
  return useMutation({
    mutationFn: async (payload: {
      shiftId: string;
      isIdle: boolean;
      idleDurationSeconds: number;
      tabActive: boolean;
      activeWindowTitle?: string;
    }) => {
      const res = await api.logActivity(payload);
      return res.log as ActivityLog;
    },
  });
};

// 2. Get Activity Logs for a Shift
export const useShiftActivityLogsQuery = (shiftId?: string) => {
  return useQuery({
    queryKey: activityQueryKeys.shift(shiftId || ''),
    queryFn: async () => {
      if (!shiftId) return [];
      const res = await api.getShiftActivityLogs(shiftId);
      return (res.logs || []) as ActivityLog[];
    },
    enabled: !!shiftId,
  });
};

// 3. Get Auth & Shift Audit Logs (Logins, Logouts, Auto-starts, Auto-pauses)
export const useAuditLogsQuery = () => {
  return useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const res = await api.getAuditLogs();
      return (res.logs || []) as any[];
    },
    refetchInterval: 10000,
  });
};

// 4. Get All Registered Users & Allocated Employee IDs Directory
export const useUsersQuery = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.getUsers();
      return res;
    },
    refetchInterval: 15000,
  });
};
