import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors border',
  {
    variants: {
      variant: {
        default: 'bg-blue-50 text-blue-700 border-blue-200/80',
        secondary: 'bg-slate-100 text-slate-700 border-slate-200',
        destructive: 'bg-rose-50 text-rose-700 border-rose-200/80',
        success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        warning: 'bg-amber-50 text-amber-700 border-amber-200/80',
        outline: 'text-slate-700 border-slate-200 bg-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
