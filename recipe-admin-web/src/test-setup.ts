// BR-TEST: localStorage stub vì jsdom trong CI thiếu API này
const kho = new Map<string, string>();

const banSao = {
  getItem: (khoa: string): string | null => (kho.has(khoa) ? (kho.get(khoa) as string) : null),
  setItem: (khoa: string, giaTri: string): void => {
    kho.set(khoa, String(giaTri));
  },
  removeItem: (khoa: string): void => {
    kho.delete(khoa);
  },
  clear: (): void => {
    kho.clear();
  },
  get length(): number {
    return kho.size;
  },
  key: (viTri: number): string | null => [...kho.keys()][viTri] ?? null,
};

Object.defineProperty(globalThis, 'localStorage', { value: banSao, writable: true });
