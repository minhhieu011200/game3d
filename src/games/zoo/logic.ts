import { cabinPos, WHEEL } from './layout';
import { isInRiver, SKY_Y } from './world';

export type Kind = 'frog' | 'stork' | 'candle';
export type Zone = 'ground' | 'river' | 'sky' | 'wheel';

export interface ZooObject {
  id: string;
  kind: Kind;
  zone: Zone;
  /** Vị trí nghỉ (sau khi thả). */
  pos: [number, number, number];
  deleted: boolean;
  /** Chỉ dùng cho nến. */
  lit: boolean;
  /** Cabin vòng quay đang chứa nến (chỉ khi zone là 'wheel'). */
  slot?: number;
}

export const KINDS: Kind[] = ['frog', 'stork', 'candle'];
export const INITIAL_PER_KIND = 10;

/** Vùng mà vật thuộc về khi được thả tại vị trí này. */
export function zoneAt(kind: Kind, [x, y, z]: [number, number, number], onWheel = false): Zone {
  // nến trong cabin cao vẫn ở "trên vòng quay", không phải "trên trời"
  if (kind === 'candle' && onWheel) return 'wheel';
  if (y > SKY_Y) return 'sky';
  if (isInRiver(x, z)) return 'river';
  return 'ground';
}

/** Đưa vật tới chỗ mới ngoài vòng quay (nếu đang ở cabin thì cabin đó trống ra). */
export function moveObject(objs: ZooObject[], id: string, pos: [number, number, number], zone: Zone): ZooObject[] {
  return objs.map((o) => (o.id === id ? { ...o, pos, zone, slot: undefined } : o));
}

/** Gắn nến vào cabin `slot`; `pos` lưu vị trí cabin lúc vòng ở góc "nhà". */
export function attachToSlot(objs: ZooObject[], id: string, slot: number): ZooObject[] {
  return objs.map((o) => (o.id === id ? { ...o, zone: 'wheel', slot, pos: cabinPos(slot, 0) } : o));
}

/** Các cabin chưa có nến (`selfId`: nến đang kéo, cabin của nó coi như trống). */
export function freeSlots(objs: ZooObject[], selfId?: string): number[] {
  const used = new Set(objs.filter((o) => !o.deleted && o.zone === 'wheel' && o.id !== selfId).map((o) => o.slot));
  return Array.from({ length: WHEEL.slots }, (_, i) => i).filter((i) => !used.has(i));
}

/** Cabin trống gần điểm `p` nhất (đo tới giữa cabin) trong phạm vi `maxDist`, hoặc `null`. */
export function nearestFreeSlot(
  objs: ZooObject[],
  p: [number, number, number],
  angle: number,
  maxDist = 1.2,
  selfId?: string,
): number | null {
  let best: number | null = null;
  let bestD = maxDist;
  for (const i of freeSlots(objs, selfId)) {
    const [x, y, z] = cabinPos(i, angle);
    const d = Math.hypot(p[0] - x, p[1] - (y + 0.5), p[2] - z);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

export function deleteObject(objs: ZooObject[], id: string): ZooObject[] {
  return objs.map((o) => (o.id === id ? { ...o, deleted: true } : o));
}

export function toggleCandle(objs: ZooObject[], id: string): ZooObject[] {
  return objs.map((o) => (o.id === id && o.kind === 'candle' ? { ...o, lit: !o.lit } : o));
}

export interface Counts {
  total: number;
  /** Số còn ở chỗ ban đầu (ếch trên bờ, cò trên mặt đất, nến đang cháy). */
  stay: number;
  /** Số đã rời đi (ếch xuống sông/lên trời, cò bay đi, nến đã tắt). */
  away: number;
  byZone: Record<Zone, number>;
}

/** Thế nào là "rời đi" với từng loại, bám theo SGK: ếch nhảy xuống sông, cò bay đi, nến tắt. */
function isAway(o: ZooObject) {
  switch (o.kind) {
    case 'frog':
      return o.zone === 'river' || o.zone === 'sky';
    case 'stork':
      return o.zone === 'sky';
    case 'candle':
      return !o.lit || o.zone === 'sky';
  }
}

export function countKind(objs: ZooObject[], kind: Kind): Counts {
  const live = objs.filter((o) => o.kind === kind && !o.deleted);
  const byZone: Record<Zone, number> = { ground: 0, river: 0, sky: 0, wheel: 0 };
  for (const o of live) byZone[o.zone]++;
  const away = live.filter(isAway).length;
  return { total: live.length, away, stay: live.length - away, byZone };
}

export interface Equation {
  a: number;
  b: number;
  c: number;
}

export function equationFor(c: Counts): Equation {
  return { a: c.total, b: c.away, c: c.stay };
}

export function formatEquation(e: Equation) {
  return `${e.a} − ${e.b} = ${e.c}`;
}

export const KIND_LABELS: Record<Kind, { name: string; stay: string; away: string; all: string }> = {
  frog: { name: 'Ếch', stay: 'Trên bờ', away: 'Dưới sông', all: 'Tất cả' },
  stork: { name: 'Cò', stay: 'Còn lại', away: 'Bay đi', all: 'Tất cả' },
  candle: { name: 'Nến', stay: 'Đang cháy', away: 'Đã tắt', all: 'Tất cả' },
};

/** Dòng bảng đếm, ví dụ "Trên bờ: 8 · Dưới sông: 2 · Tất cả: 10". */
export function countLine(kind: Kind, c: Counts) {
  const l = KIND_LABELS[kind];
  return `${l.stay}: ${c.stay} · ${l.away}: ${c.away} · ${l.all}: ${c.total}`;
}
