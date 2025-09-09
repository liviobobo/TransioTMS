import { useState, useEffect } from 'react';

/**
 * Hook pentru debouncing - întârzie executarea unei valori până când
 * utilizatorul termină de tastat
 * @param value - valoarea de debounce
 * @param delay - întârziere în milisecunde (default 300ms)
 * @returns valoarea debounced
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Setează un timeout pentru actualizarea valorii debounced
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Curăță timeout-ul dacă valoarea se schimbă sau componenta se demontează
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook pentru debouncing callback - întârzie executarea unei funcții
 * @param callback - funcția de executat
 * @param delay - întârziere în milisecunde (default 300ms)
 * @returns funcția debounced
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const debouncedCallback = (...args: Parameters<T>) => {
    // Curăță timer-ul existent
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Setează un nou timer
    const newTimer = setTimeout(() => {
      callback(...args);
    }, delay);

    setDebounceTimer(newTimer);
  };

  // Curăță timer-ul când componenta se demontează
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return debouncedCallback;
}