import { create } from 'zustand';
import { sfx } from '../../shared/sound';
import { reportDone } from '../../tour/gateBridge';
import { DEFAULT_TARGET, generateRace, type Level, type Mode } from './levels';
import { allArrived, answer, initialRace, landed, validateLevel, type RaceState } from './logic';

interface BunnyStore extends RaceState {
  /** Số cần tìm của từng đội (chơi một mình thì chỉ dùng phần tử đầu). */
  targets: number[];
  /** Mỗi làn một màn: 1 làn khi chơi một mình, 2 làn khi hai đội. */
  levels: Level[];
  /** Lúc hai đội cùng xuất phát (ms, theo `now()`). */
  startedAt: number;
  /** Thời gian về đích của từng làn (ms); `null` khi chưa về. */
  times: (number | null)[];
  /** Làn `lane` trả lời ô trước mặt: Đúng (`true`) hay Sai (`false`). */
  answer(lane: number, saysEqual: boolean): void;
  /** Hoạt ảnh nhảy của thỏ làn `lane` đã xong. */
  landed(lane: number): void;
  /** Đổi chế độ thì bắt đầu màn mới, giữ các số đang chọn. */
  setMode(mode: Mode): void;
  /** Đội `lane` chọn số cần tìm; cả hai đội cùng xuất phát lại với màn mới. */
  setTarget(lane: number, target: number): void;
  /** Màn mới, giữ chế độ và các số đang chọn. */
  newLevel(): void;
  restart(): void;
}

export const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

function makeRace(targets: number[], mode: Mode) {
  const levels = generateRace(mode === 'teams' ? targets.slice(0, 2) : targets.slice(0, 1), Math.floor(Math.random() * 1e9));
  levels.forEach(validateLevel);
  return levels;
}

function fresh(targets: number[], mode: Mode) {
  const levels = makeRace(targets, mode);
  return { ...initialRace(levels, mode), levels, startedAt: now(), times: levels.map(() => null) };
}

export const useBunny = create<BunnyStore>()((set, get) => {
  return {
    ...fresh([DEFAULT_TARGET, DEFAULT_TARGET], 'solo'),
    targets: [DEFAULT_TARGET, DEFAULT_TARGET],
    answer(lane, saysEqual) {
      const r = answer(get(), get().levels, lane, saysEqual);
      if (r.event === 'ignored') return;
      // 'skipped' = em bấm Sai đúng lúc, cũng là trả lời đúng
      sfx(r.event === 'wrong' ? 'wrong' : 'correct');
      set(r.state);
    },
    landed(lane) {
      const before = get();
      const next = landed(before, before.levels, lane);
      if (next === before) return;
      const arrived = next.lanes[lane].phase === 'arrived';
      const times = arrived ? before.times.map((t, i) => (i === lane ? now() - before.startedAt : t)) : before.times;
      set({ ...next, times });
      if (!arrived) return;
      if (allArrived(next)) reportDone();
    },
    setMode(mode) {
      set({ mode });
      get().newLevel();
    },
    setTarget(lane, target) {
      set({ targets: get().targets.map((t, i) => (i === lane ? target : t)) });
      get().newLevel();
    },
    newLevel() {
      const { mode, targets } = get();
      set(fresh(targets, mode));
    },
    restart() {
      get().newLevel();
    },
  };
});
