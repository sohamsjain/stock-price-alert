'use client';

import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { MoreHorizontal, Edit, Trash2, Copy, Eye, TrendingUp, Table as TableIcon } from 'lucide-react';

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
import { getStatusColor, getSideColor, formatCurrency } from '@/data/trades-config';
import { cn } from '@/lib/utils';

interface TradesColumnsProps {
  onEdit: (trade: Trade) => void;
  onDelete: (trade: Trade) => void;
  onView: (trade: Trade) => void;
  onDuplicate: (trade: Trade) => void;
}

const timezone = 'Asia/Kolkata';

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
          <div className="flex items-center justify-between ml-2 group">
            {/* Left side: default and hover states */}
            <div className="flex items-center gap-2 relative">
              {/* Default state: Symbol + Ticker Name */}
              <div className="flex flex-col transition-opacity duration-200 group-hover:opacity-0">
                <span className="font-normal text-xs text-primary">
                  {trade.symbol}
                </span>
                <span className="font-normal text-xs text-primary/70">
                  {(trade.ticker?.name ?? "Unknown")
                    .toLowerCase()
                    .replace(/\b\w/g, (char) => char.toUpperCase())}
                </span>
              </div>
    
              {/* Hover state: Symbol + Icons */}
              <div className="absolute left-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="font-normal text-xs text-primary hover:text-primary hover:underline transition cursor-pointer underline-offset-2">
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
              <span className="font-normal text-xs text-primary hover:text-primary">
                {formatCurrency(trade.last_price)}
              </span>
              <span className="font-normal text-xs text-primary/70 hover:text-primary">
                {trade.ticker?.exchange}
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
        <DataTableColumnHeader column={column} title="Entry" className="justify-end -mx-2 " />
      ),
      cell: ({ row }) => {
        const entry = row.getValue('entry') as number;
        return (
          <div className="flex flex-col items-end">
            <span className="font-normal text-xs text-primary hover:text-primary">
              {formatCurrency(entry)}
            </span>
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
        const stoploss = row.getValue('stoploss') as number;
        return stoploss ? (
          <div className="flex flex-col items-end">
            <span className="font-normal text-xs text-rose-700 hover:text-rose-500">
              {formatCurrency(stoploss)}
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
        const target = row.getValue('target') as number;
        return target ? (
          <div className="flex flex-col items-end">
            <span className="font-normal text-xs text-emerald-700 hover:text-emerald-500">
              {formatCurrency(target)}
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
        const timeframe = row.getValue('timeframe') as string;
        return timeframe ? (
          <div className="flex flex-col items-end">
            <Badge variant="secondary" className="text-[10px] font-normal rounded text-primary hover:text-primary px-1 py-0.5">
              {timeframe}
            </Badge>
          </div>
        ) : (
          <div className="flex flex-col items-end">
            <span className="text-primary"></span>
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
        <DataTableColumnHeader column={column} title="Tags" className="text-muted-foreground hover:text-primary text-xs font-normal -mx-2 text-center" />
      ),
      cell: ({ row }) => {
        const tags = row.getValue('tags') as Array<{ name: string }>;
        return (
          <div className="flex flex-wrap gap-1 max-w-[200px] items-end">
            {tags?.length > 0 ? (
              tags.slice(0, 1).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag.name}
                </Badge>
              ))
            ) : (
              <span className="text-primary text-xs hover:text-primary">No tags</span>
            )}
            {tags?.length > 1 && (
              <Badge variant="outline" className="text-xs">
                +{tags.length - 1}
              </Badge>
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
        const score = row.getValue('score') as number;
        return score ? (
          <div className="flex flex-col items-end">
            <span className="text-primary hover:text-primary font-normal text-xs">
              {score} / 10
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
              {format(toZonedTime(new Date(date), timezone), 'MMM dd • HH:mm')}
            </span>
          </div>
        );
      },
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
              {format(toZonedTime(new Date(date), timezone), 'MMM dd • HH:mm')}
            </span>
          </div>
        );
      },
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
              {format(toZonedTime(new Date(date), timezone), 'MMM dd • HH:mm')}
            </span>
          </div>
        );
      },
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
                <MoreHorizontal className="h-4 w-4 text-primary hover:text-primary text-xs font-normal" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem onClick={() => onView(trade)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(trade)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(trade)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(trade)}
                className="text-destructive"
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