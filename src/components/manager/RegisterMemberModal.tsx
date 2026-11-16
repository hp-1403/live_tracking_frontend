import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '../../context/AuthContext';
import { useUsersQuery } from '../../hooks/queries/useActivityQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '../common/Button';
import { InputField } from '../common/InputField';
import { registerSchema, RegisterFormData } from '../../schemas/authSchemas';
import {
  X,
  UserPlus,
  Users,
  CheckCircle2,
  Copy,
  Check,
  User,
  Shield,
  Sparkles,
  RefreshCw,
  Search,
  Hash,
  UserCheck,
} from 'lucide-react';

interface RegisterMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'register' | 'directory';
}

export const RegisterMemberModal: React.FC<RegisterMemberModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'register',
}) => {
  const { register: registerAuth } = useAuth();
  const queryClient = useQueryClient();
  const { data: usersData, refetch: refetchUsers, isLoading: isLoadingUsers } = useUsersQuery();

  const [activeTab, setActiveTab] = useState<'register' | 'directory'>(initialTab);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [registeredEmployee, setRegisteredEmployee] = useState<{
    employeeId: string;
    name: string;
    role: string;
  } | null>(null);

  // Sync tab when initialTab changes on open
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setServerError(null);
      setRegisteredEmployee(null);
    }
  }, [isOpen, initialTab]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // React Hook Form for Registration
  const {
    register: registerForm,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
    setValue: setRegisterValue,
    watch: watchRegister,
    reset: resetForm,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      fullName: '',
      role: 'employee',
    },
  });

  const selectedRole = watchRegister('role');

  const onRegisterSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    setIsLoading(true);
    try {
      const result = await registerAuth({
        fullName: data.fullName,
        role: (data.role as 'employee' | 'manager') || 'employee',
      });

      setRegisteredEmployee({
        employeeId: result.employeeId,
        name: data.fullName,
        role: (data.role as 'employee' | 'manager') || 'employee',
      });

      // Invalidate users directory so it updates immediately
      queryClient.invalidateQueries({ queryKey: ['users'] });
      refetchUsers();
    } catch (err: any) {
      setServerError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRegisterAnother = () => {
    setRegisteredEmployee(null);
    setServerError(null);
    resetForm({
      fullName: '',
      role: 'employee',
    });
  };

  if (!isOpen) return null;

  const usersList = usersData?.users || [];
  const nextEmployeeId = usersData?.nextEmployeeId || '';

  // Filter directory users
  const filteredUsers = usersList.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.employeeId.toLowerCase().includes(q) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      u.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Frosted Backdrop with soft daylight blur */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg 2xl:max-w-xl bg-white/95 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-5 sm:p-7 2xl:p-8 shadow-[0_25px_70px_-15px_rgba(15,23,42,0.25)] border border-white/90 overflow-hidden z-10 animate-scaleUp my-auto">
        {/* Top Gradient Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 via-purple-500 to-teal-500" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-600/25">
              {activeTab === 'register' ? (
                <UserPlus className="w-5 h-5" />
              ) : (
                <Users className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl 2xl:text-2xl font-bold tracking-tight text-slate-900">
                {activeTab === 'register' ? 'Register Member' : 'Allocated Employee IDs'}
              </h2>
              <p className="text-xs text-slate-500">
                {activeTab === 'register'
                  ? 'Allocate sequential Employee IDs for employees and admins.'
                  : 'View and copy all allocated Employee IDs in the directory.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Pill */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl mb-5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setServerError(null);
            }}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register New</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('directory')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'directory'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>View Allocated IDs</span>
            {usersList.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                {usersList.length}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: REGISTER MEMBER */}
        {activeTab === 'register' && (
          <div>
            {!registeredEmployee ? (
              <form onSubmit={handleRegisterSubmit(onRegisterSubmit)} className="space-y-4" noValidate>
                {/* Next Allocated ID Indicator */}
                {nextEmployeeId && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/80 border border-indigo-100 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <span className="text-slate-700 font-medium">Next ID to be Allocated:</span>
                    </div>
                    <span className="font-mono font-bold text-indigo-700 bg-white px-2.5 py-0.5 rounded-lg border border-indigo-200 shadow-2xs">
                      {nextEmployeeId}
                    </span>
                  </div>
                )}

                {serverError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                    {serverError}
                  </div>
                )}

                {/* Role Selector: Employee OR Admin */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                    Account Role
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setRegisterValue('role', 'employee')}
                      className={`p-2.5 sm:p-3 rounded-xl border text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        selectedRole === 'employee'
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs ring-1 ring-indigo-500/40 font-semibold'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <User className="w-4 h-4 text-indigo-600" />
                      <span>Employee</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegisterValue('role', 'manager')}
                      className={`p-2.5 sm:p-3 rounded-xl border text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        selectedRole === 'manager' || selectedRole === 'admin'
                          ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-xs ring-1 ring-purple-500/40 font-semibold'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Shield className="w-4 h-4 text-purple-600" />
                      <span>Admin</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    {selectedRole === 'manager'
                      ? 'Admins can manage members, view live screens, webcams, and audit logs.'
                      : 'Employees track active shifts with automatic motion detection.'}
                  </p>
                </div>

                {/* Full Name */}
                <InputField
                  label="Full Name"
                  type="text"
                  placeholder="Enter full name (e.g. Rahul Sharma)"
                  icon={<UserCheck className="w-4 h-4 text-indigo-600 stroke-[2.2]" />}
                  error={registerErrors.fullName?.message}
                  {...registerForm('fullName')}
                />

                {/* Submit Button */}
                <div className="pt-2 flex items-center gap-2.5">
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isLoading}
                    className="flex-1 shadow-md shadow-indigo-600/25"
                    icon={<UserPlus className="w-4 h-4" />}
                  >
                    Assign ID &amp; Register
                  </Button>
                </div>
              </form>
            ) : (
              /* REGISTRATION SUCCESS VIEW */
              <div className="space-y-4 text-center animate-fadeIn py-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>

                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-slate-900 mb-1">
                    Registration Successful!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    <strong className="text-slate-800">{registeredEmployee.name}</strong> has been registered as{' '}
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        registeredEmployee.role === 'manager'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}
                    >
                      {registeredEmployee.role === 'manager' ? (
                        <>
                          <Shield className="w-3 h-3 text-purple-600" /> Admin
                        </>
                      ) : (
                        <>
                          <User className="w-3 h-3 text-indigo-600" /> Employee
                        </>
                      )}
                    </span>.
                  </p>
                </div>

                {/* Highlighted Employee ID Box */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2">
                  <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-500">
                    Allocated Employee ID
                  </div>
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                    <span className="text-xl font-mono font-bold text-indigo-600 tracking-wider">
                      {registeredEmployee.employeeId}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(registeredEmployee.employeeId)}
                      className="p-1.5 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                    >
                      {copiedId === registeredEmployee.employeeId ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy ID</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600 bg-indigo-50/70 p-2 rounded-lg border border-indigo-100">
                    Provide ID <strong>{registeredEmployee.employeeId}</strong> and Name <strong>{registeredEmployee.name}</strong> to the member for login.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={handleRegisterAnother}
                    className="w-full justify-center"
                    icon={<RefreshCw className="w-3.5 h-3.5 text-indigo-600" />}
                  >
                    Register Another
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={() => {
                      setActiveTab('directory');
                      setRegisteredEmployee(null);
                    }}
                    className="w-full justify-center"
                    icon={<Users className="w-3.5 h-3.5" />}
                  >
                    View in Directory
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: VIEW ALLOCATED IDS DIRECTORY */}
        {activeTab === 'directory' && (
          <div className="space-y-3.5">
            {/* Search Filter & Next ID */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, ID or role..."
                  className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              {nextEmployeeId && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-xs font-medium text-slate-600 flex-shrink-0">
                  <span>Next:</span>
                  <span className="font-mono font-bold text-indigo-700">{nextEmployeeId}</span>
                </div>
              )}
            </div>

            {/* List of Allocated Members */}
            <div className="max-h-72 sm:max-h-80 overflow-y-auto space-y-2 pr-1">
              {isLoadingUsers ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-600" />
                  Loading directory...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                  No members matched your search.
                </div>
              ) : (
                filteredUsers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/90 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {member.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                            {member.fullName}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                              member.role === 'manager' || member.role === 'admin'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-indigo-100 text-indigo-700'
                            }`}
                          >
                            {member.role === 'manager' || member.role === 'admin' ? 'Admin' : 'Employee'}
                          </span>
                        </div>
                        {member.email && (
                          <div className="text-[10px] text-slate-500 truncate">{member.email}</div>
                        )}
                      </div>
                    </div>

                    {/* Allocated ID with 1-click Copy */}
                    <div className="flex items-center gap-1.5 flex-shrink-0 pl-2">
                      <span className="font-mono text-xs sm:text-sm font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                        {member.employeeId}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(member.employeeId)}
                        className="p-1 sm:p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
                        title="Copy Employee ID"
                      >
                        {copiedId === member.employeeId ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <span className="text-xs text-slate-500">
                Total Members: <strong className="text-slate-800">{usersList.length}</strong>
              </span>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => {
                  setActiveTab('register');
                  setRegisteredEmployee(null);
                }}
                icon={<UserPlus className="w-3.5 h-3.5" />}
              >
                Register Another Member
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
