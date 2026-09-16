import { useEffect, useState } from 'react';

export function useDebounce<T>(giaTri: T, doTreMs = 400): T {
  const [daTreo, setDaTreo] = useState(giaTri);
  useEffect(() => {
    const henGio = setTimeout(() => setDaTreo(giaTri), doTreMs);
    return () => clearTimeout(henGio);
  }, [giaTri, doTreMs]);
  return daTreo;
}
