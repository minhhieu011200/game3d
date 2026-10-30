import { create } from 'zustand';
import { audio, sfx } from '../../audio/AudioManager';
import { randomPraise, randomRetry } from '../../audio/voiceLines';
import { reportDone } from '../../tour/gateBridge';
import { DEFAULT_TARGET, generateRace, type Level, type Mode } from './levels';
import { allArrived, answer, initialRace, landed, TEAMS, validateLevel, type AnswerEvent, type RaceState } from './logic';

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
  const react = (event: AnswerEvent) => {
    if (event === 'correct') {
      sfx('correct');
      audio.say(randomPraise(), { interrupt: true });
    } else if (event === 'skipped') {
      sfx('hop');
    } else if (event === 'wrong') {
      sfx('wrong');
      audio.say(randomRetry(), { interrupt: true });
    }
  };

  return {
    ...fresh([DEFAULT_TARGET, DEFAULT_TARGET], 'solo'),
    targets: [DEFAULT_TARGET, DEFAULT_TARGET],
    answer(lane, saysEqual) {
      const r = answer(get(), get().levels, lane, saysEqual);
      if (r.event === 'ignored') return;
      set(r.state);
      react(r.event);
    },
    landed(lane) {
      const before = get();
      const next = landed(before, before.levels, lane);
      if (next === before) return;
      const arrived = next.lanes[lane].phase === 'arrived';
      const times = arrived ? before.times.map((t, i) => (i === lane ? now() - before.startedAt : t)) : before.times;
      set({ ...next, times });
      if (next.lanes[lane].phase === 'toGarden') sfx('hop');
      if (!arrived) return;
      sfx('win');
      if (allArrived(next)) reportDone();
      if (next.mode === 'solo') audio.say(['b2.carrot', 'finish'], { interrupt: true });
      else if (before.winner === null) audio.say(`b2.win.${TEAMS[lane].key}`, { interrupt: true });
      else if (allArrived(next)) audio.say('b2.carrot', { interrupt: true });
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
      // hai đội cùng số thì đọc đề; khác số thì mỗi đội xem số trên phần sân của mình
      if (mode === 'solo' || targets[0] === targets[1]) audio.say(`b2.intro.${targets[0]}`, { interrupt: true });
      else audio.stop();
    },
    restart() {
      get().newLevel();
    },
  };
});
