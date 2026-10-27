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
          <label htmlFor={inputId} className="block text-xs font-medium text-slate-300">
            {label}
          </label>
        )}

        <div className="relative rounded-xl">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={`w-full bg-slate-900 border rounded-xl py-2.5 text-sm text-slate-100 placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-1 ${
              icon ? 'pl-10 pr-4' : 'px-4'
            } ${
              error
                ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30 bg-rose-950/10'
                : 'border-slate-700/80 focus:border-indigo-500 focus:ring-indigo-500/30 hover:border-slate-600'
            } ${className}`}
            {...props}
          />
        </div>

        {error && (
          <p className="flex items-center gap-1 text-[11px] text-rose-400 mt-1 font-medium animate-fadeIn">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            <span>{error}</span>
          </p>
        )}

        {!error && helperText && (
          <p className="text-[11px] text-slate-400 mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

InputField.displayName = 'InputField';
