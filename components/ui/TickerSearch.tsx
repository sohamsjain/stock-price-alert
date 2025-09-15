'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useDebounceSearch } from '@/hooks/useDebounceSearch';
import { tickersApi } from '@/lib/api/tickers';
import { Ticker } from '@/types';

interface TickerSearchProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function TickerSearch({
  value,
  onValueChange,
  placeholder = 'Search ticker...',
  disabled = false,
  className,
}: TickerSearchProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedTicker, setSelectedTicker] = React.useState<Ticker | null>(null);

  const {
    query,
    results: tickers,
    isLoading,
    error,
    updateQuery,
  } = useDebounceSearch({
    searchFn: async (searchQuery: string) => {
      const response = await tickersApi.searchTickers(searchQuery, 1, 10);
      return response.tickers;
    },
    delay: 200,
    minLength: 3,
  });

  // Find selected ticker when value changes
  React.useEffect(() => {
    if (value && tickers.length > 0) {
      const ticker = tickers.find(t => t.id === value);
      if (ticker) {
        setSelectedTicker(ticker);
      }
    } else if (!value) {
      setSelectedTicker(null);
    }
  }, [value, tickers]);

  const handleSelect = (ticker: Ticker) => {
    setSelectedTicker(ticker);
    onValueChange(ticker.id);
    setOpen(false);
  };

  const displayValue = selectedTicker 
    ? `${selectedTicker.symbol} - ${selectedTicker.name}`
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          <span className="truncate">
            {selectedTicker ? (
              <span>
                <span className="font-medium">{selectedTicker.symbol}</span>
                <span className="text-muted-foreground ml-2">
                  {selectedTicker.name}
                </span>
              </span>
            ) : (
              placeholder
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search tickers..."
            value={query || ''} // Ensure it's never undefined
            onValueChange={updateQuery}
          />
          <CommandList>
            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
              </div>
            )}
            
            {error && (
              <CommandEmpty>
                <div className="text-center py-4">
                  <p className="text-sm text-destructive">Error: {error}</p>
                </div>
              </CommandEmpty>
            )}
            
            {!isLoading && !error && tickers.length === 0 && query.length > 0 && (
              <CommandEmpty>
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No tickers found.</p>
                </div>
              </CommandEmpty>
            )}
            
            {!isLoading && !error && query.length === 0 && (
              <CommandEmpty>
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">Start typing to search tickers...</p>
                </div>
              </CommandEmpty>
            )}

            {!isLoading && !error && tickers.length > 0 && (
              <CommandGroup>
                {tickers.map((ticker) => (
                  <CommandItem
                    key={ticker.id}
                    value={ticker.id}
                    onSelect={() => handleSelect(ticker)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedTicker?.id === ticker.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div>
                        <div className="font-medium">{ticker.symbol}</div>
                        <div className="text-sm text-muted-foreground">
                          {ticker.name}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        ${ticker.last_price?.toFixed(2) || 'N/A'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {ticker.exchange}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}