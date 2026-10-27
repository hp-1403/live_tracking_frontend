import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Shift } from '../../types';

export const shiftQueryKeys = {
  all: ['shifts'] as const,
  myActive: () => [...shiftQueryKeys.all, 'my-active'] as const,
  activeAll: () => [...shiftQueryKeys.all, 'active-all'] as const,
  history: () => [...shiftQueryKeys.all, 'history'] as const,
};

// 1. Get current employee's active shift
export const useMyActiveShiftQuery = (enabled = true) => {
  return useQuery({
    queryKey: shiftQueryKeys.myActive(),
    queryFn: async () => {
      const res = await api.getMyActiveShift();
      return res.shift as Shift | null;
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
      return res.shift as Shift;
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
    }: {
      shiftId: string;
      status: 'active' | 'paused' | 'completed';
      idleSecondsDelta?: number;
    }) => {
      const res = await api.updateShiftStatus(shiftId, status, idleSecondsDelta);
      return res.shift as Shift;
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
      return (res.shifts || []) as Shift[];
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
      return (res.shifts || []) as Shift[];
    },
    enabled,
  });
};
