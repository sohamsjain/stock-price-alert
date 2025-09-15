'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { TickerSearch } from '@/components/ui/TickerSearch';
import { TagInput } from '@/components/ui/TagInput';

import { Trade } from '@/types';
import { TradeCreateFormData, tradeCreateFormSchema, TradeUpdateFormData, tradeUpdateFormSchema } from '@/lib/validations/trade';
import { tradeSides, timeframes } from '@/data/trades-config';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface TradeFormProps {
  trade?: Trade | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TradeCreateFormData | TradeUpdateFormData) => Promise<void>;
  isLoading?: boolean;
  mode: 'create' | 'edit' | 'duplicate';
}

export function TradeForm({
  trade,
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
  mode,
}: TradeFormProps) {
  const isMobile = useIsMobile();
  const [tags, setTags] = React.useState<Array<{ name: string }>>(trade?.tags || []);

  const schema = mode === 'create' || mode === 'duplicate'
    ? tradeCreateFormSchema
    : tradeUpdateFormSchema;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm<TradeCreateFormData | TradeUpdateFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ticker_id: trade?.ticker?.id || undefined,
      side: trade?.side || undefined,
      type: trade?.type || undefined,
      entry: trade?.entry || undefined,
      stoploss: trade?.stoploss || undefined,
      target: trade?.target || undefined,
      timeframe: trade?.timeframe || undefined,
      notes: trade?.notes || '',
      score: trade?.score || undefined,
      tags: trade?.tags || [],
    },
  });

  React.useEffect(() => {
    if (trade && mode !== 'create') {
      const resetValues = {
        ticker_id: trade.ticker?.id || undefined,
        side: trade.side || undefined,
        type: trade.type || undefined,
        entry: trade.entry || undefined,
        stoploss: trade.stoploss || undefined,
        target: trade.target || undefined,
        timeframe: trade.timeframe || undefined,
        notes: trade.notes || '',
        score: trade.score || undefined,
        tags: trade.tags || [],
      };
      reset(resetValues);
      setTags(trade.tags || []);
    } else if (mode === 'create') {
      const createValues = {
        ticker_id: undefined,
        side: undefined,
        type: undefined,
        entry: undefined,
        stoploss: undefined,
        target: undefined,
        timeframe: undefined,
        notes: '',
        score: undefined,
        tags: [],
      };
      reset(createValues);
      setTags([]);
    }
  }, [trade, mode, reset]);

  const handleFormSubmit = async (data: TradeCreateFormData | TradeUpdateFormData) => {
    await onSubmit({ ...data, tags });
    if (mode === 'create') {
      const createValues = {
        ticker_id: undefined,
        side: undefined,
        type: undefined,
        entry: undefined,
        stoploss: undefined,
        target: undefined,
        timeframe: undefined,
        notes: '',
        score: undefined,
        tags: [],
      };
      reset(createValues);
      setTags([]);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'create':
        return 'Create New Trade';
      case 'edit':
        return 'Edit Trade';
      case 'duplicate':
        return 'Duplicate Trade';
      default:
        return 'Trade Form';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'create':
        return 'Enter the details for your new trade.';
      case 'edit':
        return 'Update the trade information.';
      case 'duplicate':
        return 'Create a copy of this trade with modified details.';
      default:
        return 'Manage your trade details.';
    }
  };

  return (
    <Drawer 
      open={open} 
      onOpenChange={onOpenChange}
      direction={isMobile ? 'bottom' : 'right'}
    >
      <DrawerContent 
        className={cn(
          isMobile 
            ? "max-h-[90vh]" 
            : "h-full max-w-2xl"
        )}
      >
        <DrawerHeader className="text-left">
          <DrawerTitle>{getTitle()}</DrawerTitle>
          <DrawerDescription>
            {getDescription()}
          </DrawerDescription>
        </DrawerHeader>

        <div className="overflow-y-auto flex-1 p-4">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Ticker Selection */}
            <div className="space-y-2">
              <Label htmlFor="ticker_id">Ticker *</Label>
              <Controller
                name="ticker_id"
                control={control}
                render={({ field }) => (
                  <TickerSearch
                    value={field.value || ''}
                    onValueChange={field.onChange}
                    placeholder="Search and select a ticker..."
                    className={cn(errors.ticker_id && 'border-destructive')}
                    disabled={isLoading}
                  />
                )}
              />
              {errors.ticker_id && (
                <p className="text-sm text-destructive">{errors.ticker_id.message}</p>
              )}
            </div>

            {/* Side and Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="side">Side</Label>
                <Controller
                  name="side"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select side" />
                      </SelectTrigger>
                      <SelectContent>
                        {tradeSides.map((side) => (
                          <SelectItem key={side.value} value={side.value}>
                            <div className="flex items-center">
                              <side.icon className="mr-2 h-4 w-4" />
                              {side.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.side && (
                  <p className="text-sm text-destructive">{errors.side.message}</p>
                )}
              </div>
            </div>

            {/* Entry, Stop Loss, Target */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entry">Entry Price *</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register('entry', { valueAsNumber: true })}
                  className={cn(errors.entry && 'border-destructive')}
                />
                {errors.entry && (
                  <p className="text-sm text-destructive">{errors.entry.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stoploss">Stop Loss</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register('stoploss', {
                    setValueAs: (value) => {
                      if (value === '' || value === null || value === undefined) {
                        return undefined; // let Zod treat it as optional
                      }
                      const num = Number(value);
                      return isNaN(num) ? undefined : num;
                    },
                  })}
                  className={cn(errors.stoploss && 'border-destructive')}
                />
                {errors.stoploss && (
                  <p className="text-sm text-destructive">{errors.stoploss.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="target">Target</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register('target', {
                    setValueAs: (value) => {
                      if (value === '' || value === null || value === undefined) {
                        return undefined; // let Zod treat it as optional
                      }
                      const num = Number(value);
                      return isNaN(num) ? undefined : num;
                    },
                  })}
                  className={cn(errors.target && 'border-destructive')}
                />
                {errors.target && (
                  <p className="text-sm text-destructive">{errors.target.message}</p>
                )}
              </div>
            </div>

            {/* Timeframe and Score */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeframe">Timeframe</Label>
                <Controller
                  name="timeframe"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timeframe" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeframes.map((timeframe) => (
                          <SelectItem key={timeframe.value} value={timeframe.value}>
                            {timeframe.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.timeframe && (
                  <p className="text-sm text-destructive">{errors.timeframe.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="score">Score (1-10)</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  placeholder="Rate your confidence"
                  {...register('score', { 
                    setValueAs: (value) => {
                      if (value === '' || value === null || value === undefined) {
                        return undefined; // let Zod treat it as optional
                      }
                      const num = Number(value);
                      return isNaN(num) ? undefined : num;
                    },
                  })}
                  className={cn(errors.score && 'border-destructive')}
                />
                {errors.score && (
                  <p className="text-sm text-destructive">{errors.score.message}</p>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <TagInput
                value={tags}
                onChange={(newTags) => {
                  setTags(newTags);
                  setValue('tags', newTags);
                }}
                placeholder="Search existing tags or create new ones..."
                disabled={isLoading}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                placeholder="Add any additional notes about this trade..."
                className="resize-none"
                rows={3}
                {...register('notes')}
              />
              {errors.notes && (
                <p className="text-sm text-destructive">{errors.notes.message}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    {mode === 'create' ? 'Creating...' : 'Saving...'}
                  </>
                ) : (
                  mode === 'create' ? 'Create Trade' : 'Save Changes'
                )}
              </Button>
              <DrawerClose asChild>
                <Button type="button" variant="outline" disabled={isLoading}>
                  Cancel
                </Button>
              </DrawerClose>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}