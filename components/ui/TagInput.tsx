'use client';

import * as React from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useDebounceSearch } from '@/hooks/useDebounceSearch';
import { tagsApi } from '@/lib/api/tags';
import { Tag } from '@/types';

interface TagInputProps {
  value: Array<{ name: string }>;
  onChange: (tags: Array<{ name: string }>) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function TagInput({
  value = [],
  onChange,
  placeholder = 'Add tags...',
  disabled = false,
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLDivElement>(null);

  const {
    query,
    results: searchTags,
    isLoading,
    updateQuery,
  } = useDebounceSearch({
    searchFn: async (searchQuery: string) => {
      const response = await tagsApi.searchTags(searchQuery, 1, 10);
      return response.tags;
    },
    delay: 300,
    minLength: 1,
  });

  const handleInputChange = (newValue: string) => {
    const value = newValue || ''; // Ensure it's never undefined
    setInputValue(value);
    updateQuery(value);
    setOpen(value.length > 0);
  };

  const addTag = (tagName: string) => {
    const trimmedName = tagName.trim();
    if (trimmedName && !value.find(tag => tag.name.toLowerCase() === trimmedName.toLowerCase())) {
      onChange([...value, { name: trimmedName }]);
      setInputValue('');
      setOpen(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag.name !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const handleSelectTag = (tag: Tag) => {
    addTag(tag.name);
  };

  // Filter out tags that are already selected
  const availableTags = searchTags.filter(
    tag => !value.find(selectedTag => 
      selectedTag.name.toLowerCase() === tag.name.toLowerCase()
    )
  );

  return (
    <div className={cn("space-y-2", className)}>
      {/* Selected Tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {tag.name}
              {!disabled && (
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => removeTag(tag.name)}
                />
              )}
            </Badge>
          ))}
        </div>
      )}

      {/* Tag Input with Portal */}
      <PopoverPrimitive.Root open={open && !disabled} onOpenChange={setOpen}>
        <PopoverPrimitive.Trigger asChild>
          <div className="relative" ref={triggerRef}>
            <Input
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => inputValue.trim() && addTag(inputValue)}
              disabled={disabled || !inputValue.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </PopoverPrimitive.Trigger>
        
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            className="z-[9999] w-80 rounded-md border bg-popover p-0 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <Command shouldFilter={false}>
              <CommandList>
                {isLoading && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
                  </div>
                )}
                
                {!isLoading && availableTags.length === 0 && query.length > 0 && (
                  <div className="p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      No existing tags found.
                    </p>
                    <Button
                      size="sm"
                      onClick={() => addTag(query)}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create "{query}"
                    </Button>
                  </div>
                )}

                {!isLoading && availableTags.length > 0 && (
                  <CommandGroup heading="Existing Tags">
                    {availableTags.map((tag) => (
                      <CommandItem
                        key={tag.id}
                        value={tag.name}
                        onSelect={() => handleSelectTag(tag)}
                        className="cursor-pointer"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        {tag.name}
                      </CommandItem>
                    ))}
                    {query.trim() && !availableTags.find(tag => 
                      tag.name.toLowerCase() === query.trim().toLowerCase()
                    ) && (
                      <CommandItem
                        value={query}
                        onSelect={() => addTag(query)}
                        className="cursor-pointer border-t"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create "{query}"
                      </CommandItem>
                    )}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </div>
  );
}