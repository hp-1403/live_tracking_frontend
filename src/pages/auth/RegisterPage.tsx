import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { InputField } from '../../components/common/InputField';
import { registerSchema, RegisterFormData } from '../../schemas/authSchemas';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  UserCheck,
  Hash,
  Sparkles,
  ArrowLeft,
  Copy,
  Check,
  User,
  Shield,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
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
    } catch (err: any) {
      setServerError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyId = () => {
    if (registeredEmployee?.employeeId) {
      navigator.clipboard.writeText(registeredEmployee.employeeId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden bg-slate-100">
      {/* 1. Office Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center filter brightness-105 contrast-95 transform scale-105"
        style={{ backgroundImage: `url('/assets/office-bg.jpg')` }}
      />

      {/* 2. Light Theme Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/92 via-white/85 to-white/78 backdrop-blur-[6px]" />

      {/* 3. Subtle ambient light accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-200/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-600 shadow-md shadow-emerald-600/30 mb-3 text-white">
            <Activity className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Live Employee Tracker
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create your account to start tracking shifts &amp; activities
          </p>
        </div>

        {/* Main Auth Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/90 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600" />
          {!registeredEmployee ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900">Create New Account</h2>
                <Link
                  to="/login"
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                </Link>
              </div>

              {serverError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {serverError}
                </div>
              )}

              {/* REGISTRATION FORM */}
              <form onSubmit={handleRegisterSubmit(onRegisterSubmit)} className="space-y-4" noValidate>
                {/* Role Selector: Employee OR Admin */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Register As
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegisterValue('role', 'employee')}
                      className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                        selectedRole === 'employee'
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm ring-1 ring-indigo-500/40'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <User className="w-3.5 h-3.5 text-indigo-600" /> Employee
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegisterValue('role', 'manager')}
                      className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                        selectedRole === 'manager' || selectedRole === 'admin'
                          ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-sm ring-1 ring-purple-500/40'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5 text-purple-600" /> Admin
                    </button>
                  </div>
                  {registerErrors.role && (
                    <p className="text-[11px] text-rose-600 mt-1">{registerErrors.role.message}</p>
                  )}
                </div>

                {/* Name */}
                <InputField
                  label={selectedRole === 'manager' || selectedRole === 'admin' ? 'Admin Full Name' : 'Employee Full Name'}
                  type="text"
                  placeholder="Enter full name"
                  icon={<UserCheck className="w-4 h-4" />}
                  error={registerErrors.fullName?.message}
                  {...registerForm('fullName')}
                />

                {/* Auto-generated ID indicator */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    ID Assigned by System
                  </label>
                  <div className="relative rounded-xl">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Hash className="w-4 h-4 text-indigo-600" />
                    </div>
                    <input
                      type="text"
                      disabled
                      value="Auto-generated on registration (e.g. EMP0001)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-mono text-indigo-700 cursor-not-allowed select-none"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                    <Sparkles className="w-3 h-3 text-indigo-600 inline" />
                    Unique sequence ID automatically generated and assigned.
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  className="w-full mt-4"
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  {selectedRole === 'manager' || selectedRole === 'admin' ? 'Register as Admin' : 'Register as Employee'}
                </Button>
              </form>

              {/* Footer Return Link */}
              <p className="text-center text-xs text-slate-600 mt-6">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </>
          ) : (
            /* REGISTRATION SUCCESS VIEW */
            <div className="space-y-6 text-center animate-fadeIn">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">Registration Successful!</h2>
                <p className="text-xs text-slate-500">
                  Welcome aboard, <strong className="text-slate-800">{registeredEmployee.name}</strong>.
                  Your account is registered as{' '}
                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    registeredEmployee.role === 'manager'
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  }`}>
                    {registeredEmployee.role === 'manager' ? (
                      <><Shield className="w-3 h-3 text-purple-600" /> Admin</>
                    ) : (
                      <><User className="w-3 h-3 text-indigo-600" /> Employee</>
                    )}
                  </span>.
                </p>
              </div>

              {/* Highlighted Employee ID Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Your Assigned ID
                </div>
                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                  <span className="text-xl font-mono font-bold text-indigo-600 tracking-wider">
                    {registeredEmployee.employeeId}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="p-1.5 rounded-lg bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 transition-colors flex items-center gap-1 text-xs font-medium"
                    title="Copy ID"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 text-[11px]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                  ⚠️ <strong>Important:</strong> Please write down or save your ID (<strong>{registeredEmployee.employeeId}</strong>). You will need both your ID and Full Name to log in.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/login')}
                  className="w-full"
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Proceed to Login
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
