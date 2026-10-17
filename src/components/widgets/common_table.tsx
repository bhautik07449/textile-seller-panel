import React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../ui/table';
import CustomLoader from './custom_loader';

export interface Column<T = any> {
  header: string;
  accessor?: keyof T | string;
  render?: (row: T, index: number) => React.ReactNode;
  className?: string;
}

interface CommonTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export const CommonTable = <T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No records found.',
}: CommonTableProps<T>) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col, idx) => (
              <TableHead key={idx} className={col.className}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-32 text-center text-gray-500"
              >
                <div className="flex flex-col items-center justify-center space-y-2">
                  <CustomLoader size={24} className="text-indigo-600" />
                  <span className="text-xs">Loading records...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-28 text-center text-gray-500 text-sm"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIdx) => (
              <TableRow key={rowIdx}>
                {columns.map((col, colIdx) => (
                  <TableCell key={colIdx} className={col.className}>
                    {col.render
                      ? col.render(row, rowIdx)
                      : col.accessor
                      ? row[col.accessor]
                      : null}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
