import {useEffect, useState} from "react";

/**
 * A hook for automatically trigger an action (search, etc.)
 * by writing text in an input field after an amount of time.
 * Returns value after delay.
 */
export default function useDebounce<T>(value: T, delay: number = 250): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  // everytime the value changes we set it as the debounced value
  // NOTE: we have to clean up the effect
  // because if we type in a new value while the first delay is running,
  // we want to cancel it
  useEffect(() => {
    // we can do something after the delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}
