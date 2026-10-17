import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Eye, EyeOff, Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Textarea } from '../ui/textarea';

export interface CommonTextFieldProps {
  label?: string;
  placeholder?: string;
  type?: string;
  isPassword?: boolean;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  value?: any;
  error?: string;
  rows?: number;
  name?: string;
  required?: boolean;
  step?: string | number;
  min?: string | number;
  max?: string | number;
  [key: string]: any;
}

export const CommonTextField: React.FC<CommonTextFieldProps> = ({
  label,
  placeholder,
  type = 'text',
  isPassword,
  prefixIcon,
  suffixIcon,
  disabled,
  className,
  onChange,
  value,
  error,
  rows,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const renderIcon = () => {
    if (isPassword) {
      return (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="p-1 hover:bg-gray-100 rounded-full text-gray-500"
        >
          {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
      );
    }
    return suffixIcon;
  };

  const inputElement =
    type === 'textarea' ? (
      <Textarea
        placeholder={placeholder}
        disabled={disabled}
        onChange={onChange}
        value={value}
        error={error}
        rows={rows || 3}
        className={cn(className, prefixIcon && 'pl-10')}
        {...props}
      />
    ) : (
      <div className="relative">
        {prefixIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {prefixIcon}
          </div>
        )}
        <Input
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          placeholder={placeholder}
          disabled={disabled}
          onChange={onChange}
          value={value}
          error={error}
          className={cn(
            className,
            prefixIcon && 'pl-10',
            (isPassword || suffixIcon) && 'pr-10',
          )}
          {...props}
        />
        {(isPassword || suffixIcon) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {renderIcon()}
          </div>
        )}
      </div>
    );

  if (label) {
    return (
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-gray-700">
          {label}
        </Label>
        {inputElement}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {inputElement}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
};

export const CommonSearchField: React.FC<{
  placeholder?: string;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}> = ({ placeholder = 'Search...', value, onChange, className }) => {
  return (
    <CommonTextField
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      prefixIcon={<Search className="h-4 w-4" />}
      className={className}
    />
  );
};

export default CommonTextField;
