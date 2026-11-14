import type { Question } from './questions';

/**
 * Bài 1 trình chiếu theo từng lần bấm của giáo viên:
 * 0 – 6 bông hoa vàng · 1 – bướm bay tới đậu (các bông đó chuyển đỏ) · 2 – hiện phép tính · 3 – hiện kết quả.
 * Bấm tiếp ở bước 3 thì sang câu sau; hết câu thì kết thúc.
 */
export type Step = 0 | 1 | 2 | 3;

export interface FlowerState {
  index: number;
  step: Step;
  finished: boolean;
}

export function initialState(): FlowerState {
  return { index: 0, step: 0, finished: false };
}

export function answerOf(q: Question) {
  return q.a - q.b;
}

/** Các bông bị bớt đi (bướm đậu, tô đỏ): `b` bông cuối hàng, giống hình SGK. */
export function pickedOf(q: Question): number[] {
  return Array.from({ length: q.b }, (_, k) => q.a - q.b + k);
}

/** Một lần bấm: hiện bước kế tiếp, hoặc sang câu sau, hoặc kết thúc. */
export function advance(s: FlowerState, qs: readonly Question[]): FlowerState {
  if (s.finished) return s;
  if (s.step < 3) return { ...s, step: (s.step + 1) as Step };
  if (s.index + 1 >= qs.length) return { ...s, finished: true };
  return { index: s.index + 1, step: 0, finished: false };
}
