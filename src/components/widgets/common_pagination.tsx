import React from 'react';
import CommonButton from './common_button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CommonPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalRecords?: number;
}

export const CommonPagination: React.FC<CommonPaginationProps> = ({
  page,
  totalPages,
  onPageChange,
  totalRecords,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-2 py-4 text-sm text-gray-500">
      <div>
        {totalRecords !== undefined && (
          <span>Total: <strong className="text-gray-900">{totalRecords}</strong> entries</span>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <CommonButton
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Previous
        </CommonButton>
        <span className="text-xs font-medium text-gray-700 px-2">
          Page {page} of {totalPages}
        </span>
        <CommonButton
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next <ChevronRight className="h-4 w-4 ml-1" />
        </CommonButton>
      </div>
    </div>
  );
};
