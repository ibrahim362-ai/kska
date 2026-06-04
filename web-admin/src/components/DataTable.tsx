import { useState, useMemo, ReactNode } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from './Skeleton';
import EmptyState from './EmptyState';

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  loading?: boolean;
  searchPlaceholder?: string;
  searchKey?: keyof T;
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  getRowId?: (row: T) => string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  searchPlaceholder = 'Search...',
  searchKey,
  pageSize = 20,
  emptyTitle = 'No data found',
  emptyDescription = 'There are no items to display.',
  emptyAction,
  onRowClick,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  getRowId,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  // Add selection column if needed
  const tableColumns = useMemo<ColumnDef<T, any>[]>(() => {
    if (!selectable) return columns;
    const selectionColumn: ColumnDef<T, any> = {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
        />
      ),
      cell: ({ row }) => {
        const id = getRowId ? getRowId(row.original) : row.id;
        return (
          <input
            type="checkbox"
            checked={selectedIds.includes(id)}
            onChange={(e) => {
              if (onSelectionChange) {
                if (e.target.checked) {
                  onSelectionChange([...selectedIds, id]);
                } else {
                  onSelectionChange(selectedIds.filter((sid) => sid !== id));
                }
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
        );
      },
      enableSorting: false,
    };
    return [selectionColumn, ...columns];
  }, [columns, selectable, selectedIds, onSelectionChange, getRowId]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Toolbar */}
      {(searchKey || onSelectionChange) && (
        <div className="p-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
          {searchKey && (
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
          )}
          {selectable && selectedIds.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-semibold">
                {selectedIds.length} selected
              </span>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    {header.isPlaceholder ? null : (
                      <button
                        onClick={header.column.getToggleSortingHandler()}
                        className={`flex items-center gap-1 ${header.column.getCanSort() ? 'cursor-pointer hover:text-gray-900' : 'cursor-default'}`}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          { asc: <ChevronUp size={14} />, desc: <ChevronDown size={14} /> }[header.column.getIsSorted() as string] ?? (
                            <ChevronsUpDown size={14} className="text-gray-400" />
                          )
                        )}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={tableColumns.length} className="p-0">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                  />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  className={`border-t border-gray-100 transition-colors ${onRowClick ? 'cursor-pointer hover:bg-indigo-50/30' : 'hover:bg-gray-50'}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 text-sm text-gray-700">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
          <span className="text-sm text-gray-600">
            Showing <span className="font-semibold">{table.getState().pagination.pageIndex * pageSize + 1}</span>-
            <span className="font-semibold">
              {Math.min((table.getState().pagination.pageIndex + 1) * pageSize, table.getFilteredRowModel().rows.length)}
            </span>{' '}
            of <span className="font-semibold">{table.getFilteredRowModel().rows.length}</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 text-sm text-gray-700">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
