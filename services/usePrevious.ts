import { useRef, useEffect } from 'react';

/**
 * Hook customizado para armazenar o valor anterior de uma variável de estado.
 * @param value O valor atual.
 * @returns O valor da renderização anterior.
 */
export function usePrevious<T>(value: T): T | undefined {
  // FIX: The error "Expected 1 arguments, but got 0" occurs because useRef<T>() requires an initial value if T cannot be undefined.
  // The type is changed to `T | undefined` to reflect that the ref is initialized without a value.
  const ref = useRef<T | undefined>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
