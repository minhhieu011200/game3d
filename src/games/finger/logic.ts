import type { Question } from './questions';

export interface FingerState {
  index: number;
  /** Câu hiện tại đã sai lần nào chưa. */
  missedCurrent: boolean;
  /** Số câu trả lời đúng ngay lần đầu. */
  firstTry: number;
  /** Phản hồi của lần trả lời gần nhất, để hiển thị. */
  feedback: 'correct' | 'wrong' | null;
  finished: boolean;
}

export type AnswerEvent = 'correct' | 'wrong' | 'ignored';

export function initialState(): FingerState {
  return { index: 0, missedCurrent: false, firstTry: 0, feedback: null, finished: false };
}

export function answerOf(q: Question) {
  return q.a - q.b;
}

/** Nhận một đáp án (từ ngón tay đã chốt hoặc bàn phím). Câu đúng chưa chuyển ngay, xem `next`. */
export function answer(s: FingerState, qs: Question[], value: number): { state: FingerState; event: AnswerEvent } {
  if (s.finished || s.feedback === 'correct') return { state: s, event: 'ignored' };
  if (value === answerOf(qs[s.index])) {
    return {
      state: { ...s, feedback: 'correct', firstTry: s.firstTry + (s.missedCurrent ? 0 : 1) },
      event: 'correct',
    };
  }
  return { state: { ...s, feedback: 'wrong', missedCurrent: true }, event: 'wrong' };
}

/** Sang câu kế tiếp sau khi đã hiện phép tính đúng; hết câu thì kết thúc. */
export function next(s: FingerState, qs: Question[]): FingerState {
  if (s.feedback !== 'correct') return s;
  if (s.index + 1 >= qs.length) return { ...s, feedback: null, finished: true };
  return { ...s, index: s.index + 1, missedCurrent: false, feedback: null };
}
