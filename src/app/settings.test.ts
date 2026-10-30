import { loadQuality, saveQuality } from './settings';

function memStorage() {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
}

test('ghi nhớ lựa chọn chất lượng', () => {
  const s = memStorage();
  expect(loadQuality(s)).toBe('high');
  saveQuality('low', s);
  expect(loadQuality(s)).toBe('low');
});

test('vẫn chạy khi localStorage ném lỗi', () => {
  const broken = {
    getItem: (): string | null => {
      throw new Error('blocked');
    },
    setItem: () => {
      throw new Error('blocked');
    },
  };
  expect(() => saveQuality('low', broken)).not.toThrow();
  expect(loadQuality(broken)).toBe('high');
});
