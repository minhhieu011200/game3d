// Hàng đợi hiệu ứng hạt: luật chơi (store) phát sự kiện, cảnh 3D (<Effects>) lấy ra và vẽ.

export type EffectKind = 'splash' | 'feathers';

export interface EffectEvent {
  kind: EffectKind;
  pos: [number, number, number];
}

const queue: EffectEvent[] = [];

export function emitEffect(kind: EffectKind, pos: [number, number, number]) {
  // không tích mãi khi cảnh chưa vẽ (ví dụ đang ở màn khác)
  if (queue.length < 32) queue.push({ kind, pos });
}

/** Lấy hết sự kiện đang chờ (và xoá khỏi hàng đợi). */
export function takeEffects(): EffectEvent[] {
  return queue.splice(0);
}
