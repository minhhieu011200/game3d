export type Quality = 'high' | 'low';

const KEY = 'trochoi-toan1.quality';

function safeStorage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

export function loadQuality(storage: Pick<Storage, 'getItem'> | undefined = safeStorage()): Quality {
  try {
    const v = storage?.getItem(KEY);
    return v === 'low' || v === 'high' ? v : 'high';
  } catch {
    return 'high';
  }
}

export function saveQuality(q: Quality, storage: Pick<Storage, 'setItem'> | undefined = safeStorage()) {
  try {
    storage?.setItem(KEY, q);
  } catch {
    // Trình duyệt chặn lưu trữ: vẫn dùng được, chỉ không nhớ lựa chọn.
  }
}
