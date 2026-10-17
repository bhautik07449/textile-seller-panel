import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  ColDef,
  GridReadyEvent,
  GridApi,
} from 'ag-grid-community';
import './ag_grid_setup';
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  ArrowLeftRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';

export interface AgGridCustomTableProps<T = any> {
  rowData: T[];
  columnDefs: ColDef<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  searchPlaceholder?: string;
  enableSearch?: boolean;
  headerTitle?: string;
  headerSubtitle?: string;
  extraHeaderActions?: React.ReactNode;
  rowHeight?: number;
  height?: string | number;
  autoHeight?: boolean;
  onGridReady?: (params: GridReadyEvent<T>) => void;
  onRowClick?: (row: T) => void;
  enableHorizontalScroll?: boolean;
}

export const AgGridCustomTable = <T extends Record<string, any>>({
  rowData,
  columnDefs,
  isLoading = false,
  emptyMessage = 'No records found matching criteria',
  defaultPageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  searchPlaceholder = 'Search records...',
  enableSearch = true,
  headerTitle,
  headerSubtitle,
  extraHeaderActions,
  rowHeight = 54,
  height = '520px',
  autoHeight = false,
  onGridReady,
  onRowClick,
  enableHorizontalScroll = true,
}: AgGridCustomTableProps<T>) => {
  const gridRef = useRef<AgGridReact<T>>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [gridApi, setGridApi] = useState<GridApi<T> | null>(null);
  const [quickFilterText, setQuickFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [totalRecords, setTotalRecords] = useState(0);
  const [displayedRecords, setDisplayedRecords] = useState(0);
  const [isFitToWidth, setIsFitToWidth] = useState(false);

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      suppressMovable: false,
      minWidth: 120,
    }),
    [],
  );

  const handleGridReady = useCallback(
    (params: GridReadyEvent<T>) => {
      setGridApi(params.api);
      params.api.setGridOption('paginationPageSize', pageSize);
      if (onGridReady) {
        onGridReady(params);
      }
      if (!enableHorizontalScroll) {
        setTimeout(() => {
          params.api.sizeColumnsToFit();
        }, 100);
      }
    },
    [pageSize, onGridReady, enableHorizontalScroll],
  );

  const handleHorizontalScroll = (delta: number) => {
    if (!containerRef.current) return;
    const viewport =
      containerRef.current.querySelector('.ag-body-horizontal-scroll-viewport') ||
      containerRef.current.querySelector('.ag-center-cols-viewport') ||
      containerRef.current.querySelector('.ag-body-viewport');
    if (viewport) {
      viewport.scrollBy({ left: delta, behavior: 'smooth' });
    }
  };

  const toggleFitColumns = () => {
    if (!gridApi) return;
    if (!isFitToWidth) {
      gridApi.sizeColumnsToFit();
      setIsFitToWidth(true);
    } else {
      gridApi.resetColumnState();
      setIsFitToWidth(false);
    }
  };

  const updatePaginationState = useCallback(() => {
    if (!gridApi) return;
    const current = gridApi.paginationGetCurrentPage() + 1;
    const total = gridApi.paginationGetTotalPages() || 1;
    const rowCount = gridApi.paginationGetRowCount();
    setCurrentPage(current);
    setTotalPages(total);
    setDisplayedRecords(rowCount);
  }, [gridApi]);

  useEffect(() => {
    if (gridApi) {
      gridApi.setGridOption('quickFilterText', quickFilterText);
      updatePaginationState();
    }
  }, [quickFilterText, gridApi, updatePaginationState]);

  useEffect(() => {
    setTotalRecords(rowData ? rowData.length : 0);
    if (gridApi) {
      updatePaginationState();
    }
  }, [rowData, gridApi, updatePaginationState]);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    if (gridApi) {
      gridApi.setGridOption('paginationPageSize', newSize);
      gridApi.paginationGoToPage(0);
      updatePaginationState();
    }
  };

  const handleGoToPage = (targetPage: number) => {
    if (!gridApi || targetPage < 1 || targetPage > totalPages) return;
    gridApi.paginationGoToPage(targetPage - 1);
    setCurrentPage(targetPage);
  };

  const startIdx = displayedRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, displayedRecords);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs flex flex-col">
      {/* Header & Filter Toolbar */}
      {(headerTitle || enableSearch || extraHeaderActions) && (
        <div className="px-5 py-4 border-b border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          {headerTitle && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">{headerTitle}</h3>
              {headerSubtitle && <p className="text-xs text-slate-500 mt-0.5">{headerSubtitle}</p>}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2.5 ml-auto w-full sm:w-auto">
            {enableSearch && (
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={quickFilterText}
                  onChange={(e) => setQuickFilterText(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200/90 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-slate-900 placeholder:text-slate-400 transition"
                />
                {quickFilterText && (
                  <button
                    onClick={() => setQuickFilterText('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    title="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {/* Horizontal Scroll Controls */}
            {enableHorizontalScroll && (
              <div className="flex items-center gap-1.5">
                <div className="flex items-center bg-slate-50 border border-slate-200/90 rounded-xl p-0.5 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => handleHorizontalScroll(-260)}
                    className="px-2 py-1.5 rounded-lg hover:bg-white hover:text-blue-600 text-slate-600 transition active:scale-95 flex items-center gap-1 text-[11px] font-bold"
                    title="Scroll left to view previous columns"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Left</span>
                  </button>
                  <div className="h-4 w-px bg-slate-200" />
                  <button
                    type="button"
                    onClick={() => handleHorizontalScroll(260)}
                    className="px-2 py-1.5 rounded-lg hover:bg-white hover:text-blue-600 text-slate-600 transition active:scale-95 flex items-center gap-1 text-[11px] font-bold"
                    title="Scroll right to view more columns"
                  >
                    <span className="hidden sm:inline">Right</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={toggleFitColumns}
                  className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition flex items-center gap-1 shadow-2xs active:scale-95 ${
                    isFitToWidth
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-white text-slate-600 border-slate-200/90 hover:bg-slate-50'
                  }`}
                  title={isFitToWidth ? 'Restore full scrollable column widths' : 'Fit all columns to current window width'}
                >
                  {isFitToWidth ? (
                    <>
                      <Minimize2 className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Scroll Mode</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Fit Width</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {extraHeaderActions}
          </div>
        </div>
      )}

      {/* Grid Container */}
      <div
        ref={containerRef}
        className="ag-theme-quartz custom-ag-grid w-full relative"
        style={{ height: autoHeight ? 'auto' : height }}
      >
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-[1px] flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            <span className="text-xs font-semibold text-slate-600">Loading data...</span>
          </div>
        )}

        <AgGridReact<T>
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={pageSize}
          suppressPaginationPanel={true}
          alwaysShowHorizontalScroll={enableHorizontalScroll}
          suppressHorizontalScroll={!enableHorizontalScroll}
          rowHeight={rowHeight}
          headerHeight={44}
          animateRows={true}
          enableCellTextSelection={true}
          domLayout={autoHeight ? 'autoHeight' : 'normal'}
          onGridReady={handleGridReady}
          onPaginationChanged={updatePaginationState}
          onFilterChanged={updatePaginationState}
          onRowClicked={(event) => {
            if (onRowClick && event.data) {
              onRowClick(event.data);
            }
          }}
          overlayNoRowsTemplate={`
            <div class="flex flex-col items-center justify-center py-12 text-slate-400 space-y-2 select-none">
              <svg class="w-10 h-10 text-slate-300 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
              <div class="text-xs font-bold text-slate-600">${emptyMessage}</div>
            </div>
          `}
        />
      </div>

      {/* Pagination Bar */}
      <div className="px-5 py-3 border-t border-slate-200/90 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 select-none">
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
          <span className="text-slate-500">
            Showing <strong className="font-semibold text-slate-900">{startIdx}</strong> to{' '}
            <strong className="font-semibold text-slate-900">{endIdx}</strong> of{' '}
            <strong className="font-semibold text-slate-900">{displayedRecords}</strong> entries
            {quickFilterText && displayedRecords !== totalRecords && (
              <span className="text-slate-400 ml-1"> (filtered from {totalRecords})</span>
            )}
          </span>

          {enableHorizontalScroll && (
            <span className="hidden xl:flex items-center gap-1 text-[11px] text-slate-400 font-medium">
              <ArrowLeftRight className="w-3.5 h-3.5 text-blue-500" />
              <span>Shift + Scroll to navigate columns</span>
            </span>
          )}

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px] hidden md:inline">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="py-1 px-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 font-medium cursor-pointer focus:ring-1 focus:ring-blue-500"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / page
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => handleGoToPage(1)}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-600 transition"
            title="First Page"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => handleGoToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-600 transition flex items-center gap-1"
            title="Previous Page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-1 mx-1">
            {pageNumbers.map((p) => {
              const isActive = p === currentPage;
              return (
                <button
                  key={p}
                  onClick={() => handleGoToPage(p)}
                  className={`min-w-[28px] h-7 px-2 text-xs font-semibold rounded-lg transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handleGoToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-600 transition flex items-center gap-1"
            title="Next Page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => handleGoToPage(totalPages)}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-600 transition"
            title="Last Page"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgGridCustomTable;
