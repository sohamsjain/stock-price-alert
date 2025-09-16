'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Clock, TrendingUp, TrendingDown, EditIcon } from 'lucide-react';

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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { TagInput } from '@/components/ui/TagInput';

import { Trade } from '@/types';
import { TradeUpdateFormData, tradeUpdateFormSchema } from '@/lib/validations/trade';
import { tradeSides, timeframes, formatCurrency, getStatusColor, getSideColor } from '@/data/trades-config';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

const toTimezone = 'Asia/Kolkata';
const fromTimezone = 'UTC';

interface TradeDetailsProps {
  trade?: Trade | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TradeUpdateFormData) => Promise<void>;
  isLoading?: boolean;
}

export function TradeDetails({
  trade,
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: TradeDetailsProps) {
  const isMobile = useIsMobile();
  const [tags, setTags] = React.useState<string[]>([]);
  const [newTag, setNewTag] = React.useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TradeUpdateFormData>({
    resolver: zodResolver(tradeUpdateFormSchema),
    defaultValues: {
      notes: trade?.notes || '',
      tags: trade?.tags || [],
    },
  });

  React.useEffect(() => {
    if (trade) {
      const resetValues = {
        notes: trade.notes || '',
        tags: trade.tags || [],
      };
      reset(resetValues);
      // Extract tag names from tag objects
      setTags(trade.tags?.map(tag => tag.name) || []);
    }
  }, [trade, reset]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleFormSubmit = async (data: TradeUpdateFormData) => {
    // Convert tag strings to tag objects and filter out undefined values
    const formData = {
      notes: data.notes?.trim() || undefined,
      tags: tags.length > 0 ? tags.map(tag => ({ name: tag })) : undefined,
    };

    // Simple filter to remove undefined values
    const cleanedData = Object.fromEntries(
      Object.entries(formData).filter(([_, value]) => value !== undefined)
    );

    await onSubmit(cleanedData as TradeUpdateFormData);
  };

  const getSideInfo = (side: string) => {
    return tradeSides.find(s => s.value === side);
  };

  const getTimeframeLabel = (timeframe: string) => {
    return timeframes.find(t => t.value === timeframe)?.label || timeframe;
  };

  const formatDate = (date: Date) => {
    return format(toZonedTime(fromZonedTime(date, fromTimezone), toTimezone), 'MMM dd • HH:mm');
  };

  const timelineEvents = React.useMemo(() => {
    if (!trade) return [];
    
    const events = [];
    
    // Created
    events.push({
      type: 'created',
      label: 'Created',
      date: trade.created_at,
      completed: true,
      icon: <Check className="h-4 w-4" />,
    });

    // Edited (if exists)
    if (trade.edited_at) {
      events.push({
        type: 'edited',
        label: 'Edited', 
        date: trade.edited_at,
        completed: true,
        icon: <Check className="h-4 w-4" />,
      });
    }

    // Entry
    if (trade.entry_at) {
      events.push({
        type: 'entry',
        label: 'Entry Time',
        date: trade.entry_at,
        price: trade.entry,
        completed: true,
        icon: <Check className="h-4 w-4" />,
      });
    } else {
      events.push({
        type: 'entry',
        label: 'Entry ETA',
        eta: trade.entry_eta,
        price: trade.entry,
        completed: false,
        icon: <Clock className="h-4 w-4" />,
      });
    }

    // Stoploss
    if (trade.stoploss_at) {
      events.push({
        type: 'stoploss',
        label: 'Stop Loss Time',
        date: trade.stoploss_at,
        price: trade.stoploss,
        completed: true,
        icon: <Check className="h-4 w-4" />,
      });
    } else if (trade.stoploss_eta) {
      events.push({
        type: 'stoploss',
        label: 'Stop Loss ETA',
        eta: trade.stoploss_eta,
        price: trade.stoploss,
        completed: false,
        icon: <Clock className="h-4 w-4" />,
      });
    }

    // Target
    if (trade.target_at) {
      events.push({
        type: 'target',
        label: 'Target Time',
        date: trade.target_at,
        price: trade.target,
        completed: true,
        icon: <Check className="h-4 w-4" />,
      });
    } else if (trade.target_eta) {
      events.push({
        type: 'target',
        label: 'Target ETA',
        eta: trade.target_eta,
        price: trade.target,
        completed: false,
        icon: <Clock className="h-4 w-4" />,
      });
    }

    return events;
  }, [trade]);

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
        <DrawerHeader className="bg-background border-b">
          <DrawerTitle className="flex items-center justify-between">
            <span className="font-bold text-lg">
              {trade?.ticker?.symbol}
            </span>
            <span className="text-lg font-medium">
              {formatCurrency(trade?.last_price || 0)}
            </span>
          </DrawerTitle>
          <DrawerDescription className="flex items-center justify-between">
            <span className="text-sm">
              {(trade?.ticker?.name ?? "Unknown")
                .toLowerCase()
                .replace(/\b\w/g, (char) => char.toUpperCase())}
            </span>
            <span className="text-sm text-muted-foreground">
              {trade?.ticker?.exchange}
            </span>
          </DrawerDescription>
        </DrawerHeader>

        {/* Side and Status Badges */}
        <div className="px-4 py-3 bg-muted/30 border-b">
          <div className="flex items-center justify-end gap-2">
            {trade?.side && (
              <Badge variant="outline" className={cn(getSideColor(trade.side), 'text-xs rounded')}>
                {React.createElement(getSideInfo(trade.side)?.icon || TrendingUp, {
                  className: "h-3 w-3 mr-1"
                })}
                {trade.side}
              </Badge>
            )}
            {trade?.status && (
              <Badge variant="outline" className={cn(getStatusColor(trade.status), 'text-xs rounded')}>
                {trade.status}
              </Badge>
            )}
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-4">
          {/* Timeline */}
          <div className="space-y-6 mb-8">
            <h3 className="text-lg font-semibold">Timeline</h3>
            <div className="space-y-4">
              {timelineEvents.map((event, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2",
                    event.completed 
                      ? "bg-primary border-primary text-primary-foreground" 
                      : "bg-background border-primary text-primary-background"
                  )}>
                    {event.icon}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "text-sm font-medium",
                        event.completed ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {event.label}
                      </span>
                      {event.price && (
                        <span className="text-sm font-normal text-foreground">
                          {formatCurrency(event.price)}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <>
                      {event.date ? formatDate(event.date) : event.eta ? `${event.eta} away` : 'Far away'}
                      </>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Trade Metrics */}
          <div className="space-y-6 mb-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-normal text-muted-foreground">Timeframe</Label>
                <div>
                  <span className="text-sm">
                    {trade?.timeframe ? getTimeframeLabel(trade.timeframe) : 'Not set'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-normal text-muted-foreground">Score</Label>
                <div>
                  <span className="text-sm">
                    {trade?.score ? `${trade.score} / 10` : 'Not rated'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-normal text-muted-foreground">Risk per Share</Label>
                <div>
                  <span className="text-sm font-normal">
                    {trade?.risk_per_unit ? formatCurrency(trade.risk_per_unit) : 'Not calculated'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-normal text-muted-foreground">Reward per Share</Label>
                <div>
                  <span className="text-sm font-normal">
                    {trade?.reward_per_unit ? formatCurrency(trade.reward_per_unit) : 'Not calculated'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 col-span-2">
                <Label className="text-sm font-normal text-muted-foreground">Risk:Reward Ratio</Label>
                <div>
                  <span className="text-sm font-normal">
                    {trade?.risk_reward_ratio ? `${trade.risk_reward_ratio.toFixed(1)}x` : 'Not calculated'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Editable Form */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="space-y-2">
                {/* Tag Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Type tag and press Enter..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    className="flex-1 text-sm h-9"
                disabled={isLoading}
              />
                </div>

                {/* Existing Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2 bg-muted/30 rounded-md min-h-[32px]">
                    {tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs flex items-center gap-1 px-2 py-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-destructive"
                          disabled={isLoading}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                placeholder="Add any additional notes about this trade..."
                className="resize-none min-h-[100px]"
                rows={4}
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
                    Saving...
                  </>
                ) : (
                  'Save Changes'
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