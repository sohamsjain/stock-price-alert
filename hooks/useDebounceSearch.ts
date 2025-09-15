import { useState, useEffect, useCallback, useRef } from 'react';

interface UseDebounceSearchOptions<T> {
  searchFn: (query: string) => Promise<T[]>;
  delay?: number;
  minLength?: number;
}

export function useDebounceSearch<T>({ 
  searchFn, 
  delay = 300,
  minLength = 1 
}: UseDebounceSearchOptions<T>) {
  const [query, setQuery] = useState(''); // Always start with empty string
  const [results, setResults] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to store the latest searchFn to avoid dependency issues
  const searchFnRef = useRef(searchFn);
  
  // Update ref when searchFn changes
  useEffect(() => {
    searchFnRef.current = searchFn;
  }, [searchFn]);

  const search = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < minLength) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const searchResults = await searchFnRef.current(searchQuery);
      setResults(searchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [minLength]); // Only depend on minLength

  useEffect(() => {
    if (query.length === 0) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timeoutId = setTimeout(() => {
      search(query);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [query, delay, search]);

  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery || ''); // Ensure it's never undefined
  }, []);

  const clearResults = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    query,
    results,
    isLoading,
    error,
    updateQuery,
    clearResults,
  };
}