import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useUsersQuery } from '../../hooks/queries/useActivityQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Navbar } from '../../components/common/Navbar';
import { Button } from '../../components/common/Button';
import { InputField } from '../../components/common/InputField';
import { registerSchema, RegisterFormData } from '../../schemas/authSchemas';
import {
  ArrowRight,
  CheckCircle2,
  UserCheck,
  Sparkles,
  ArrowLeft,
  Copy,
  Check,
  User,
  Shield,
  UserPlus,
  RefreshCw,
  Search,
  Hash,
  Users,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: usersData, refetch: refetchUsers, isLoading: isLoadingUsers } = useUsersQuery();

  const [activeTab, setActiveTab] = useState<'register' | 'directory'>('register');
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [registeredEmployee, setRegisteredEmployee] = useState<{
    employeeId: string;
    name: string;
    role: string;
  } | null>(null);

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
      toast.success(`Member registered successfully with ID: ${result.employeeId}`);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      refetchUsers();
    } catch (err: any) {
      const errorMsg = err.message || 'Registration failed. Please try again.';
      setServerError(errorMsg);
      toast.error(errorMsg, { id: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterInvalid = (errors: any) => {
    const firstError = Object.values(errors)[0] as any;
    if (firstError?.message) {
      toast.error(firstError.message, { id: firstError.message });
    }
  };

  const handleCopyId = (id?: string) => {
    const targetId = id || registeredEmployee?.employeeId;
    if (targetId) {
      navigator.clipboard.writeText(targetId);
      setCopied(true);
      toast.success('Employee ID copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRegisterAnother = () => {
    setRegisteredEmployee(null);
    setServerError(null);
    resetForm({
      fullName: '',
      role: 'employee',
    });
  };

  const usersList = usersData?.users || [];
  const nextEmployeeId = usersData?.nextEmployeeId || '';

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
    <div className="min-h-screen min-w-0 relative flex flex-col overflow-x-hidden overflow-y-auto bg-slate-100 text-slate-900">
      {/* 1. High-Resolution Pristine Clean Modern Office Background */}
      <div
        className="fixed inset-0 bg-cover bg-center filter brightness-105 contrast-95 scale-100 pointer-events-none"
        style={{ backgroundImage: `url('/assets/clean-office-bg.jpg')` }}
      />

      {/* 2. Soft Luminous Light-Theme Overlay (Translucent Daylight Wash) */}
      <div className="fixed inset-0 bg-gradient-to-r from-white/75 via-white/60 to-white/65 backdrop-blur-[3px] pointer-events-none" />

      {/* 3. Ambient Light Accents */}
      <div className="fixed top-1/4 left-1/5 w-72 sm:w-96 2xl:w-[32rem] h-72 sm:h-96 2xl:h-[32rem] bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/5 w-72 sm:w-96 2xl:w-[32rem] h-72 sm:h-96 2xl:h-[32rem] bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Admin Navbar */}
      <div className="relative z-30">
        <Navbar />
      </div>

      <main className="flex-1 relative z-20 flex items-center justify-center px-3 py-6 sm:px-6 lg:px-8 2xl:px-12">
        <div className="w-full max-w-lg 2xl:max-w-xl min-w-0 space-y-4 sm:space-y-6 my-auto">
          {/* Back Navigation Bar & Access Pill */}
          <div className="flex items-center justify-between gap-3">
            <Link
              to="/manager"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 hover:bg-white backdrop-blur-md border border-white/90 text-slate-700 hover:text-indigo-600 text-xs sm:text-sm font-semibold transition-all shadow-xs"
            >
              <ArrowLeft className="w-4 h-4 text-indigo-600" /> Back to Dashboard
            </Link>
            <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-full bg-purple-100/85 backdrop-blur-md text-purple-800 border border-purple-200/90 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Admin Access Only
            </span>
          </div>

          {/* Main Registration Card with Frosted Glass Effect */}
          <div className="bg-white/80 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 2xl:p-10 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.12)] border border-white/90 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 via-purple-500 to-teal-500" />

            {/* Header */}
            <div className="flex items-start gap-3.5 mb-5">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-600/25">
                {activeTab === 'register' ? (
                  <UserPlus className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </div>
              <div>
                <h2 className="font-serif text-xl sm:text-2xl 2xl:text-3xl font-bold tracking-tight text-slate-900">
                  {activeTab === 'register' ? 'Register Member' : 'Allocated Employee IDs'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  {activeTab === 'register'
                    ? 'Create new credentials with automatic sequential Employee ID allocation.'
                    : 'View, search, and copy allocated Employee IDs across all registered members.'}
                </p>
              </div>
            </div>

            {/* Tab Navigation Pill */}
            <div className="flex items-center gap-2 p-1 bg-white/70 backdrop-blur-md rounded-xl mb-5 text-xs font-semibold border border-white/90">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setServerError(null);
                }}
                className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-indigo-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register Member</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('directory')}
                className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'directory'
                    ? 'bg-indigo-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Hash className="w-3.5 h-3.5" />
                <span>View Allocated IDs</span>
                {usersList.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-white text-[10px] font-bold">
                    {usersList.length}
                  </span>
                )}
              </button>
            </div>

            {/* TAB 1: REGISTRATION */}
            {activeTab === 'register' && (
              <div>
                {!registeredEmployee ? (
                  <>
                    {/* Next ID Indicator */}
                    {nextEmployeeId && (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/80 backdrop-blur-sm border border-indigo-100 text-xs sm:text-sm mb-4">
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
                      <div className="mb-4 p-3 rounded-xl bg-rose-50/90 backdrop-blur-sm border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium">
                        {serverError}
                      </div>
                    )}

                    {/* REGISTRATION FORM */}
                    <form onSubmit={handleRegisterSubmit(onRegisterSubmit, onRegisterInvalid)} className="space-y-4 sm:space-y-5" noValidate>
                      {/* Role Selector: Employee OR Admin */}
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                          Account Role
                        </label>
                        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                          <button
                            type="button"
                            onClick={() => setRegisterValue('role', 'employee')}
                            className={`p-3 rounded-xl border text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-all cursor-pointer backdrop-blur-sm ${
                              selectedRole === 'employee'
                                ? 'bg-indigo-50/90 border-indigo-500 text-indigo-700 shadow-sm ring-1 ring-indigo-500/40 font-semibold'
                                : 'bg-white/70 border-white/90 text-slate-600 hover:border-slate-300 hover:bg-white/90'
                            }`}
                          >
                            <User className="w-4 h-4 text-indigo-600" />
                            <span>Employee</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setRegisterValue('role', 'manager')}
                            className={`p-3 rounded-xl border text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-all cursor-pointer backdrop-blur-sm ${
                              selectedRole === 'manager' || selectedRole === 'admin'
                                ? 'bg-purple-50/90 border-purple-500 text-purple-700 shadow-sm ring-1 ring-purple-500/40 font-semibold'
                                : 'bg-white/70 border-white/90 text-slate-600 hover:border-slate-300 hover:bg-white/90'
                            }`}
                          >
                            <Shield className="w-4 h-4 text-purple-600" />
                            <span>Admin</span>
                          </button>
                        </div>
                        <p className="text-[11px] sm:text-xs text-slate-500 mt-1.5">
                          {selectedRole === 'manager'
                            ? 'Admins can view command center, live screen feeds, webcam monitors, and audit logs.'
                            : 'Employees track active work shifts, webcam, and screen monitoring.'}
                        </p>
                      </div>

                      {/* Full Name */}
                      <InputField
                        label="Full Name"
                        type="text"
                        placeholder="Enter full name (e.g. Rahul Sharma)"
                        icon={<UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 stroke-[2.2]" />}
                        error={registerErrors.fullName?.message}
                        className="bg-white/80 backdrop-blur-md border-white/90 focus:bg-white"
                        {...registerForm('fullName')}
                      />

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        isLoading={isLoading}
                        className="w-full mt-2 shadow-md shadow-indigo-600/30"
                        icon={<UserPlus className="w-4 h-4" />}
                      >
                        Assign ID &amp; Register Member
                      </Button>
                    </form>
                  </>
                ) : (
                  /* REGISTRATION SUCCESS VIEW */
                  <div className="space-y-5 sm:space-y-6 text-center animate-fadeIn">
                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 mx-auto">
                      <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8" />
                    </div>

                    <div>
                      <h2 className="font-serif text-xl sm:text-2xl 2xl:text-3xl font-bold tracking-tight text-slate-900 mb-1">
                        Registration Successful!
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600">
                        <strong className="text-slate-800">{registeredEmployee.name}</strong> has been registered as{' '}
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-full ${
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
                    <div className="p-4 sm:p-5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/90 text-left space-y-2.5 shadow-xs">
                      <div className="text-[11px] 2xl:text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Generated Employee ID
                      </div>
                      <div className="flex items-center justify-between bg-white/95 p-3 sm:p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
                        <span className="text-xl sm:text-2xl font-mono font-bold text-indigo-600 tracking-wider">
                          {registeredEmployee.employeeId}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyId()}
                          className="p-2 sm:p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                          title="Copy ID"
                        >
                          {copied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700 text-xs font-semibold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span className="text-xs">Copy ID</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-600 bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-100">
                        Provide this Employee ID (<strong>{registeredEmployee.employeeId}</strong>) and Name (<strong>{registeredEmployee.name}</strong>) to the user for login.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={handleRegisterAnother}
                        className="w-full justify-center bg-white/80 hover:bg-white"
                        icon={<RefreshCw className="w-4 h-4 text-indigo-600" />}
                      >
                        Register Another
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        size="lg"
                        onClick={() => {
                          setActiveTab('directory');
                          setRegisteredEmployee(null);
                        }}
                        className="w-full justify-center"
                        icon={<Users className="w-4 h-4" />}
                      >
                        View in Directory
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: DIRECTORY */}
            {activeTab === 'directory' && (
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search member by name, ID or role..."
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm bg-white/80 backdrop-blur-md border border-white/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  {nextEmployeeId && (
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-100 text-xs font-medium text-slate-600 flex-shrink-0">
                      <span>Next:</span>
                      <span className="font-mono font-bold text-indigo-700">{nextEmployeeId}</span>
                    </div>
                  )}
                </div>

                {/* List of Members */}
                <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                  {isLoadingUsers ? (
                    <div className="p-8 text-center text-xs text-slate-500">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-600" />
                      Loading directory...
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 bg-white/60 rounded-xl border border-white/80">
                      No members matched your search.
                    </div>
                  ) : (
                    filteredUsers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/70 hover:bg-white/90 backdrop-blur-md border border-white/80 shadow-2xs transition-all"
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

                        {/* ID & Copy */}
                        <div className="flex items-center gap-1.5 flex-shrink-0 pl-2">
                          <span className="font-mono text-xs sm:text-sm font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                            {member.employeeId}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyId(member.employeeId)}
                            className="p-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
                            title="Copy Employee ID"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Bottom Bar */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-200/60">
                  <span className="text-xs text-slate-600">
                    Total Members: <strong className="text-slate-900">{usersList.length}</strong>
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
                    Register New Member
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
