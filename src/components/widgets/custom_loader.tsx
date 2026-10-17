import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CustomLoaderProps {
  size?: number;
  className?: string;
}

const CustomLoader: React.FC<CustomLoaderProps> = ({ size = 20, className }) => {
  return (
    <Loader2
      size={size}
      className={cn('animate-spin text-current', className)}
    />
  );
};

export default CustomLoader;
