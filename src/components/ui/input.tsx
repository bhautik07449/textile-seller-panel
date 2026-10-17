import * as React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-800 font-medium placeholder:text-slate-400 shadow-2xs transition-all focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200',
          error && 'border-rose-500 focus:border-rose-600 focus:ring-rose-500/20',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
