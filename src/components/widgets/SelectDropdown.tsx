import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface DropdownOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
  badge?: string;
  disabled?: boolean;
}

export interface SelectDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  label?: string;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  prefixIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  error?: string;
}

export function SelectDropdown({
  value,
  onChange,
  options = [],
  label,
  placeholder = 'Select an option',
  className,
  buttonClassName,
  menuClassName,
  disabled = false,
  searchable,
  searchPlaceholder = 'Search options...',
  prefixIcon,
  size = 'md',
  error,
}: SelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Auto-enable search if there are more than 8 options unless explicitly turned off
  const isSearchable = searchable ?? options.length > 8;

  // Filter options based on search query
  const filteredOptions = isSearchable && searchQuery.trim()
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase().trim()),
      )
    : options;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && isSearchable) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, isSearchable]);

  const sizeClasses = {
    sm: 'h-[36px] text-xs px-3 py-1.5 rounded-lg',
    md: 'h-[42px] text-xs sm:text-sm px-3.5 py-2 rounded-xl',
    lg: 'h-[48px] text-sm sm:text-base px-4 py-2.5 rounded-xl',
  };

  return (
    <div className={cn('relative w-full text-left font-sans', className)} ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 select-none">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) setSearchQuery('');
          }
        }}
        className={cn(
          'w-full flex items-center justify-between bg-white border border-slate-300 text-slate-800 font-medium shadow-2xs hover:border-slate-400 transition-all focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 active:scale-[0.99] select-none',
          sizeClasses[size],
          isOpen && 'border-blue-600 ring-2 ring-blue-600/20 shadow-sm',
          disabled && 'opacity-60 cursor-not-allowed bg-slate-50 border-slate-200',
          error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
          buttonClassName,
        )}
      >
        <span className="truncate flex items-center gap-2 mr-2">
          {prefixIcon && <span className="text-slate-400 shrink-0">{prefixIcon}</span>}
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span
            className={cn(
              'truncate font-semibold',
              selectedOption ? 'text-slate-800' : 'text-slate-400 font-normal',
            )}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>

        <ChevronDown
          className={cn(
            'w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 stroke-[2.2]',
            isOpen && 'rotate-180 text-blue-600',
          )}
        />
      </button>

      {error && <p className="text-[11px] text-rose-500 mt-1 font-medium">{error}</p>}

      {/* Custom Option Menu Dropdown */}
      {isOpen && (
        <div
          className={cn(
            'absolute z-[100] mt-1.5 w-full bg-white border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-200/60 min-w-[200px] left-0 transition-all overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100 flex flex-col',
            menuClassName,
          )}
        >
          {/* Optional Search Bar inside Menu */}
          {isSearchable && (
            <div className="p-2 border-b border-slate-100 bg-white sticky top-0 z-10">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 font-medium"
                  onClick={(e) => e.stopPropagation()}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 divide-y divide-transparent">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-slate-400 font-medium select-none">
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => {
                      if (!opt.disabled) {
                        onChange(opt.value);
                        setIsOpen(false);
                        setSearchQuery('');
                      }
                    }}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm transition-all text-left font-medium select-none group',
                      isSelected
                        ? 'bg-blue-50 text-blue-700 font-bold shadow-2xs'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900',
                      opt.disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent',
                    )}
                  >
                    <span className="truncate flex items-center gap-2">
                      {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                      <span className="truncate">{opt.label}</span>
                    </span>

                    <span className="flex items-center gap-1.5 shrink-0 ml-2">
                      {opt.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold group-hover:bg-slate-200 transition">
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && (
                        <Check className="w-4 h-4 text-blue-600 stroke-[2.5] animate-in zoom-in-75 duration-150" />
                      )}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SelectDropdown;
