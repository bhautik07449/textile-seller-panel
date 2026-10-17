import * as React from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  showCloseButton?: boolean;
  className?: string;
  maxWidth?: string;
}

const Dialog: React.FC<DialogProps> = ({
  open,
  onOpenChange,
  children,
  showCloseButton = true,
  className,
  maxWidth = 'max-w-lg',
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-hidden animate-in fade-in duration-150">
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
      />
      <div
        className={cn(
          'relative z-50 w-full max-h-[92vh] flex flex-col rounded-2xl sm:rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-200/90 transition-all overflow-hidden animate-in zoom-in-95 duration-150',
          maxWidth,
          className,
        )}
      >
        {showCloseButton && (
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors z-10 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
};

const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn('flex flex-col space-y-1.5 text-left mb-3.5 pr-8', className)} {...props} />
);

const DialogTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, ...props }) => (
  <h2 className={cn('text-lg font-bold leading-snug tracking-tight text-slate-900', className)} {...props} />
);

const DialogDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className, ...props }) => (
  <p className={cn('text-xs sm:text-[13px] font-medium text-slate-500 leading-relaxed', className)} {...props} />
);

const DialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:items-center sm:space-x-2.5 mt-5', className)} {...props} />
);

export { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter };
