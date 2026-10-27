import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { InputField } from '../../components/common/InputField';
import {
  loginSchema,
  registerSchema,
  LoginFormData,
  RegisterFormData,
} from '../../schemas/authSchemas';
import {
  Activity,
  Shield,
  User,
  ArrowRight,
  CheckCircle2,
  Mail,
  Lock,
  UserCheck,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, register } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 1. React Hook Form for Login
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    setValue: setLoginValue,
    reset: resetLoginForm,
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // 2. React Hook Form for Registration
  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
    setValue: setRegisterValue,
    watch: watchRegister,
    reset: resetRegisterForm,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      role: 'employee',
    },
  });

  const selectedRole = watchRegister('role');

  // Submit Handlers
  const onLoginSubmit = async (data: LoginFormData) => {
    setServerError(null);
    setIsLoading(true);
    try {
      await login(data);
    } catch (err: any) {
      setServerError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    setIsLoading(true);
    try {
      await register({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        role: data.role as 'employee' | 'manager',
      });
    } catch (err: any) {
      setServerError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick One-Click Demo Logins
  const handleQuickDemoLogin = async (demoRole: 'manager' | 'employee') => {
    setServerError(null);
    setIsLoading(true);
    const credentials =
      demoRole === 'manager'
        ? { email: 'manager@company.com', password: 'password123' }
        : { email: 'sarah@company.com', password: 'password123' };

    setLoginValue('email', credentials.email);
    setLoginValue('password', credentials.password);

    try {
      await login(credentials);
    } catch (err: any) {
      setServerError(err.message || 'Quick login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabSwitch = (registerMode: boolean) => {
    setIsRegisterMode(registerMode);
    setServerError(null);
    if (registerMode) {
      resetLoginForm();
    } else {
      resetRegisterForm();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 relative overflow-hidden">
      {/* Background glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 shadow-xl shadow-indigo-600/30 mb-4">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Live Employee Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time activity, live screen sharing & webcam monitoring portal
          </p>
        </div>

        {/* Quick Demo Login Box */}
        <div className="mb-6 p-4 rounded-2xl glass-panel-glow border border-indigo-500/30 text-xs">
          <div className="font-semibold text-indigo-300 flex items-center gap-1.5 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> One-Click Demo Access
          </div>
          <p className="text-slate-400 mb-3 text-[11px]">
            Test instantly without typing credentials:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickDemoLogin('employee')}
              isLoading={isLoading}
              icon={<User className="w-3.5 h-3.5 text-indigo-400" />}
              className="text-xs justify-center"
            >
              Demo Employee
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickDemoLogin('manager')}
              isLoading={isLoading}
              icon={<Shield className="w-3.5 h-3.5 text-purple-400" />}
              className="text-xs justify-center"
            >
              Demo Manager
            </Button>
          </div>
        </div>

        {/* Main Auth Card */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-800">
          {/* Switch tabs */}
          <div className="flex rounded-xl bg-slate-900/80 p-1 mb-6 border border-slate-800">
            <button
              type="button"
              onClick={() => handleTabSwitch(false)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                !isRegisterMode
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch(true)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                isRegisterMode
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register New Account
            </button>
          </div>

          {serverError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {serverError}
            </div>
          )}

          {/* 1. SIGN IN FORM (React Hook Form + Yup) */}
          {!isRegisterMode && (
            <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-4" noValidate>
              <InputField
                label="Email Address"
                type="email"
                placeholder="name@company.com"
                icon={<Mail className="w-4 h-4" />}
                error={loginErrors.email?.message}
                {...registerLogin('email')}
              />

              <InputField
                label="Password"
                type="password"
                placeholder="••••••••"
                icon={<Lock className="w-4 h-4" />}
                error={loginErrors.password?.message}
                {...registerLogin('password')}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full mt-2"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In
              </Button>
            </form>
          )}

          {/* 2. REGISTER FORM (React Hook Form + Yup) */}
          {isRegisterMode && (
            <form onSubmit={handleRegisterSubmit(onRegisterSubmit)} className="space-y-4" noValidate>
              <InputField
                label="Full Name"
                type="text"
                placeholder="Sarah Chen"
                icon={<UserCheck className="w-4 h-4" />}
                error={registerErrors.fullName?.message}
                {...registerRegister('fullName')}
              />

              {/* Role Selector with Form Binding */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Account Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegisterValue('role', 'employee')}
                    className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                      selectedRole === 'employee'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" /> Employee
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegisterValue('role', 'manager')}
                    className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                      selectedRole === 'manager'
                        ? 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" /> Manager
                  </button>
                </div>
                {registerErrors.role && (
                  <p className="text-[11px] text-rose-400 mt-1">{registerErrors.role.message}</p>
                )}
              </div>

              <InputField
                label="Email Address"
                type="email"
                placeholder="name@company.com"
                icon={<Mail className="w-4 h-4" />}
                error={registerErrors.email?.message}
                {...registerRegister('email')}
              />

              <InputField
                label="Password"
                type="password"
                placeholder="At least 6 characters"
                icon={<Lock className="w-4 h-4" />}
                error={registerErrors.password?.message}
                {...registerRegister('password')}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full mt-2"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Create Account
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
