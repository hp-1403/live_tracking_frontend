import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { InputField } from '../../components/common/InputField';
import { loginSchema, LoginFormData } from '../../schemas/authSchemas';
import {
  ShieldCheck,
  User,
  Shield,
  ArrowRight,
  Hash,
  UserCheck,
  CalendarCheck,
  Users,
  Lock,
  Sparkles,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // React Hook Form for Login
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    setValue: setLoginValue,
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      employeeId: '',
      name: '',
    },
  });

  // Submit Handler
  const onLoginSubmit = async (data: LoginFormData) => {
    setServerError(null);
    setIsLoading(true);
    try {
      await login({
        employeeId: data.employeeId,
        name: data.name,
      });
    } catch (err: any) {
      setServerError(err.message || 'Login failed. Please verify your credentials.');
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
        ? { employeeId: 'EMP0001', name: 'Alex Rivera' }
        : { employeeId: 'EMP0002', name: 'Sarah Chen' };

    setLoginValue('employeeId', credentials.employeeId);
    setLoginValue('name', credentials.name);

    try {
      await login(credentials);
    } catch (err: any) {
      setServerError(err.message || 'Quick login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-12 overflow-hidden bg-slate-100">
      {/* 1. High-Resolution Pristine Clean Modern Office Background */}
      <div
        className="absolute inset-0 bg-cover bg-center filter brightness-105 contrast-95 scale-100"
        style={{ backgroundImage: `url('/assets/clean-office-bg.jpg')` }}
      />

      {/* 2. Soft Luminous Light-Theme Overlay (Translucent Daylight Wash) */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/75 via-white/60 to-white/65 backdrop-blur-[3px]" />

      {/* 3. Ambient Light Accents */}
      <div className="absolute top-1/4 left-1/5 w-96 h-96 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/5 w-96 h-96 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />

      {/* 4. Main Two-Column Container */}
      <div className="w-full max-w-6xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
        {/* Left Column: Branding, Elegant Hero Typography & Feature Showcase */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8 pr-0 lg:pr-4">
          {/* Brand Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/70 backdrop-blur-xl border border-white/80 shadow-sm text-slate-800">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs sm:text-sm font-bold tracking-tight text-slate-800">
              Live Tracker Management
            </span>
          </div>

          {/* Hero Headline with Clean, Bold Typography */}
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.08] drop-shadow-xs">
              Seamless
              <span className="block bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent font-black">
                Employee
              </span>
              Management
              <span className="block text-slate-800">Solution</span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-700 max-w-lg leading-relaxed font-medium">
            Streamline your workforce operations with our high-fidelity dashboard.
            Manage attendance, records, and performance in one secure place.
          </p>

          {/* Features Pills with Frosted Glass Look */}
          <div className="space-y-3 pt-2 max-w-md">
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/60 hover:bg-white/75 backdrop-blur-xl border border-white/80 shadow-xs transition-all duration-200">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-800 flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Employee Records</h4>
                <p className="text-[11px] text-slate-600 font-medium">Automated sequential ID generation &amp; database storage</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/60 hover:bg-white/75 backdrop-blur-xl border border-white/80 shadow-xs transition-all duration-200">
              <div className="w-9 h-9 rounded-xl bg-teal-500/15 text-teal-800 flex items-center justify-center flex-shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Secure Access</h4>
                <p className="text-[11px] text-slate-600 font-medium">Employee ID + authoritative name authentication</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/60 hover:bg-white/75 backdrop-blur-xl border border-white/80 shadow-xs transition-all duration-200">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-800 flex items-center justify-center flex-shrink-0">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Real-time Attendance</h4>
                <p className="text-[11px] text-slate-600 font-medium">Shift auto-clock on login &amp; complete audit trail</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Transparent Frosted Glass Login Card */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto lg:max-w-none">
          <div className="bg-white/45 backdrop-blur-2xl rounded-3xl p-7 sm:p-9 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] border border-white/70 relative overflow-hidden">
            {/* Top decorative gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

            {/* Card Header */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                Enter your credentials to access the system
              </p>
            </div>

            {/* Quick Demo Access Buttons in Translucent Glass */}


            {/* Error Message */}
            {serverError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50/90 backdrop-blur-sm border border-rose-200 text-rose-800 text-xs font-medium">
                {serverError}
              </div>
            )}

            {/* SIGN IN FORM */}
            <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-4" noValidate>
              <InputField
                label="Employee ID"
                type="text"
                placeholder="Enter your employee ID (e.g. EMP0001)"
                icon={<Hash className="w-5 h-5 text-emerald-600 stroke-[2.2]" />}
                className="bg-white/80 backdrop-blur-md border-white/90 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500/20 shadow-xs text-slate-900 font-medium"
                error={loginErrors.employeeId?.message}
                {...registerLogin('employeeId')}
              />

              <InputField
                label="Employee Name"
                type="text"
                placeholder="Enter your full name"
                icon={<UserCheck className="w-5 h-5 text-emerald-600 stroke-[2.2]" />}
                className="bg-white/80 backdrop-blur-md border-white/90 focus:bg-white focus:border-emerald-500 focus:ring-emerald-500/20 shadow-xs text-slate-900 font-medium"
                error={loginErrors.name?.message}
                {...registerLogin('name')}
              />

              {/* Action Button styled as the vibrant emerald button from image */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Login to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Registration Navigation Link */}
            <p className="text-center text-xs text-slate-700 mt-5 pt-4 border-t border-slate-200/60 font-medium">
              Didn't have an account?{' '}
              <Link
                to="/register"
                className="text-emerald-800 hover:text-emerald-900 font-bold transition-colors underline decoration-emerald-400 underline-offset-2"
              >
                Register
              </Link>
            </p>

            {/* Micro-footer (from reference image) */}

          </div>
        </div>
      </div>
    </div>
  );
};
