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
      className={`rounded-2xl transition-all duration-300 ${
        glow ? 'glass-panel-glow' : 'glass-panel'
      } ${className}`}
      {...props}
    >
      {header && (
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
          {header}
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="px-6 py-4 border-t border-slate-800/80 bg-slate-900/30 rounded-b-2xl">
          {footer}
        </div>
      )}
    </div>
  );
};
