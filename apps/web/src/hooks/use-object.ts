import { useCallback, useState } from "react";

export function useObject<TObject extends Record<string, unknown>>(
  initialObject: TObject,
) {
  const [object, setObject] = useState<TObject>(initialObject);

  const setObjectValue = useCallback(
    <TKey extends keyof TObject>(key: TKey, value: TObject[TKey]) => {
      setObject((current) => ({
        ...current,
        [key]: value,
      }));
    },
    [],
  );

  const resetObject = useCallback(() => {
    setObject(initialObject);
  }, [initialObject]);

  return {
    object,
    setObject,
    setObjectValue,
    resetObject,
  };
}
