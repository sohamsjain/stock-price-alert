'use client';

import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { Edit, Trash2, Copy, Eye, TrendingUp, Table as TableIcon, MoreVertical } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Trade } from '@/types';
import { DataTableColumnHeader } from './data-table-column-header';
import { getStatusColor, getSideColor, formatCurrency, datetimeWithNulls } from '@/config/trades-config';
import EditableEntryCell from './cells/editable-entry';
import EditableStopLossCell from './cells/editable-stop-loss';
import EditableTargetCell from './cells/editable-target';
import EditableTimeframeCell from './cells/editable-timeframe';
import EditableScoreCell from './cells/editable-score';
import { cn } from '@/lib/utils';

interface TradesColumnsProps {
  onEdit: (id: string, field: string, value: any) => void;
  onDelete: (trade: Trade) => void;
  onView: (trade: Trade) => void;
  onDuplicate: (trade: Trade) => void
}

const fromTimezone = 'UTC';
const toTimezone = 'Asia/Kolkata';

export const createTradesColumns = ({
  onEdit,
  onDelete,
  onView,
  onDuplicate,
}: TradesColumnsProps): ColumnDef<Trade>[] => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "symbol",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Symbol" />
      ),
      cell: ({ row }) => {
        const trade = row.original;

        return (
          <div className="flex items-center justify-between ml-2 group min-w-48">
            {/* Left side: default and hover states */}
            <div className="flex items-center gap-2 relative">
              {/* Default state: Symbol + Ticker Name */}
              <div className="flex flex-col transition-opacity duration-200 group-hover:opacity-0 ">
                <span className="font-normal text-xs text-primary">
                  {trade.symbol}
                  <span className="font-normal text-[10px] text-primary/70 hover:text-primary bg-primary/10 px-1 rounded mx-1">
                    {trade.ticker?.exchange}
                  </span>
                </span>
                <span className="font-normal text-xs text-primary/70">
                  {(trade.ticker?.name ?? "Unknown")
                    .toLowerCase()
                    .replace(/\b\w/g, (char) => char.toUpperCase())}
                </span>
              </div>

              {/* Hover state: Symbol + Icons */}
              <div className="absolute left-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="font-normal text-xs text-primary hover:text-primary hover:underline transition cursor-pointer underline-offset-2"
                  onClick={() => onView(trade)}>
                  {trade.symbol}
                </span>
                <a
                  href={`https://www.tradingview.com/chart/?symbol=${trade.ticker?.exchange}:${trade.ticker?.symbol}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary border border-muted-foreground/70 hover:border-primary p-1 rounded"
                >
                  <TrendingUp size={10} />
                </a>
                <a
                  href={`https://www.screener.in/company/${trade.ticker?.symbol}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary border border-muted-foreground/70 hover:border-primary p-1 rounded"
                >
                  <TableIcon size={10} />
                </a>
              </div>
            </div>

            {/* Right side: Last Price + Exchange (unchanged) */}
            <div className="flex flex-col items-end">
              <span className="font-normal text-sm text-primary hover:text-primary">
                {formatCurrency(trade.last_price)}
              </span>
            </div>
          </div>
        );
      },
      enableHiding: false,
    },
    {
      accessorKey: 'side',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Side" className="justify-end -mx-2" />
      ),
      cell: ({ row }) => {
        const side = row.getValue('side') as string;
        return (
          <div className="flex flex-col items-end">
            <Badge variant="outline" className={cn(getSideColor(side), 'font-normal text-[10px] rounded px-1 py-0.5')}>
              {side}
            </Badge>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" className="justify-end -mx-2" />
      ),
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <div className="flex flex-col items-end">
            <Badge variant="outline" className={cn(getStatusColor(status), 'font-normal text-[10px] rounded px-1 py-0.5')}>
              {status}
            </Badge>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'entry',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Entry" className="justify-end -mx-2" />
      ),
      cell: ({ row }) => {
        const trade = row.original;
        return (
          <div className="flex flex-col items-end">
            <EditableEntryCell
              value={trade.entry}
              onSave={(value) => onEdit(trade.id, 'entry', value)}
            />
          </div>
        );
      },
    },
    {
      accessorKey: 'entry_eta',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Entry ETA" className="justify-end -mx-2" />
      ),
      cell: ({ row }) => {
        const eta = row.getValue('entry_eta') as string;
        return eta && (
          <div className="flex flex-col items-end">
            <span className="font-normal text-xs text-primary hover:text-primary">
              {eta} away
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'stoploss',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Stop Loss" className="justify-end -mx-2" />
      ),
      cell: ({ row }) => {
        const trade = row.original;
        return (
          <div className="flex flex-col items-end">
            <EditableStopLossCell
              value={trade.stoploss}
              onSave={(value) => onEdit(trade.id, 'stoploss', value)}
            />
          </div>
        );
      },
    },
    {
      accessorKey: 'stoploss_eta',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Stop Loss ETA" className="justify-end -mx-2" />
      ),
      cell: ({ row }) => {
        const eta = row.getValue('stoploss_eta') as string;
        return eta && (
          <div className="flex flex-col items-end">
            <span className="font-normal text-xs text-primary hover:text-primary">
              {eta} away
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'target',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Target" className="justify-end -mx-2" />
      ),
      cell: ({ row }) => {
        const trade = row.original;
        return (
          <div className="flex flex-col items-end">
            <EditableTargetCell
              value={trade.target}
              onSave={(value) => onEdit(trade.id, 'target', value)}
            />
          </div>
        );
      },
    },
    {
      accessorKey: 'target_eta',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Target ETA" className="justify-end -mx-2" />
      ),
      cell: ({ row }) => {
        const eta = row.getValue('target_eta') as string;
        return eta && (
          <div className="flex flex-col items-end">
            <span className="font-normal text-xs text-primary hover:text-primary">
              {eta} away
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'timeframe',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Timeframe" className="justify-end -mx-2" />
      ),
      cell: ({ row }) => {
        const trade = row.original;
        return (
          <div className="flex flex-col items-end">
            <EditableTimeframeCell
              value={trade.timeframe}
              onSave={(value) => onEdit(trade.id, 'timeframe', value)}
            />
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'tags',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="#Tags" className="text-muted-foreground hover:text-primary text-xs font-normal -mx-2 text-center" />
      ),
      cell: ({ row }) => {
        const trade = row.original;
        const tags = row.getValue('tags') as Array<{ name: string }>;
        return (
          <div className="flex flex-wrap max-w-[200px] items-center justify-center" onClick={() => onView(trade)}>
            {tags?.length > 0 ? (
              tags.slice(0, 1).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs rounded-md cursor-pointer hover:bg-background">
                  {tag.name.length > 6 ? tag.name.slice(0, 6) + '..' : tag.name}
                  {tags?.length > 1 && (
                    <span className="text-primary text-xs hover:text-primary">&nbsp;+{tags.length - 1}</span>
                  )}
                </Badge>
              ))
            ) : (
              <span className="text-primary text-xs hover:text-primary">No tags</span>
            )}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: 'score',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Score" className="justify-end -mx-2" />
      ),
      cell: ({ row }) => {
        const trade = row.original;
        return (
          <div className="flex flex-col items-end">
            <EditableScoreCell
              value={trade.score}
              onSave={(value) => onEdit(trade.id, 'score', value)}
            />
          </div>
        );
      },
      filterFn: (row, id, value) => {
        const score: number = row.getValue(id)
        return value.includes(score.toString());
      },
    },
    {
      accessorKey: 'risk_per_unit',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Risk/Share" className="justify-end -mx-2" />
      ),
      cell: ({ row }) => {
        const risk_per_unit = row.getValue('risk_per_unit') as number;
        return risk_per_unit ? (
          <div className="flex flex-col items-end">
            <span className="font-normal text-xs text-primary hover:text-primary">
              {formatCurrency(risk_per_unit)}
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-end">
            <span className="text-primary"></span>
          </div>
        );
      },
    },
    {
      accessorKey: 'reward_per_unit',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Reward/Share" className="justify-end -mx-2" />
      ),
      cell: ({ row }) => {
        const reward_per_unit = row.getValue('reward_per_unit') as number;
        return reward_per_unit ? (
          <div className="flex flex-col items-end">
            <span className="font-normal text-xs text-primary hover:text-primary">
              {formatCurrency(reward_per_unit)}
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-end">
            <span className="text-primary"></span>
          </div>
        );
      },
    },
    {
      accessorKey: 'risk_reward_ratio',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="R:R" className="justify-end -mx-2" />
      ),
      cell: ({ row }) => {
        const ratio = row.getValue('risk_reward_ratio') as number;
        return ratio ? (
          <div className="flex flex-col items-end">
            <span className="font-normal text-xs text-primary hover:text-primary">
              {ratio.toFixed(1)}x
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-end">
            <span className="text-primary"></span>
          </div>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" className="justify-end -mx-2" />
      ),
      cell: ({ row }) => {
        const date = row.getValue('created_at') as string;
        return (
          <div className="flex flex-col items-end">
            <span className="text-primary hover:text-primary text-xs font-normal">
              {format(toZonedTime(fromZonedTime(date, fromTimezone), toTimezone), 'MMM dd • HH:mm')}
            </span>
          </div>
        );
      },
      sortingFn: datetimeWithNulls,
    },
    {
      accessorKey: 'edited_at',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Edited" className="justify-end -mx-2" />
      ),
      cell: ({ row }) => {
        const date = row.getValue('edited_at') as string;
        return date && (
          <div className="flex flex-col items-end">
            <span className="text-primary hover:text-primary text-xs font-normal">
              {format(toZonedTime(fromZonedTime(date, fromTimezone), toTimezone), 'MMM dd • HH:mm')}
            </span>
          </div>
        );
      },
      sortingFn: datetimeWithNulls,
    },
    {
      accessorKey: 'status_updated_at',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Updated" className="justify-end -mx-2" />
      ),
      cell: ({ row }) => {
        const date = row.getValue('status_updated_at') as string;
        return date && (
          <div className="flex flex-col items-end">
            <span className="text-primary hover:text-primary text-xs font-normal">
              {format(toZonedTime(fromZonedTime(date, fromTimezone), toTimezone), 'MMM dd • HH:mm')}
            </span>
          </div>
        );
      },
      sortingFn: datetimeWithNulls,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const trade = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="ml-auto lg:flex">
              <Button
                variant="ghost"
                className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
              >
                <MoreVertical className="h-4 w-4 text-primary hover:text-primary text-xs font-normal" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem onClick={() => onView(trade)} className="text-xs font-normal text-muted-foreground">
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(trade.id, 'edit', trade)} className="text-xs font-normal text-muted-foreground">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(trade)} className="text-xs font-normal text-muted-foreground">
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(trade)}
                className="text-xs font-normal text-rose-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];