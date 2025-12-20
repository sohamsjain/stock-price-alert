'use client';

import { Table } from '@tanstack/react-table';
import { X, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTableViewOptions } from './data-table-view-options';
import { DataTableFacetedFilter } from './data-table-faceted-filter';
import { tradeStatuses, tradeSides, timeframes } from '@/config/trades-config';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  onCreateNew: () => void;
  onDeleteSelected: () => void;
  selectedCount: number;
}

export function DataTableToolbar<TData>({
  table,
  onCreateNew,
  onDeleteSelected,
  selectedCount,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 flex-wrap items-center space-x-2">
        <Input
          placeholder="Filter trades by symbol..."
          value={(table.getColumn('symbol')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('symbol')?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px] font-normal text-xs text-muted-foreground"
        />

        {table.getColumn('status') && (
          <DataTableFacetedFilter
            column={table.getColumn('status')}
            title="Status"
            options={tradeStatuses}
          />
        )}

        {table.getColumn('side') && (
          <DataTableFacetedFilter
            column={table.getColumn('side')}
            title="Side"
            options={tradeSides}
          />
        )}

        {table.getColumn('timeframe') && (
          <DataTableFacetedFilter
            column={table.getColumn('timeframe')}
            title="Timeframe"
            options={timeframes}
          />
        )}

        {table.getColumn('score') && (
          <DataTableFacetedFilter
            column={table.getColumn('score')}
            title="Score"
            options={[{ label: '0', value: '0' }, { label: '1', value: '1' }, { label: '2', value: '2' }, { label: '3', value: '3' }, { label: '4', value: '4' }, { label: '5', value: '5' }, { label: '6', value: '6' }, { label: '7', value: '7' }, { label: '8', value: '8' }, { label: '9', value: '9' }, { label: '10', value: '10' }]}
          />
        )}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {selectedCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDeleteSelected}
            className="h-8 text-xs font-normal border-rose-700 text-rose-700 hover:bg-rose-500 hover:text-rose-500"
          >
            <Trash2 className="!h-3 !w-3" />
            Delete ({selectedCount})
          </Button>
        )}

        <DataTableViewOptions table={table} />

        <Button onClick={onCreateNew} size="sm" className="h-8 text-xs font-normal text-muted">
          <Plus className="!h-3 !w-3" />
          New
        </Button>
      </div>
    </div>
  );
}