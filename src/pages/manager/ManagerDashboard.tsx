import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Navbar } from '../../components/common/Navbar';
import { ActivityStatsOverview } from '../../components/manager/ActivityStatsOverview';
import { EmployeeLiveGrid } from '../../components/manager/EmployeeLiveGrid';
import { LiveStreamModal } from '../../components/manager/LiveStreamModal';
import { ShiftHistoryTable } from '../../components/manager/ShiftHistoryTable';
import { AuthAuditLogTable } from '../../components/manager/AuthAuditLogTable';
import { Button } from '../../components/common/Button';
import {
  useAllActiveShiftsQuery,
  useShiftHistoryQuery,
  shiftQueryKeys,
} from '../../hooks/queries/useShiftQueries';
import { useAuditLogsQuery } from '../../hooks/queries/useActivityQueries';
import { getSocket } from '../../services/socket';
import { LiveEmployeeData } from '../../types';
import { RefreshCw, Users, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ManagerDashboard: React.FC = () => {
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const [liveEmployees, setLiveEmployees] = useState<LiveEmployeeData[]>([]);
  const [selectedEmployeeForStream, setSelectedEmployeeForStream] = useState<LiveEmployeeData | null>(null);

  // 1. React Query: Active shifts & history
  const {
    data: activeShifts = [],
    refetch: refetchActiveShifts,
    isFetching: isFetchingActive,
  } = useAllActiveShiftsQuery();

  const {
    data: shiftHistory = [],
    refetch: refetchHistory,
    isFetching: isFetchingHistory,
  } = useShiftHistoryQuery();

  const {
    data: auditLogs = [],
    refetch: refetchAuditLogs,
    isFetching: isFetchingAudit,
    isLoading: isLoadingAudit,
  } = useAuditLogsQuery();

  const isRefreshing = isFetchingActive || isFetchingHistory || isFetchingAudit;

  const handleRefresh = async () => {
    await Promise.all([refetchActiveShifts(), refetchHistory(), refetchAuditLogs()]);
  };

  // 2. Setup Socket.IO Realtime Listeners for Live Employee Grid
  useEffect(() => {
    const socket = getSocket();

    // Register manager to receive live employee events
    socket.emit('manager-join');

    // 1. Initial sync of all connected employees
    const handleSync = (employees: LiveEmployeeData[]) => {
      setLiveEmployees(employees);
    };

    // 2. Status update from an employee
    const handleStatusUpdate = (updatedEmployee: LiveEmployeeData) => {
      setLiveEmployees((prev) => {
        const index = prev.findIndex((e) => e.employeeId === updatedEmployee.employeeId);
        if (index >= 0) {
          const clone = [...prev];
          clone[index] = updatedEmployee;
          return clone;
        }
        return [...prev, updatedEmployee];
      });
      // Invalidate active shifts so counts refresh
      queryClient.invalidateQueries({ queryKey: shiftQueryKeys.activeAll() });
    };

    // 3. Employee disconnected/offline
    const handleEmployeeOffline = (data: { employeeId: string }) => {
      setLiveEmployees((prev) => prev.filter((e) => e.employeeId !== data.employeeId));
      queryClient.invalidateQueries({ queryKey: shiftQueryKeys.activeAll() });
    };

    socket.on('live-employees-sync', handleSync);
    socket.on('employee-status-update', handleStatusUpdate);
    socket.on('employee-offline', handleEmployeeOffline);

    return () => {
      socket.off('live-employees-sync', handleSync);
      socket.off('employee-status-update', handleStatusUpdate);
      socket.off('employee-offline', handleEmployeeOffline);
    };
  }, [queryClient]);

  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden bg-slate-50 text-slate-900 pb-12 sm:pb-16 2xl:pb-24">
      <Navbar />

      <main className="max-w-7xl 2xl:max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8 2xl:px-12 pt-4 sm:pt-6 lg:pt-8 2xl:pt-10 space-y-6 sm:space-y-8">
        {/* Top Header */}
        <div className="min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h2 className="min-w-0 text-xl sm:text-2xl 2xl:text-3xl font-extrabold text-slate-900 flex items-start gap-2 sm:gap-2.5">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" /> Management Command Center
            </h2>
            <p className="text-xs sm:text-sm 2xl:text-base text-slate-500 mt-1">
              Live real-time employee presence, screen captures, webcam feeds, and shift performance
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              isLoading={isRefreshing}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
              className="flex-1 sm:flex-initial text-xs sm:text-sm 2xl:text-base"
            >
              Refresh Data
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={logout}
              icon={<LogOut className="w-3.5 h-3.5" />}
              className="flex-1 sm:flex-initial text-xs sm:text-sm 2xl:text-base"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Metric Cards */}
        <ActivityStatsOverview
          liveEmployees={liveEmployees}
          activeShifts={activeShifts}
        />

        {/* Live Employee Grid Section */}
        <div className="space-y-3.5 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
            <h3 className="text-base sm:text-lg 2xl:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" /> Live Employee Monitoring Grid
            </h3>
            <span className="text-[11px] sm:text-xs 2xl:text-sm text-slate-500 font-medium">
              Auto-updating via WebSockets
            </span>
          </div>

          <EmployeeLiveGrid
            employees={liveEmployees}
            activeShifts={activeShifts}
            onSelectEmployeeForStream={(emp) => setSelectedEmployeeForStream(emp)}
          />
        </div>

        {/* Historical Shifts Table */}
        <ShiftHistoryTable shifts={shiftHistory} />

        {/* Database Audit Logs Table (Logins, Logouts, Auto-Shifts) */}
        <AuthAuditLogTable logs={auditLogs} isLoading={isLoadingAudit} />

        {/* Live Video Stream Modal */}
        <LiveStreamModal
          isOpen={!!selectedEmployeeForStream}
          onClose={() => setSelectedEmployeeForStream(null)}
          employee={selectedEmployeeForStream}
        />
      </main>
    </div>
  );
};
