'use client';

import * as React from 'react';
import {TrendingUp, TrendingDown, EditIcon, X} from 'lucide-react';
import { toast } from 'sonner';
import clsx from 'clsx';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

import { tickersApi } from '@/lib/api/tickers';
import { Ticker, Timeframe } from '@/types';
import { TradeCreateFormData } from '@/lib/validations/trade';
import { formatCurrency, timeframes } from '@/data/trades-config';

interface TradeCommandProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: TradeCreateFormData) => void;
    isLoading?: boolean;
    initialQuery?: string;
}

export function TradeCommand({
    open,
    onOpenChange,
    onSubmit,
    isLoading = false,
    initialQuery = '',
}: TradeCommandProps) {
    const [selectedTicker, setSelectedTicker] = React.useState<Ticker | null>(null);
    const [searchQuery, setSearchQuery] = React.useState(initialQuery);
    const [showForm, setShowForm] = React.useState(false);
    const [isSearching, setIsSearching] = React.useState(false);

    // Form state
    const [tickers, setTickers] = React.useState<Ticker[]>([]);
    const [side, setSide] = React.useState<'BUY' | 'SELL'>('BUY');
    const [entry, setEntry] = React.useState('');
    const [stoploss, setStoploss] = React.useState('');
    const [target, setTarget] = React.useState('');
    const [timeframe, setTimeframe] = React.useState('1D');
    const [score, setScore] = React.useState('');
    const [notes, setNotes] = React.useState('');
    const [tags, setTags] = React.useState<string[]>([]);
    const [newTag, setNewTag] = React.useState('');

    // Reset search query when dialog opens
    React.useEffect(() => {
        if (open) {
            setSearchQuery(initialQuery);

            // Position cursor at end to avoid text selection
            setTimeout(() => {
                const input = document.querySelector('[cmdk-input]') as HTMLInputElement;
                if (input) {
                    input.focus();
                    input.setSelectionRange(input.value.length, input.value.length);
                }
            }, 50);
        }
    }, [open, initialQuery]);

    // Search tickers when query changes
    React.useEffect(() => {
        if (searchQuery.length >= 1) {
            setIsSearching(true);
            const delayedSearch = setTimeout(() => {
                tickersApi.searchTickers(searchQuery).then((response) => {
                    setTickers(response.tickers);
                });
            }, 0);
            setIsSearching(false);
            return () => clearTimeout(delayedSearch);
        } else {
            setIsSearching(false);
            setTickers([]);
        }

    }, [searchQuery]);

    // Auto-determine side based on price relationships
    React.useEffect(() => {
        if (!entry) return;

        const entryPrice = parseFloat(entry);
        const stoplossPrice = stoploss ? parseFloat(stoploss) : null;
        const targetPrice = target ? parseFloat(target) : null;

        // If both stoploss and target are provided, determine side based on their relationship to entry
        if (stoplossPrice && targetPrice) {
            // BUY: stoploss < entry < target
            // SELL: target < entry < stoploss
            if (stoplossPrice < entryPrice && entryPrice < targetPrice) {
                setSide('BUY');
            } else if (targetPrice < entryPrice && entryPrice < stoplossPrice) {
                setSide('SELL');
            }
        } else if (stoplossPrice) {
            // Only stoploss provided
            if (stoplossPrice < entryPrice) {
                setSide('BUY'); // Stoploss below entry suggests BUY
            } else if (stoplossPrice > entryPrice) {
                setSide('SELL'); // Stoploss above entry suggests SELL
            }
        } else if (targetPrice) {
            // Only target provided
            if (targetPrice > entryPrice) {
                setSide('BUY'); // Target above entry suggests BUY
            } else if (targetPrice < entryPrice) {
                setSide('SELL'); // Target below entry suggests SELL
            }
        }
    }, [entry, stoploss, target]);

    // Reset form when dialog closes
    React.useEffect(() => {
        if (!open) {
            setSelectedTicker(null);
            setSearchQuery('');
            setShowForm(false);
            setSide('BUY');
            setEntry('');
            setStoploss('');
            setTarget('');
            setTimeframe('1D');
            setScore('');
            setNotes('');
            setTags([]);
            setNewTag('');
        }
    }, [open]);

    const handleTickerSelect = (ticker: Ticker) => {
        setSelectedTicker(ticker);
        setShowForm(true);
    };

    const toggleSide = () => {
        setSide(prev => prev === 'BUY' ? 'SELL' : 'BUY');
    };

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedTicker) {
            toast.error('Please select a ticker');
            return;
        }

        const formData: TradeCreateFormData = {
            ticker_id: selectedTicker.id,
            side,
            entry: parseFloat(entry),
            stoploss: stoploss ? parseFloat(stoploss) : undefined,
            target: target ? parseFloat(target) : undefined,
            timeframe: timeframe as Timeframe,
            score: score ? parseFloat(score) : undefined,
            notes: notes.trim(),
            tags: tags.length > 0 ? tags.map(tag => ({ name: tag })) : [],
        };

        onSubmit(formData);
    };

    const canSubmit = selectedTicker && entry && !isLoading;

    if (!showForm) {
        return (
            <CommandDialog open={open} onOpenChange={onOpenChange} showCloseButton={false}>
                <CommandInput
                    placeholder="Search stocks to create trade..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    className="text-sm"
                    autoFocus
                />
                <CommandList className="lg:min-h-[calc(100vh-500px)]">
                    <CommandEmpty>
                        {isSearching
                            ? 'Searching...'
                            : searchQuery.length < 1
                                ? 'Start typing to search...'
                                : 'No results.'
                        }
                    </CommandEmpty>

                    {tickers.length > 0 && (
                        <CommandGroup>
                            {tickers.map((ticker: Ticker) => (
                                <CommandItem
                                    key={ticker.id}
                                    value={ticker.symbol}
                                    onSelect={() => handleTickerSelect(ticker)}
                                    className="flex items-center justify-between cursor-pointer rounded-none"
                                >
                                    <div className="flex flex-col">
                                        <span className="font-normal text-xs text-primary">
                                            {ticker.symbol}
                                        </span>
                                        <span className="font-normal text-xs text-primary/70">
                                            {(ticker.name)
                                                .toLowerCase()
                                                .replace(/\b\w/g, (char) => char.toUpperCase())}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className="font-normal text-xs text-primary hover:text-primary">
                                            {formatCurrency(ticker.last_price)}
                                        </span>
                                        <span className="font-normal text-xs text-primary/70 hover:text-primary">
                                            {ticker.exchange}
                                        </span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                </CommandList>
            </CommandDialog>
        );
    }

    return (
        <CommandDialog open={open} onOpenChange={onOpenChange} showCloseButton={false}>
            <div className="p-6 space-y-6">
                {/* Selected Ticker Header */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-lg">{selectedTicker?.symbol}</span>
                            <EditIcon
                                onClick={() => setShowForm(false)}
                                className="text-muted-foreground cursor-pointer hover:text-primary h-4 w-4"
                            />
                        </div>
                        <span className="text-sm text-muted-foreground">
                            {selectedTicker?.name
                                .toLowerCase()
                                .replace(/\b\w/g, (char) => char.toUpperCase())}
                        </span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="font-normal text-lg text-primary">
                            {formatCurrency(selectedTicker?.last_price ?? 0)}
                        </span>
                        <span className="font-normal text-sm text-muted-foreground">
                            {selectedTicker?.exchange}
                        </span>
                    </div>
                </div>

                <Separator />

                {/* Trade Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Side, Entry, Stoploss, Target - All in one row */}
                    <div className="flex items-center gap-3">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Side</Label>
                            <Button
                                type="button"
                                variant='outline'
                                size='default'
                                onClick={toggleSide}
                                className={clsx(
                                    "flex items-center justify-center text-xs font-normal rounded-sm",
                                    side === "BUY" ? "text-emerald-500 hover:text-emerald-500" : "text-rose-500 hover:text-rose-500"
                                )}
                            >
                                {side === 'BUY' ? (
                                    <>
                                        <TrendingUp className="h-4 w-4" />
                                        BUY
                                    </>
                                ) : (
                                    <>
                                        <TrendingDown className="h-4 w-4" />
                                        SELL
                                    </>
                                )}
                            </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="entry" className="text-xs font-normal">
                                    Entry <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="entry"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={entry}
                                    onChange={(e) => setEntry(e.target.value)}
                                    className="text-sm h-9 rounded-sm"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="stoploss" className="text-xs font-normal">
                                    Stop Loss
                                </Label>
                                <Input
                                    id="stoploss"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={stoploss}
                                    onChange={(e) => setStoploss(e.target.value)}
                                    className="text-sm h-9 rounded-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="target" className="text-xs font-normal">
                                    Target
                                </Label>
                                <Input
                                    id="target"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={target}
                                    onChange={(e) => setTarget(e.target.value)}
                                    className="text-sm h-9 rounded-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Timeframe and Score */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="timeframe" className="text-xs font-normal">
                                Timeframe
                            </Label>
                            <Select value={timeframe} onValueChange={setTimeframe}>
                                <SelectTrigger className="text-sm h-9 rounded-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {timeframes.map((tf) => (
                                        <SelectItem key={tf.value} value={tf.value}>
                                            {tf.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="score" className="text-xs font-normal">
                                Score (0-10)
                            </Label>
                            <Input
                                id="score"
                                type="number"
                                step="0.5"
                                min="0"
                                max="10"
                                placeholder="0.0"
                                value={score}
                                onChange={(e) => setScore(e.target.value)}
                                className="text-sm h-9 rounded-sm"
                            />
                        </div>
                    </div>
                   
                    <Separator />

                    {/* Tags */}
                    <div className="space-y-2">
                        <Label className="text-xs font-normal">Tags</Label>
                        <div className="space-y-2">
                            {/* Tag Input */}
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Type tag and press Enter..."
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyDown={handleTagKeyDown}
                                    className="flex-1 text-sm h-9 rounded-sm"
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
                                            <X
                                                className="h-3 w-3 cursor-pointer hover:text-destructive"
                                                onClick={() => handleRemoveTag(tag)}
                                            />
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes" className="text-xs font-normal">
                            Notes
                        </Label>
                        <Textarea
                            id="notes"
                            placeholder="Add any additional notes about this trade..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="text-sm min-h-[60px] rounded-sm"
                            rows={3}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!canSubmit}>
                            {isLoading ? 'Creating...' : 'Create Trade'}
                        </Button>
                    </div>
                </form>
            </div>
        </CommandDialog>
    );
}