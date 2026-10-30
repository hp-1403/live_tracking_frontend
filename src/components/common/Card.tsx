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
      className={`rounded-2xl transition-all duration-300 bg-white shadow-sm border ${
        glow ? 'border-indigo-400 shadow-md shadow-indigo-100' : 'border-slate-200/90'
      } ${className}`}
      {...props}
    >
      {header && (
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
          {header}
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="px-6 py-4 border-t border-slate-200/80 bg-slate-50/80 rounded-b-2xl">
          {footer}
        </div>
      )}
    </div>
  );
};
