import React from 'react';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import CommonButton from './common_button';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface CommonDialogProps {
  open?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'danger' | 'warning' | 'info';
  children?: React.ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  isConfirmDisabled?: boolean;
  showFooter?: boolean;
  footer?: React.ReactNode;
  confirmVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  confirmClassName?: string;
  maxWidth?: string;
  showCloseButton?: boolean;
}

const CommonDialog: React.FC<CommonDialogProps> = ({
  open,
  isOpen,
  onOpenChange,
  onClose,
  title,
  description,
  icon,
  variant = 'default',
  children,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  isConfirmDisabled = false,
  showFooter = true,
  footer,
  confirmVariant = 'default',
  confirmClassName,
  maxWidth = 'max-w-lg',
  showCloseButton = true,
}) => {
  const isDialogOpen = open !== undefined ? open : Boolean(isOpen);
  const handleOpenChange = (val: boolean) => {
    if (onOpenChange) onOpenChange(val);
    if (!val && onClose) onClose();
  };

  const isDestructive = variant === 'destructive' || variant === 'danger';
  const isWarning = variant === 'warning';
  const isInfo = variant === 'info';

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={handleOpenChange}
      showCloseButton={showCloseButton}
      maxWidth={maxWidth}
    >
      {(icon || isDestructive || isWarning || isInfo) && (
        <div
          className={cn(
            'w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 mb-3 border shadow-2xs',
            isDestructive
              ? 'bg-rose-50 border-rose-200/80 text-rose-600'
              : isWarning
              ? 'bg-amber-50 border-amber-200/80 text-amber-600'
              : 'bg-blue-50 border-blue-200/80 text-blue-600',
          )}
        >
          {icon ? (
            icon
          ) : isDestructive ? (
            <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
          ) : isWarning ? (
            <AlertCircle className="w-5 h-5 stroke-[2.2]" />
          ) : (
            <Info className="w-5 h-5 stroke-[2.2]" />
          )}
        </div>
      )}

      {title && (
        <DialogHeader className="shrink-0 mb-3">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
      )}

      <div className="py-1 overflow-y-auto flex-1 min-h-0 pr-0.5">{children}</div>

      {showFooter && (
        <div className="-mx-5 -mb-5 sm:-mx-6 sm:-mb-6 mt-6 px-5 py-3.5 sm:px-6 sm:py-4 bg-slate-50/90 border-t border-slate-200/80 rounded-b-2xl sm:rounded-b-3xl flex items-center justify-end gap-2.5 shrink-0">
          {footer ? (
            footer
          ) : (
            <>
              <CommonButton
                variant="outline"
                size="sm"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-white border-slate-300/80 shadow-2xs cursor-pointer"
              >
                {cancelText}
              </CommonButton>
              {onConfirm && (
                <CommonButton
                  variant={isDestructive ? 'destructive' : confirmVariant}
                  size="sm"
                  className={cn(
                    'rounded-xl px-4.5 py-2 text-xs font-bold shadow-xs cursor-pointer',
                    isDestructive && 'bg-rose-600 hover:bg-rose-700 text-white',
                    confirmClassName,
                  )}
                  onClick={onConfirm}
                  isLoading={isLoading}
                  disabled={isConfirmDisabled}
                >
                  {confirmText}
                </CommonButton>
              )}
            </>
          )}
        </div>
      )}
    </Dialog>
  );
};

export default CommonDialog;
