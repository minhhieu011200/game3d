import type { Level, Mode } from './levels';

/** Trạng thái chuyển động của một làn: hai đội đua cùng lúc nên mỗi làn có trạng thái riêng. */
export type LanePhase = 'idle' | 'hopping' | 'returning' | 'toGarden' | 'arrived';
export type TileMark = 'unknown' | 'correct' | 'skipped';

/** Hai đội theo thứ tự làn: làn 0 là Đội Đỏ (bên trái), làn 1 là Đội Xanh (bên phải). */
export const TEAMS = [
  { key: 'red', name: 'Đội Đỏ' },
  { key: 'blue', name: 'Đội Xanh' },
] as const;

export interface LaneState {
  /** Chỉ số ô thỏ đang đứng: -1 = vạch xuất phát, tiles.length = hàng rào cà rốt. */
  pos: number;
  marks: TileMark[];
  /** Số cà rốt (ô bằng mục tiêu) đã qua trong lượt đi này. */
  carrots: number;
  /** Số lần nhầm trong cả màn. */
  mistakes: number;
  /** Ô vừa nhầm, để rung đỏ. */
  wrongId: string | null;
  phase: LanePhase;
}

export interface RaceState {
  mode: Mode;
  lanes: LaneState[];
  /** Làn về đích trước (về nhất); đội còn lại vẫn chơi tiếp cho tới khi về đích. */
  winner: number | null;
}

export type AnswerEvent = 'correct' | 'skipped' | 'wrong' | 'ignored';

export function result(a: number, b: number) {
  return a - b;
}

export function validateLevel(level: Level) {
  for (const t of level.tiles) {
    if (t.a > 10) throw new Error(`Phép ${t.a} − ${t.b}: số bị trừ vượt quá 10`);
    if (t.a - t.b < 0) throw new Error(`Phép ${t.a} − ${t.b}: kết quả âm`);
  }
  if (requiredCount(level) === 0) throw new Error(`Màn chơi không có ô nào bằng ${level.target}`);
}

/** Số ô có kết quả bằng mục tiêu, cũng là số cà rốt cần nhặt trên làn. */
export function requiredCount(level: Level) {
  return level.tiles.filter((t) => result(t.a, t.b) === level.target).length;
}

export function initialLane(level: Level): LaneState {
  return { pos: -1, marks: level.tiles.map(() => 'unknown'), carrots: 0, mistakes: 0, wrongId: null, phase: 'idle' };
}

export function initialRace(levels: Level[], mode: Mode): RaceState {
  return { mode, lanes: levels.map(initialLane), winner: null };
}

/** Màn chơi kết thúc khi mọi thỏ đã vào hàng rào cà rốt. */
export function allArrived(s: RaceState) {
  return s.lanes.every((l) => l.phase === 'arrived');
}

/** Ô ngay trước mặt thỏ (chỉ ô này được trả lời: không nhảy cóc). */
export function nextIndex(lane: LaneState) {
  return lane.pos + 1;
}

function withLane(s: RaceState, i: number, lane: LaneState): RaceState {
  return { ...s, lanes: s.lanes.map((l, k) => (k === i ? lane : l)) };
}

/**
 * Làn `laneIdx` trả lời ô trước mặt: `saysEqual` là "Đúng" (bằng mục tiêu) hay "Sai".
 * Phán khớp thì thỏ nhảy lên ô; phán nhầm thì thỏ về vạch xuất phát, đi lại từ đầu.
 * Mỗi làn chỉ bị khoá khi chính thỏ của làn đó đang nhảy hoặc đã về đích; đội kia về trước vẫn không ảnh hưởng.
 */
export function answer(s: RaceState, levels: Level[], laneIdx: number, saysEqual: boolean): { state: RaceState; event: AnswerEvent } {
  const lane = s.lanes[laneIdx];
  if (!lane || lane.phase !== 'idle') return { state: s, event: 'ignored' };
  const level = levels[laneIdx];
  const i = nextIndex(lane);
  if (i >= level.tiles.length) return { state: s, event: 'ignored' };
  const t = level.tiles[i];
  const equal = result(t.a, t.b) === level.target;

  if (saysEqual !== equal) {
    const back: LaneState = { ...initialLane(level), mistakes: lane.mistakes + 1, wrongId: t.id, phase: 'returning' };
    return { state: withLane(s, laneIdx, back), event: 'wrong' };
  }
  const marks = lane.marks.slice();
  marks[i] = equal ? 'correct' : 'skipped';
  const moved: LaneState = { ...lane, pos: i, marks, carrots: lane.carrots + (equal ? 1 : 0), wrongId: null, phase: 'hopping' };
  return { state: withLane(s, laneIdx, moved), event: equal ? 'correct' : 'skipped' };
}

/** Gọi khi hoạt ảnh nhảy của thỏ làn `laneIdx` kết thúc. */
export function landed(s: RaceState, levels: Level[], laneIdx: number): RaceState {
  const lane = s.lanes[laneIdx];
  if (!lane) return s;
  const n = levels[laneIdx].tiles.length;
  switch (lane.phase) {
    case 'hopping':
      return withLane(s, laneIdx, lane.pos >= n - 1 ? { ...lane, pos: n, phase: 'toGarden' } : { ...lane, phase: 'idle' });
    case 'returning':
      return withLane(s, laneIdx, { ...lane, wrongId: null, phase: 'idle' });
    case 'toGarden':
      return { ...withLane(s, laneIdx, { ...lane, phase: 'arrived' }), winner: s.winner ?? laneIdx };
    default:
      return s;
  }
}
