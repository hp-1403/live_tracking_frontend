import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  glow = false,
  header,
  footer,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`min-w-0 rounded-2xl transition-all duration-300 bg-white border ${
        glow ? 'border-indigo-400/90 shadow-glow-indigo ring-1 ring-indigo-400/20' : 'border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-slate-300'
      } ${className}`}
      {...props}
    >
      {header && (
        <div className="px-4 sm:px-6 2xl:px-8 py-3 sm:py-4 2xl:py-5 border-b border-slate-200/80 flex items-center justify-between">
          {header}
        </div>
      )}
      <div className="p-4 sm:p-6 2xl:p-8">{children}</div>
      {footer && (
        <div className="px-4 sm:px-6 2xl:px-8 py-3 sm:py-4 2xl:py-5 border-t border-slate-200/80 bg-slate-50/80 rounded-b-2xl">
          {footer}
        </div>
      )}
    </div>
  );
};
