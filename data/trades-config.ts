import { SortingFn } from '@tanstack/react-table';
import { TrendingUp, TrendingDown, Play, CheckCircle, XCircle, BarChart, LineChart, Target } from 'lucide-react';

export const tradeStatuses = [
  {
    value: 'Active',
    label: 'Active',
    icon: Play,
  },
  {
    value: 'Entry',
    label: 'Entry',
    icon: CheckCircle,
  },
  {
    value: 'Stop Loss',
    label: 'Stop Loss',
    icon: XCircle,
  },
  {
    value: 'Target',
    label: 'Target',
    icon: Target,
  },
];

export const tradeSides = [
  {
    value: 'BUY',
    label: 'BUY',
    icon: TrendingUp,
  },
  {
    value: 'SELL',
    label: 'SELL',
    icon: TrendingDown,
  },
];

export const timeframes = [
  {
    value: '1m',
    label: '1 Minute',
  },
  {
    value: '5m',
    label: '5 Minutes',
  },
  {
    value: '15m',
    label: '15 Minutes',
  },
  {
    value: '1h',
    label: '1 Hour',
  },
  {
    value: '1D',
    label: '1 Day',
  },
  {
    value: '1W',
    label: '1 Week',
  },
  {
    value: '1M',
    label: '1 Month',
  },
];

// Helper functions
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active':
      return 'text-blue-600 bg-blue-100 dark:text-blue-500 dark:bg-blue-900/20';
    case 'Entry':
      return 'text-green-600 bg-green-100 dark:text-emerald-700 dark:bg-emerald-900/10';
    case 'Stop Loss':
      return 'text-red-600 bg-red-100 dark:text-rose-700 dark:bg-rose-900/10';
    case 'Target':
      return 'text-yellow-600 bg-yellow-100 dark:text-yellow-600 dark:bg-yellow-900/20';
    default:
      return 'text-gray-600 bg-gray-100 dark:text-gray-600 dark:bg-gray-900/20';
  }
};

export const getSideColor = (side: string) => {
  switch (side) {
    case 'BUY':
      return 'text-green-600 bg-green-100 dark:text-emerald-700 dark:bg-emerald-900/10';
    case 'SELL':
      return 'text-red-600 bg-red-100 dark:text-rose-700 dark:bg-rose-900/10';
    default:
      return 'text-gray-600 bg-gray-100 dark:text-gray-600 dark:bg-gray-900/20';
  }
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatPercent = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(value / 100);
};


export const datetimeWithNulls: SortingFn<any> = (rowA, rowB, columnId) => {
  const a = rowA.getValue(columnId) as string | null
  const b = rowB.getValue(columnId) as string | null

  // handle nulls first
  if (!a && !b) return 0
  if (!a) return 1   // nulls go to bottom
  if (!b) return -1

  const dateA = new Date(a).getTime()
  const dateB = new Date(b).getTime()

  return dateA === dateB ? 0 : dateA > dateB ? 1 : -1
}
