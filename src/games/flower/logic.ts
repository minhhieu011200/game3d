import type { Question } from './questions';

export interface FlowerState {
  index: number;
  /** Các bông (0 … a−1) đã bấm để bớt đi, tô đỏ. */
  picked: number[];
  /** Câu hiện tại đã sai lần nào chưa. */
  missedCurrent: boolean;
  /** Số câu trả lời đúng ngay lần đầu. */
  firstTry: number;
  feedback: 'correct' | 'wrong' | null;
  /** Viên đá vừa bấm sai (để rung). */
  wrongValue: number | null;
  /** Lời nhắc: đã bớt đủ hoa / chưa bớt đủ hoa. */
  notice: 'enough' | 'needmore' | null;
  /** Các bông đã bớt của từng câu đã xong (cho bảng tổng kết). */
  history: number[][];
  finished: boolean;
}

export type ToggleEvent = 'picked' | 'unpicked' | 'blocked' | 'ignored';
export type AnswerEvent = 'correct' | 'wrong' | 'needmore' | 'ignored';

export function initialState(): FlowerState {
  return {
    index: 0,
    picked: [],
    missedCurrent: false,
    firstTry: 0,
    feedback: null,
    wrongValue: null,
    notice: null,
    history: [],
    finished: false,
  };
}

export function answerOf(q: Question) {
  return q.a - q.b;
}

const locked = (s: FlowerState) => s.finished || s.feedback === 'correct';

/** Bấm bông thứ `i`: bông vàng thì bớt đi (tô đỏ), bông đỏ thì trả lại. Không bớt quá `b` bông. */
export function toggleFlower(s: FlowerState, qs: Question[], i: number): { state: FlowerState; event: ToggleEvent } {
  const q = qs[s.index];
  if (locked(s) || i < 0 || i >= q.a) return { state: s, event: 'ignored' };
  if (s.picked.includes(i)) {
    return { state: { ...s, picked: s.picked.filter((x) => x !== i), notice: null, feedback: null }, event: 'unpicked' };
  }
  if (s.picked.length >= q.b) return { state: { ...s, notice: 'enough' }, event: 'blocked' };
  return { state: { ...s, picked: [...s.picked, i], notice: null, feedback: null }, event: 'picked' };
}

/** Viên đá số chỉ bấm được khi đã bớt đủ `b` bông. */
export function canAnswer(s: FlowerState, qs: Question[]) {
  return !locked(s) && s.picked.length === qs[s.index].b;
}

export function answer(s: FlowerState, qs: Question[], value: number): { state: FlowerState; event: AnswerEvent } {
  if (locked(s)) return { state: s, event: 'ignored' };
  if (!canAnswer(s, qs)) return { state: { ...s, notice: 'needmore' }, event: 'needmore' };
  if (value === answerOf(qs[s.index])) {
    return {
      state: { ...s, feedback: 'correct', wrongValue: null, notice: null, firstTry: s.firstTry + (s.missedCurrent ? 0 : 1) },
      event: 'correct',
    };
  }
  return { state: { ...s, feedback: 'wrong', wrongValue: value, notice: null, missedCurrent: true }, event: 'wrong' };
}

/** Sang câu kế tiếp sau khi đã hiện kết quả đúng; hết câu thì kết thúc. */
export function next(s: FlowerState, qs: Question[]): FlowerState {
  if (s.feedback !== 'correct') return s;
  const history = [...s.history, s.picked];
  if (s.index + 1 >= qs.length) return { ...s, history, feedback: null, finished: true };
  return { ...initialState(), index: s.index + 1, firstTry: s.firstTry, history };
}
