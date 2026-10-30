import { countKind, formatEquation, type Kind, type ZooObject } from './logic';

export interface ZooTask {
  kind: Kind;
  /** Số vật cần đưa đi (ếch xuống sông, cò bay đi, nến tắt). */
  need: number;
  /** Khóa giọng đọc. */
  voice: { task: string; question: string; tooMany: string };
  prompt: string;
  question: string;
  tooMany: (extra: number) => string;
  /** Điểm đến camera của nhiệm vụ. */
  waypoint: string;
}

// Bám SGK tr.73 bài 4: 10 − 2 = 8, 10 − 5 = 5, 10 − 3 = 7.
export const TASKS: ZooTask[] = [
  {
    kind: 'frog',
    need: 2,
    voice: { task: 'b4.task.frog', question: 'b4.q.frog', tooMany: 'b4.more.frog' },
    prompt: 'Hãy cho 2 bạn ếch nhảy xuống sông',
    question: 'Trên bờ còn mấy bạn ếch?',
    tooMany: (n) => `Nhiều quá rồi! Hãy kéo bớt ${n} bạn ếch lên bờ nhé`,
    waypoint: 'frogs',
  },
  {
    kind: 'stork',
    need: 5,
    voice: { task: 'b4.task.stork', question: 'b4.q.stork', tooMany: 'b4.more.stork' },
    prompt: 'Hãy cho 5 bạn cò bay lên trời',
    question: 'Còn lại mấy bạn cò?',
    tooMany: (n) => `Nhiều quá rồi! Hãy kéo bớt ${n} bạn cò xuống đất nhé`,
    waypoint: 'storks',
  },
  {
    kind: 'candle',
    need: 3,
    voice: { task: 'b4.task.candle', question: 'b4.q.candle', tooMany: 'b4.more.candle' },
    prompt: 'Hãy thổi tắt 3 ngọn nến (bấm vào ngọn nến)',
    question: 'Còn mấy ngọn nến đang cháy?',
    tooMany: (n) => `Nhiều quá rồi! Hãy thắp lại ${n} ngọn nến nhé`,
    waypoint: 'candles',
  },
];

export type StudentPhase = 'doing' | 'question' | 'done';

export interface StudentState {
  taskIndex: number;
  phase: StudentPhase;
  /** Lựa chọn phép tính của câu hỏi hiện tại. */
  choices: string[];
  /** Lựa chọn sai đã bấm, để làm mờ. */
  wrongChoices: string[];
}

export function initialStudent(): StudentState {
  return { taskIndex: 0, phase: 'doing', choices: [], wrongChoices: [] };
}

/** 3 lựa chọn: đúng, sai kết quả, sai số trừ. Thứ tự xáo theo nhiệm vụ để không luôn ở cùng chỗ. */
export function makeChoices(total: number, need: number, seed: number): string[] {
  const right = formatEquation({ a: total, b: need, c: total - need });
  const wrongResult = formatEquation({ a: total, b: need, c: total - need + (need % 2 ? 1 : -1) });
  const wrongB = formatEquation({ a: total, b: need + 1, c: total - need - 1 });
  const all = [right, wrongResult, wrongB];
  const r = seed % 3;
  return [...all.slice(r), ...all.slice(0, r)];
}

export type Progress =
  | { kind: 'not-enough'; left: number }
  | { kind: 'too-many'; extra: number }
  | { kind: 'exact' };

export function taskProgress(task: ZooTask, objs: ZooObject[]): Progress {
  const away = countKind(objs, task.kind).away;
  if (away < task.need) return { kind: 'not-enough', left: task.need - away };
  if (away > task.need) return { kind: 'too-many', extra: away - task.need };
  return { kind: 'exact' };
}

/** Cập nhật sau mỗi thao tác trong cảnh. Đủ số lượng thì sang câu hỏi; làm lệch lại thì quay về. */
export function onSceneChange(s: StudentState, objs: ZooObject[]): StudentState {
  if (s.phase === 'done') return s;
  const task = TASKS[s.taskIndex];
  const p = taskProgress(task, objs);
  if (s.phase === 'doing' && p.kind === 'exact') {
    const total = countKind(objs, task.kind).total;
    return { ...s, phase: 'question', choices: makeChoices(total, task.need, s.taskIndex + 1), wrongChoices: [] };
  }
  if (s.phase === 'question' && p.kind !== 'exact') return { ...s, phase: 'doing', choices: [], wrongChoices: [] };
  return s;
}

export function chooseAnswer(
  s: StudentState,
  objs: ZooObject[],
  choice: string,
): { state: StudentState; correct: boolean } {
  if (s.phase !== 'question') return { state: s, correct: false };
  const task = TASKS[s.taskIndex];
  const c = countKind(objs, task.kind);
  const right = formatEquation({ a: c.total, b: c.away, c: c.stay });
  if (choice !== right) return { state: { ...s, wrongChoices: [...s.wrongChoices, choice] }, correct: false };
  const nextIndex = s.taskIndex + 1;
  if (nextIndex >= TASKS.length) return { state: { ...s, phase: 'done' }, correct: true };
  return { state: { taskIndex: nextIndex, phase: 'doing', choices: [], wrongChoices: [] }, correct: true };
}
