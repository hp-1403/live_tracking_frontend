import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, icon, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700">
            {label}
          </label>
        )}

        <div className="relative rounded-xl">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10 text-slate-600">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={`w-full bg-white border rounded-xl py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 ${
              icon ? 'pl-11 pr-4' : 'px-4'
            } ${
              error
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/30'
                : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-600/20 hover:border-slate-400'
            } ${className}`}
            {...props}
          />
        </div>

        {error && (
          <p className="flex items-center gap-1 text-[11px] text-rose-600 mt-1 font-medium animate-fadeIn">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{error}</span>
          </p>
        )}

        {!error && helperText && (
          <p className="text-[11px] text-slate-500 mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

InputField.displayName = 'InputField';
