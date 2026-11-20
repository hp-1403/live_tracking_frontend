import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
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
  AlertCircle,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // React Hook Form for Login with Yup Resolver
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
      const loggedInUser = await login({
        employeeId: data.employeeId,
        name: data.name,
      });
      toast.success(`Welcome back, ${data.name}!`);
      if (loggedInUser.role === 'manager') {
        navigate('/manager', { replace: true });
      } else {
        navigate('/employee', { replace: true });
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Login failed. Please verify your credentials.';
      setServerError(errorMsg);
      toast.error(errorMsg, { id: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  // Triggered when client-side Yup validation fails
  const onLoginInvalid = (errors: any) => {
    const firstError = Object.values(errors)[0] as any;
    if (firstError?.message) {
      toast.error(firstError.message, { id: firstError.message });
    }
  };

  return (
    <div className="min-h-screen relative flex items-start lg:items-center justify-center px-3 py-6 sm:p-6 lg:p-10 2xl:p-16 overflow-x-hidden overflow-y-auto bg-slate-100">
      {/* 1. High-Resolution Pristine Clean Modern Office Background */}
      <div
        className="absolute inset-0 bg-cover bg-center filter brightness-105 contrast-95 scale-100"
        style={{ backgroundImage: `url('/assets/clean-office-bg.jpg')` }}
      />

      {/* 2. Soft Luminous Light-Theme Overlay (Translucent Daylight Wash) */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/75 via-white/60 to-white/65 backdrop-blur-[3px]" />

      {/* 3. Ambient Light Accents */}
      <div className="absolute top-1/4 left-1/5 w-72 sm:w-96 2xl:w-[32rem] h-72 sm:h-96 2xl:h-[32rem] bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/5 w-72 sm:w-96 2xl:w-[32rem] h-72 sm:h-96 2xl:h-[32rem] bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />

      {/* 4. Main Two-Column Container */}
      <div className="w-full max-w-5xl 2xl:max-w-7xl min-w-0 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 2xl:gap-16 items-center">
        {/* Left Column: Branding, Elegant Hero Typography & Feature Showcase */}
        <div className="lg:col-span-7 min-w-0 space-y-4 sm:space-y-6 lg:space-y-8 pr-0 lg:pr-4">
          {/* Brand Badge */}
          <div className="inline-flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/80 backdrop-blur-xl border border-white/90 shadow-sm text-slate-800">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
            <span className="text-xs sm:text-sm 2xl:text-base font-bold tracking-tight text-slate-800">
              Live Tracker Management
            </span>
          </div>

          {/* Hero Headline with Clean, Bold Typography */}
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] sm:leading-[1.08] drop-shadow-xs">
              Seamless
              <span className="block bg-gradient-to-r from-indigo-600 via-indigo-500 to-teal-500 bg-clip-text text-transparent font-black">
                Employee
              </span>
              Management
              <span className="block text-slate-800">Solution</span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm lg:text-base 2xl:text-lg text-slate-700 max-w-lg 2xl:max-w-xl leading-relaxed font-medium">
            Streamline your workforce operations with our high-fidelity dashboard.
            Manage attendance, records, and performance in one secure place.
          </p>

          {/* Features Pills with Frosted Glass Look */}
          <div className="space-y-2.5 sm:space-y-3 pt-1 sm:pt-2 max-w-md 2xl:max-w-xl">
            <div className="flex items-center gap-3 sm:gap-3.5 p-2.5 sm:p-3 2xl:p-4 rounded-xl sm:rounded-2xl bg-white/70 hover:bg-white/85 backdrop-blur-xl border border-white/90 shadow-card transition-all duration-200">
              <div className="w-8 h-8 sm:w-9 sm:h-9 2xl:w-10 2xl:h-10 rounded-xl bg-indigo-500/15 text-indigo-700 flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 2xl:w-5 2xl:h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm 2xl:text-base font-bold text-slate-900">Employee Records</h4>
                <p className="text-[10px] sm:text-[11px] 2xl:text-xs text-slate-600 font-medium">Automated sequential ID generation &amp; database storage</p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-3.5 p-2.5 sm:p-3 2xl:p-4 rounded-xl sm:rounded-2xl bg-white/70 hover:bg-white/85 backdrop-blur-xl border border-white/90 shadow-card transition-all duration-200">
              <div className="w-8 h-8 sm:w-9 sm:h-9 2xl:w-10 2xl:h-10 rounded-xl bg-teal-500/15 text-teal-800 flex items-center justify-center flex-shrink-0">
                <Lock className="w-4 h-4 2xl:w-5 2xl:h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm 2xl:text-base font-bold text-slate-900">Secure Access</h4>
                <p className="text-[10px] sm:text-[11px] 2xl:text-xs text-slate-600 font-medium">Employee ID + authoritative name authentication</p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-3.5 p-2.5 sm:p-3 2xl:p-4 rounded-xl sm:rounded-2xl bg-white/70 hover:bg-white/85 backdrop-blur-xl border border-white/90 shadow-card transition-all duration-200">
              <div className="w-8 h-8 sm:w-9 sm:h-9 2xl:w-10 2xl:h-10 rounded-xl bg-emerald-500/15 text-emerald-800 flex items-center justify-center flex-shrink-0">
                <CalendarCheck className="w-4 h-4 2xl:w-5 2xl:h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm 2xl:text-base font-bold text-slate-900">Real-time Attendance</h4>
                <p className="text-[10px] sm:text-[11px] 2xl:text-xs text-slate-600 font-medium">Shift auto-clock on login &amp; complete audit trail</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Transparent Frosted Glass Login Card */}
        <div className="lg:col-span-5 min-w-0 w-full max-w-md mx-auto lg:max-w-none">
          <div className="bg-white/75 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-9 2xl:p-11 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.1)] border border-white/90 relative overflow-hidden">
            {/* Top decorative gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 via-brand-500 to-teal-500" />

            {/* Card Header */}
            <div className="mb-5 sm:mb-6">
              <h2 className="text-xl sm:text-2xl 2xl:text-3xl font-serif font-extrabold text-slate-900 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-xs sm:text-sm 2xl:text-base text-slate-600 font-medium mt-1">
                Enter your credentials to access the system
              </p>
            </div>

            {/* Error Message */}
            {serverError && (
              <div className="mb-4 p-3 sm:p-3.5 rounded-xl bg-rose-50/95 backdrop-blur-sm border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            {/* SIGN IN FORM */}
            <form onSubmit={handleLoginSubmit(onLoginSubmit, onLoginInvalid)} className="space-y-4" noValidate>
              <InputField
                label="Employee ID"
                type="text"
                placeholder="Enter your employee ID (e.g. EMP0001)"
                icon={<Hash className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 stroke-[2.2]" />}
                className="bg-white/90 backdrop-blur-md border-slate-200 focus:bg-white focus:border-indigo-600 focus:ring-indigo-600/20 shadow-xs text-slate-900 font-medium"
                error={loginErrors.employeeId?.message}
                {...registerLogin('employeeId')}
              />

              <InputField
                label="Employee Name"
                type="text"
                placeholder="Enter your full name"
                icon={<UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 stroke-[2.2]" />}
                className="bg-white/90 backdrop-blur-md border-slate-200 focus:bg-white focus:border-indigo-600 focus:ring-indigo-600/20 shadow-xs text-slate-900 font-medium"
                error={loginErrors.name?.message}
                {...registerLogin('name')}
              />

              {/* Action Button styled as the vibrant brand button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 sm:py-3.5 2xl:py-4 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs sm:text-sm 2xl:text-base shadow-lg shadow-indigo-600/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
            <p className="text-center text-xs 2xl:text-sm text-slate-700 mt-5 pt-4 border-t border-slate-200/60 font-medium">
              Didn't have an account? contact your admin{' '}
              {/* <Link
                // to="/register"
                className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors underline decoration-indigo-400 underline-offset-2"
              >
                Register
              </Link> */}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
