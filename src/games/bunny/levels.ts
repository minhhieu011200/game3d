export interface Tile {
  id: string;
  /** Số bị trừ. */
  a: number;
  /** Số trừ. */
  b: number;
}

export interface Level {
  /** Kết quả cần tìm. */
  target: number;
  /** Các ô theo đúng thứ tự thỏ đi qua, từ ô Bắt đầu tới vườn cà rốt. */
  tiles: Tile[];
}

/** Chơi một mình (1 làn) hay hai đội (2 làn). */
export type Mode = 'solo' | 'teams';

export const TARGETS = [2, 3, 4, 5, 6, 7, 8, 9] as const;
export const DEFAULT_TARGET = 4;
const PATH_LENGTH = 7;
const MAX_CORRECT = 4;

/** Số ô đúng của màn: tối đa 4, ít hơn khi mục tiêu lớn chỉ có ít phép trừ (7 chỉ có 8−1, 9−2, 10−3). */
export function correctCount(target: number) {
  return Math.max(2, Math.min(MAX_CORRECT, 10 - target));
}

export function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(arr: T[], r: () => number): T {
  return arr[Math.floor(r() * arr.length)];
}

/**
 * Sinh một màn: 7 ô, trong đó `correctCount(target)` ô có kết quả bằng `target`.
 * Mọi phép trừ có số bị trừ ≤ 10, số trừ ≥ 1, kết quả ≥ 0, không lặp lại.
 * Ô sai có kết quả gần `target` (lệch 1–2) để học sinh phải tính thật.
 * Ô đầu tiên luôn đúng; cố gắng không để 3 ô sai liền nhau (màn ít ô đúng thì không tránh được).
 */
export function generateLevel(target: number, seed: number): Level {
  const r = rng(seed);
  const right: Array<[number, number]> = [];
  for (let a = target + 1; a <= 10; a++) right.push([a, a - target]);
  const wrong: Array<[number, number]> = [];
  for (let a = 1; a <= 10; a++)
    for (let b = 1; b <= a; b++) {
      const d = Math.abs(a - b - target);
      if (d >= 1 && d <= 2) wrong.push([a, b]);
    }

  const used = new Set<string>();
  const take = (pool: Array<[number, number]>) => {
    const free = pool.filter(([a, b]) => !used.has(`${a}-${b}`));
    // mục tiêu 9 chỉ có một phép đúng (10 − 1): cho phép lặp lại khi hết lựa chọn
    const [a, b] = pick(free.length ? free : pool, r);
    used.add(`${a}-${b}`);
    return [a, b] as [number, number];
  };

  // Xếp thứ tự đúng/sai: ô đầu đúng, không quá 2 ô sai liền nhau.
  let pattern: boolean[] = [];
  for (let tries = 0; tries < 100; tries++) {
    const slots = Array.from({ length: PATH_LENGTH - 1 }, (_, i) => i < correctCount(target) - 1);
    for (let i = slots.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [slots[i], slots[j]] = [slots[j], slots[i]];
    }
    pattern = [true, ...slots];
    if (!pattern.some((_, i) => i >= 2 && !pattern[i] && !pattern[i - 1] && !pattern[i - 2])) break;
  }

  const tiles = pattern.map((ok, i) => {
    const [a, b] = take(ok ? right : wrong);
    return { id: `t${i}`, a, b };
  });
  return { target, tiles };
}

const sequence = (lv: Level) => lv.tiles.map((t) => `${t.a}-${t.b}`).join(',');

/**
 * Sinh các làn của một màn: mỗi làn một mục tiêu (`targets[i]`), 1 làn khi chơi một mình, 2 làn khi hai đội.
 * Hai đội có thể chọn số khác nhau. Nếu cùng số thì hai làn khác dãy phép tính để đội này không chép được đội kia.
 */
export function generateRace(targets: number[], seed: number): Level[] {
  const first = generateLevel(targets[0], seed);
  if (targets.length < 2) return [first];
  let second = generateLevel(targets[1], seed + 1);
  for (let k = 2; k <= 20 && sequence(second) === sequence(first); k++) second = generateLevel(targets[1], seed + k);
  return [first, second];
}
