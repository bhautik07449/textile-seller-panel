import React from 'react';
import { Button, ButtonProps } from '../ui/button';
import CustomLoader from './custom_loader';
import { cn } from '../../lib/utils';

export interface CommonButtonProps extends ButtonProps {
  isLoading?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

const CommonButton: React.FC<CommonButtonProps> = ({
  children,
  isLoading = false,
  variant = 'default',
  size = 'default',
  className,
  disabled,
  icon: Icon,
  ...props
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn('relative', className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <CustomLoader size={18} />
        </div>
      )}
      <span className={cn(isLoading && 'opacity-0 flex items-center gap-2', !isLoading && 'flex items-center gap-2')}>
        {Icon && <Icon className="w-4 h-4 stroke-[2.2] shrink-0" />}
        {children}
      </span>
    </Button>
  );
};

export default CommonButton;
